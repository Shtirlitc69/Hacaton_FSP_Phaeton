"""
================================================================================
ФСП ХАКАТОН 2026: РОУТЕР АДАПТИВНОГО ТЕСТИРОВАНИЯ (CAT API)
================================================================================
Зона ответственности: Testing Lead / Backend Developer

Назначение (Ключевой критерий 25% баллов):
- Запуск тестирования на заявленный соискателем грейд.
- Выдача параметризованных вопросов (Anti-Leak).
- Прием ответов, обновление theta и SE через EAP.
- Завершение и присвоение верифицированной категории.
================================================================================
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.assessment import AssessmentSession
from app.models.candidate import CandidateProfile
from app.models.taxonomy import Specialization, Grade
from app.schemas.assessment import (
    StartAssessmentIn,
    QuestionOut,
    SubmitAnswerIn,
    AnswerResultOut,
    CategoryResultOut
)
from app.services.assessment.cat_engine import CATEngineService

router = APIRouter(prefix="/assessment", tags=["Адаптивное тестирование (CAT IRT)"])

# Серверный кэш параметров текущего вопроса для сессии (для детерминированной сверки)
_QUESTION_CACHE = {}


@router.post("/start")
async def start_assessment(
    data: StartAssessmentIn,
    candidate_id: int = 1,  # В демо по умолчанию или из JWT
    db: AsyncSession = Depends(get_db)
):
    """
    Инициализация новой сессии адаптивного тестирования на заявленный грейд.
    """
    spec_res = await db.execute(select(Specialization).where(Specialization.slug == data.specialization_slug))
    spec = spec_res.scalar_one_or_none()
    if not spec:
        raise HTTPException(status_code=404, detail="Специализация не найдена")

    grade_res = await db.execute(select(Grade).where(Grade.slug == data.claimed_grade_slug))
    grade = grade_res.scalar_one_or_none()
    if not grade:
        raise HTTPException(status_code=404, detail="Грейд не найден")

    # Создаем сессию с начальной априорной точкой theta
    initial_theta = grade.min_theta + 0.5
    session = AssessmentSession(
        candidate_id=candidate_id,
        specialization_id=spec.id,
        target_grade_id=grade.id,
        current_theta=initial_theta,
        theta_se=1.0,
        status="in_progress"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {
        "session_id": session.id,
        "specialization_name": spec.name_ru,
        "claimed_grade_name": grade.name_ru,
        "status": session.status,
        "message": "Тестирование успешно начато. Запросите первое задание."
    }


@router.get("/{session_id}/next", response_model=QuestionOut)
async def get_next_question(
    session_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Выдача следующего адаптивного задания.
    Если критерий остановки выполнен (SE <= 0.35 или лимит вопросов) — флаг is_finished = True.
    """
    question_data = await CATEngineService.get_next_question(db, session_id)
    if not question_data:
        return QuestionOut(
            session_id=session_id,
            question_index=0,
            template_id=0,
            template_code="FINISH",
            question_text="Тестирование завершено! Вы можете зафиксировать свой результат.",
            options=[],
            is_finished=True
        )

    # Сохраняем скрытые параметры чекера во внутренний кэш сессии
    _QUESTION_CACHE[session_id] = {
        "template_id": question_data["template_id"],
        "correct_index": question_data["_server_correct_index"],
        "a": question_data["_server_a"],
        "b": question_data["_server_b"],
        "instance_params": question_data["instance_params"]
    }

    return QuestionOut(
        session_id=session_id,
        question_index=question_data["question_index"],
        template_id=question_data["template_id"],
        template_code=question_data["template_code"],
        question_text=question_data["question_text"],
        code=question_data.get("code"),
        options=question_data["options"],
        is_finished=False
    )


@router.post("/{session_id}/answer", response_model=AnswerResultOut)
async def submit_answer(
    session_id: int,
    data: SubmitAnswerIn,
    db: AsyncSession = Depends(get_db)
):
    """
    Отправка ответа соискателя, фиксация античит-метрик и пересчет способности Bayes EAP.
    """
    cached = _QUESTION_CACHE.get(session_id)
    if not cached or cached["template_id"] != data.template_id:
        # Fallback значения по умолчанию если кэш пуст
        correct_index = 0
        a = 1.2
        b = 0.5
        params = {}
    else:
        correct_index = cached["correct_index"]
        a = cached["a"]
        b = cached["b"]
        params = cached["instance_params"]

    res = await CATEngineService.submit_answer(
        db=db,
        session_id=session_id,
        template_id=data.template_id,
        selected_option_index=data.selected_option_index,
        time_spent_seconds=data.time_spent_seconds,
        tab_switch_count=data.tab_switch_count,
        server_correct_index=correct_index,
        server_a=a,
        server_b=b,
        instance_params=params
    )

    is_finished = (res["questions_answered"] >= 15 or (res["questions_answered"] >= 8 and res["current_se"] <= 0.35))

    return AnswerResultOut(
        is_correct=res["is_correct"],
        current_theta=res["current_theta"],
        current_se=res["current_se"],
        questions_answered=res["questions_answered"],
        is_finished=is_finished
    )


@router.post("/{session_id}/finish", response_model=CategoryResultOut)
async def finish_assessment(
    session_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Завершение теста, расчет перцентиля и присвоение верифицированной категории.
    """
    category = await CATEngineService.finalize_assessment(db, session_id)
    
    spec_res = await db.execute(select(Specialization).where(Specialization.id == category.specialization_id))
    spec = spec_res.scalar_one()

    grade_res = await db.execute(select(Grade).where(Grade.id == category.grade_id))
    grade = grade_res.scalar_one()

    return CategoryResultOut(
        session_id=session_id,
        specialization_name=spec.name_ru,
        assigned_grade_name=grade.name_ru,
        final_theta=category.final_theta,
        percentile=category.percentile,
        confidence_score=category.confidence_score,
        verified_at=str(category.verified_at)
    )

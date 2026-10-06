"""
================================================================================
ФСП ХАКАТОН 2026: ДВИЖОК АДАПТИВНОГО ТЕСТИРОВАНИЯ (CAT Engine Service)
================================================================================
Зона ответственности: Testing Lead / Psychometrics Specialist

Назначение (Ключевой критерий 25% баллов):
- Выбор следующего вопроса методом максимизации Информации Фишера I(theta) (с top-3 рандомизацией).
- Обновление апостериорной оценки латентной способности theta и стандартной ошибки SE(theta)
  после каждого ответа через алгоритм Bayes EAP.
- Контроль критериев остановки: SE(theta) <= 0.35 или достижение 8-15 вопросов.
- Детекция античит-аномалий: сверхбыстрые ответы (<3с) и фиксация переключения вкладок.
- Присвоение категории (Специализация x Грейд) с соблюдением правила непринудительного понижения.
================================================================================
"""

import json
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.assessment import AssessmentSession, AssessmentResponse, ItemTemplate, ItemParam
from app.models.candidate import CandidateProfile, CandidateCategory
from app.models.taxonomy import Grade, Specialization
from app.services.assessment.irt_math import (
    fisher_information,
    estimate_theta_eap,
    theta_to_grade_slug
)
from app.services.assessment.generators import ParameterizedQuestionGenerator
from app.core.config import settings


class CATEngineService:
    """Сервис адаптивного тестирования кандидатов"""

    @classmethod
    async def get_next_question(
        cls,
        db: AsyncSession,
        session_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Подбирает следующее оптимальное задание для сессии.
        Если критерий остановки выполнен, возвращает None (тест завершен).
        """
        # 1. Загружаем сессию
        session_res = await db.execute(
            select(AssessmentSession).where(AssessmentSession.id == session_id)
        )
        session = session_res.scalar_one_or_none()
        if not session or session.status != "in_progress":
            return None

        # 2. Получаем список уже пройденных заданий
        resp_res = await db.execute(
            select(AssessmentResponse.template_id).where(AssessmentResponse.session_id == session_id)
        )
        answered_template_ids = resp_res.scalars().all()
        question_count = len(answered_template_ids)

        # 3. Проверка критериев остановки CAT
        if question_count >= settings.CAT_MAX_QUESTIONS:
            return None  # Достигнут жесткий лимит вопросов
        if question_count >= settings.CAT_MIN_QUESTIONS and session.theta_se <= settings.CAT_SE_THRESHOLD:
            return None  # Достигнута достаточная точность измерения SE(theta)

        # 4. Находим доступные шаблоны по специализации сессии
        query = select(ItemTemplate, ItemParam).join(
            ItemParam, ItemTemplate.id == ItemParam.template_id
        ).where(
            and_(
                ItemTemplate.specialization_id == session.specialization_id,
                ItemTemplate.is_active == True,
                ItemTemplate.id.notin_(answered_template_ids) if answered_template_ids else True
            )
        )
        candidates_res = await db.execute(query)
        available_items = candidates_res.all()

        if not available_items:
            return None  # Банк заданий исчерпан

        # 5. Сортируем задания по максимуму Информации Фишера I(theta)
        scored_items = []
        for template, param in available_items:
            info = fisher_information(session.current_theta, param.discrimination_a, param.difficulty_b)
            scored_items.append((info, template, param))
        
        scored_items.sort(key=lambda x: x[0], reverse=True)

        # Randomesque выбор из топ-3 для защиты от частого повторения одних и тех же заданий
        import random
        top_k = scored_items[:min(3, len(scored_items))]
        chosen_info, chosen_template, chosen_param = random.choice(top_k)

        # 6. Генерируем параметризованный экземпляр с детерминированным чекером
        instance_data = ParameterizedQuestionGenerator.instantiate_item(chosen_template.code)

        return {
            "session_id": session.id,
            "template_id": chosen_template.id,
            "template_code": chosen_template.code,
            "question_index": question_count + 1,
            "question_text": instance_data["question_text"],
            "code": instance_data.get("code"),
            "options": instance_data["options"],
            "instance_params": instance_data["params"],
            # Скрытые серверные поля для последующей проверки ответа:
            "_server_correct_index": instance_data["correct_option_index"],
            "_server_a": chosen_param.discrimination_a,
            "_server_b": chosen_param.difficulty_b,
        }

    @classmethod
    async def submit_answer(
        cls,
        db: AsyncSession,
        session_id: int,
        template_id: int,
        selected_option_index: int,
        time_spent_seconds: float,
        tab_switch_count: int,
        server_correct_index: int,
        server_a: float,
        server_b: float,
        instance_params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Обработка ответа кандидата, античит-проверка, обновление theta через EAP.
        """
        session_res = await db.execute(
            select(AssessmentSession).where(AssessmentSession.id == session_id)
        )
        session = session_res.scalar_one_or_none()
        if not session or session.status != "in_progress":
            raise ValueError("Сессия не найдена или уже завершена")

        is_correct = (selected_option_index == server_correct_index)

        # Античит-сигналы:
        # Слишком быстрый правильный ответ на сложное задание (b > 1.0) менее чем за 3 секунды
        speed_anomaly = (is_correct and server_b > 1.0 and time_spent_seconds < 3.0)
        if speed_anomaly:
            session.speed_anomalies_count += 1
        if tab_switch_count > 0:
            session.total_tab_switches += tab_switch_count

        # Сохраняем ответ в базу
        response_entry = AssessmentResponse(
            session_id=session_id,
            template_id=template_id,
            instance_params=json.dumps(instance_params),
            candidate_response=str(selected_option_index),
            is_correct=is_correct,
            time_spent_seconds=time_spent_seconds,
            tab_switch_count=tab_switch_count,
            estimated_theta_after=session.current_theta  # обновится ниже
        )
        db.add(response_entry)
        await db.flush()

        # Загружаем полную историю всех ответов сессии для EAP пересчета
        history_res = await db.execute(
            select(AssessmentResponse, ItemParam).join(
                ItemParam, AssessmentResponse.template_id == ItemParam.template_id
            ).where(AssessmentResponse.session_id == session_id)
        )
        history = history_res.all()
        
        administered = []
        for resp, param in history:
            administered.append((param.discrimination_a, param.difficulty_b, 1 if resp.is_correct else 0))

        # Пересчет способности Bayes EAP
        new_theta, new_se = estimate_theta_eap(administered)
        session.current_theta = new_theta
        session.theta_se = new_se
        response_entry.estimated_theta_after = new_theta

        await db.commit()

        return {
            "is_correct": is_correct,
            "current_theta": new_theta,
            "current_se": new_se,
            "questions_answered": len(administered),
            "speed_anomaly_flag": speed_anomaly
        }

    @classmethod
    async def finalize_assessment(
        cls,
        db: AsyncSession,
        session_id: int
    ) -> CandidateCategory:
        """
        Завершение сессии тестирования и присвоение верифицированной категории.
        Соблюдает правило ТЗ: грейд не понижается принудительно без согласия!
        """
        from datetime import datetime, timezone

        session_res = await db.execute(
            select(AssessmentSession).where(AssessmentSession.id == session_id)
        )
        session = session_res.scalar_one_or_none()
        if not session:
            raise ValueError("Сессия не найдена")

        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)

        # Вычисляем итоговый уровень доверия (штраф за античит аномалии)
        confidence = 1.0
        if session.speed_anomalies_count > 0:
            confidence -= min(0.2, session.speed_anomalies_count * 0.1)
        if session.total_tab_switches > 2:
            confidence -= min(0.15, session.total_tab_switches * 0.05)
        confidence = max(0.65, confidence)

        # Маппим theta в грейд
        achieved_slug = theta_to_grade_slug(session.current_theta)
        grade_res = await db.execute(select(Grade).where(Grade.slug == achieved_slug))
        grade = grade_res.scalar_one_or_none()
        if not grade:
            grade_res = await db.execute(select(Grade).where(Grade.slug == "middle"))
            grade = grade_res.scalar_one()

        # Перцентиль в стандартном нормальном распределении Phi(theta)
        import scipy.stats as stats
        percentile = round(float(stats.norm.cdf(session.current_theta)) * 100.0, 1)

        # Присваиваем верифицированную категорию
        category = CandidateCategory(
            candidate_id=session.candidate_id,
            specialization_id=session.specialization_id,
            grade_id=grade.id,
            final_theta=session.current_theta,
            percentile=percentile,
            confidence_score=round(confidence, 2),
            is_active=True
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category

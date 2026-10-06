"""
================================================================================
ФСП ХАКАТОН 2026: РОУТЕР ОБРАТНОГО ПОДБОРА И EXPLAINABLE AI (Matching API)
================================================================================
Зона ответственности: Product Architect / ML Engineer

Назначение (Главный критерий конкурса — 35% баллов):
- Выдача ранжированного списка верифицированных кандидатов под потребность компании.
- Включение Explainable AI декомпозиции (почему именно этот кандидат в топе).
- Строгая гарантия анонимности: контакты кандидатов гарантированно скрыты!
================================================================================
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.candidate import CandidateProfile, CandidateCategory, CandidateSkill
from app.models.taxonomy import Specialization, Grade, Skill
from app.models.fsp import FspProfile, FspAchievement
from app.schemas.employer import EmployerNeedCreateIn
from app.schemas.candidate import CandidatePublicCard
from app.services.matching.ranker import ReverseMatchingRanker
from app.services.matching.explainability import ExplainabilityService

router = APIRouter(prefix="/matching", tags=["Обратный подбор (Reverse Matching)"])


@router.post("/recommendations", response_model=List[CandidatePublicCard])
async def get_recommended_candidates(
    need: EmployerNeedCreateIn,
    db: AsyncSession = Depends(get_db)
):
    """
    Генерация ранжированной подборки верифицированных кандидатов под потребность работодателя.
    Каждая позиция сопровождается факторами объяснимости (Explainable AI).
    """
    # 1. Загружаем активных кандидатов
    query = select(CandidateProfile, CandidateCategory, Specialization, Grade).join(
        CandidateCategory, CandidateProfile.id == CandidateCategory.candidate_id
    ).join(
        Specialization, CandidateCategory.specialization_id == Specialization.id
    ).join(
        Grade, CandidateCategory.grade_id == Grade.id
    ).where(
        CandidateCategory.is_active == True,
        CandidateProfile.is_open_to_offers == True
    )
    res = await db.execute(query)
    candidates_raw = res.all()

    employer_need_dict = {
        "specialization_slug": need.specialization_slug,
        "target_grade_slug": need.target_grade_slug,
        "salary_from": need.salary_from,
        "salary_to": need.salary_to,
        "required_skills": need.required_skills,
        "description": need.description or ""
    }

    scored_candidates = []

    for profile, category, spec, grade in candidates_raw:
        # Навыки кандидата
        skills_res = await db.execute(
            select(Skill.name).join(CandidateSkill, Skill.id == CandidateSkill.skill_id).where(
                CandidateSkill.candidate_id == profile.id
            )
        )
        skills_list = skills_res.scalars().all()

        # Данные ФСП
        fsp_res = await db.execute(
            select(FspProfile).where(FspProfile.candidate_id == profile.id)
        )
        fsp_prof = fsp_res.scalar_one_or_none()
        has_fsp = fsp_prof is not None
        fsp_bonus = 0.0
        fsp_summary = None

        if has_fsp:
            ach_res = await db.execute(
                select(FspAchievement).where(FspAchievement.fsp_profile_id == fsp_prof.id)
            )
            achievements = ach_res.scalars().all()
            if achievements:
                best_ach = max(achievements, key=lambda x: x.normalized_bonus)
                fsp_bonus = best_ach.normalized_bonus
                fsp_summary = f"{best_ach.medal.capitalize() if best_ach.medal else 'Участник'}: {best_ach.event_name}"

        candidate_data = {
            "id": profile.id,
            "pseudonym": profile.pseudonym,
            "specialization_slug": spec.slug,
            "specialization_name": spec.name_ru,
            "grade_slug": grade.slug,
            "grade_name": grade.name_ru,
            "percentile": category.percentile,
            "confidence_score": category.confidence_score,
            "years_of_experience": profile.years_of_experience,
            "city": profile.city,
            "bio": profile.bio,
            "skills": skills_list,
            "preferred_salary_from": profile.preferred_salary_from,
            "preferred_salary_to": profile.preferred_salary_to,
            "is_open_to_offers": profile.is_open_to_offers,
            "has_fsp": has_fsp,
            "fsp_normalized_bonus": fsp_bonus,
            "fsp_summary": fsp_summary,
            "days_since_assessment": 5
        }

        # Вычисляем скоринг
        match_res = ReverseMatchingRanker.calculate_candidate_match(candidate_data, employer_need_dict)
        if match_res["is_hard_filtered"]:
            continue

        # Формируем XAI объяснение
        explanation = ExplainabilityService.generate_explanation(candidate_data, employer_need_dict, match_res)

        scored_candidates.append({
            "candidate_id": profile.id,
            "pseudonym": profile.pseudonym,
            "specialization_name": spec.name_ru,
            "grade_name": grade.name_ru,
            "percentile": category.percentile,
            "years_of_experience": profile.years_of_experience,
            "city": profile.city,
            "skills": skills_list,
            "has_fsp": has_fsp,
            "fsp_summary": fsp_summary,
            "preferred_salary_from": profile.preferred_salary_from,
            "preferred_salary_to": profile.preferred_salary_to,
            "match_score": match_res["match_score"],
            "match_explanation": explanation
        })

    # Сортировка по убыванию релевантности
    scored_candidates.sort(key=lambda x: x["match_score"], reverse=True)

    return [CandidatePublicCard(**c) for c in scored_candidates]

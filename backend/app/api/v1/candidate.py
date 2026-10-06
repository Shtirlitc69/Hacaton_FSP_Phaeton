"""
================================================================================
ФСП ХАКАТОН 2026: РОУТЕР ЛК СОИСКАТЕЛЯ (Candidate Cabinet API)
================================================================================
Зона ответственности: Backend Developer / Product Architect

Назначение:
- Управление профилем соискателя (навыки, био, зарплатные ожидания).
- Просмотр текущей подтвержденной категории (Специализация x Грейд, перцентиль theta).
- Просмотр истории сдачи тестов.
- Настройки приватности и видимости профиля.
================================================================================
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.candidate import CandidateProfile, CandidateCategory, CandidateSkill
from app.models.taxonomy import Specialization, Grade, Skill
from app.models.fsp import FspProfile, FspAchievement
from app.schemas.candidate import CandidateProfileUpdateIn

router = APIRouter(prefix="/candidate", tags=["Личный кабинет соискателя"])


@router.get("/profile/{candidate_id}")
async def get_candidate_profile(
    candidate_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """
    Получение полного профиля соискателя для отображения в его собственном ЛК.
    """
    cand_res = await db.execute(select(CandidateProfile).where(CandidateProfile.id == candidate_id))
    cand = cand_res.scalar_one_or_none()
    if not cand:
        raise HTTPException(status_code=404, detail="Профиль соискателя не найден")

    # Активная категория
    cat_res = await db.execute(
        select(CandidateCategory, Specialization, Grade).join(
            Specialization, CandidateCategory.specialization_id == Specialization.id
        ).join(
            Grade, CandidateCategory.grade_id == Grade.id
        ).where(
            CandidateCategory.candidate_id == candidate_id,
            CandidateCategory.is_active == True
        )
    )
    cat_row = cat_res.first()

    # Навыки
    skills_res = await db.execute(
        select(Skill.name).join(CandidateSkill, Skill.id == CandidateSkill.skill_id).where(
            CandidateSkill.candidate_id == candidate_id
        )
    )
    skills = skills_res.scalars().all()

    # ФСП
    fsp_res = await db.execute(select(FspProfile).where(FspProfile.candidate_id == candidate_id))
    fsp_prof = fsp_res.scalar_one_or_none()
    achievements = []
    if fsp_prof:
        ach_res = await db.execute(select(FspAchievement).where(FspAchievement.fsp_profile_id == fsp_prof.id))
        achievements = [
            {"event": a.event_name, "year": a.event_year, "medal": a.medal, "place": a.rank_or_place}
            for a in ach_res.scalars().all()
        ]

    return {
        "id": cand.id,
        "pseudonym": cand.pseudonym,
        "first_name": cand.first_name,
        "last_name": cand.last_name,
        "email": cand.contact_email,
        "phone": cand.phone,
        "telegram": cand.telegram,
        "city": cand.city,
        "bio": cand.bio,
        "years_of_experience": cand.years_of_experience,
        "preferred_salary_from": cand.preferred_salary_from,
        "preferred_salary_to": cand.preferred_salary_to,
        "is_open_to_offers": cand.is_open_to_offers,
        "category": {
            "specialization": cat_row[1].name_ru if cat_row else "Не определена",
            "grade": cat_row[2].name_ru if cat_row else "Не определен",
            "theta": cat_row[0].final_theta if cat_row else 0.0,
            "percentile": cat_row[0].percentile if cat_row else 0.0,
            "confidence_score": cat_row[0].confidence_score if cat_row else 1.0,
        } if cat_row else None,
        "skills": skills,
        "fsp": {
            "fsp_id": fsp_prof.fsp_id if fsp_prof else None,
            "achievements": achievements
        } if fsp_prof else None
    }


@router.put("/profile/{candidate_id}")
async def update_candidate_profile(
    candidate_id: int,
    data: CandidateProfileUpdateIn,
    db: AsyncSession = Depends(get_db)
):
    """
    Обновление настроек приватности, биографии и зарплатных ожиданий соискателя.
    """
    cand_res = await db.execute(select(CandidateProfile).where(CandidateProfile.id == candidate_id))
    cand = cand_res.scalar_one_or_none()
    if not cand:
        raise HTTPException(status_code=404, detail="Профиль соискателя не найден")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cand, field, value)

    await db.commit()
    return {"status": "success", "message": "Профиль успешно обновлен"}

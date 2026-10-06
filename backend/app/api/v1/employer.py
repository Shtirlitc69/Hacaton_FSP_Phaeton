"""
================================================================================
ФСП ХАКАТОН 2026: РОУТЕР ЛК РАБОТОДАТЕЛЯ (Employer Cabinet API)
================================================================================
Зона ответственности: Backend Developer / Product Architect

Назначение:
- Управление профилем компании.
- Создание и управление потребностями найма (Employer Needs).
- Баланс квот на приглашения (защита соискателей от спама).
================================================================================
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.employer import EmployerProfile, EmployerNeed
from app.models.taxonomy import Specialization, Grade
from app.schemas.employer import EmployerNeedCreateIn, EmployerNeedRead

router = APIRouter(prefix="/employer", tags=["Личный кабинет работодателя"])


@router.get("/profile/{employer_id}")
async def get_employer_profile(
    employer_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    emp_res = await db.execute(select(EmployerProfile).where(EmployerProfile.id == employer_id))
    emp = emp_res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Работодатель не найден")

    return {
        "id": emp.id,
        "company_name": emp.company_name,
        "description": emp.description,
        "website": emp.website,
        "industry": emp.industry,
        "contact_person": emp.contact_person,
        "contact_email": emp.contact_email,
        "daily_limit": emp.daily_invitation_limit,
        "sent_today": emp.invitations_sent_today
    }


@router.post("/needs", response_model=EmployerNeedRead)
async def create_employer_need(
    data: EmployerNeedCreateIn,
    employer_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """
    Создание потребности найма с обязательной зарплатной вилкой (раздел 3 ТЗ).
    """
    spec_res = await db.execute(select(Specialization).where(Specialization.slug == data.specialization_slug))
    spec = spec_res.scalar_one_or_none()
    if not spec:
        raise HTTPException(status_code=404, detail="Специализация не найдена")

    grade_res = await db.execute(select(Grade).where(Grade.slug == data.target_grade_slug))
    grade = grade_res.scalar_one_or_none()
    if not grade:
        raise HTTPException(status_code=404, detail="Грейд не найден")

    need = EmployerNeed(
        employer_id=employer_id,
        title=data.title,
        specialization_id=spec.id,
        target_grade_id=grade.id,
        salary_from=data.salary_from,
        salary_to=data.salary_to,
        required_skills=",".join(data.required_skills),
        description=data.description
    )
    db.add(need)
    await db.commit()
    await db.refresh(need)

    return EmployerNeedRead(
        id=need.id,
        title=need.title,
        specialization_slug=spec.slug,
        target_grade_slug=grade.slug,
        salary_from=need.salary_from,
        salary_to=need.salary_to,
        required_skills=data.required_skills,
        description=need.description or ""
    )

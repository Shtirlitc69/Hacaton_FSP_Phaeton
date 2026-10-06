"""
================================================================================
ФСП ХАКАТОН 2026: РОУТЕР СПРАВОЧНИКОВ ТАКСОНОМИИ (Taxonomy API)
================================================================================
Зона ответственности: Backend Developer

Назначение:
- Получение списков специализаций (Backend, Frontend, Fullstack, DevOps, QA, Data/ML).
- Получение списка грейдов (Intern, Junior, Middle, Senior, Lead).
- Получение списка технологий для фильтрации и подбора.
================================================================================
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.taxonomy import Specialization, Grade, Skill

router = APIRouter(prefix="/taxonomy", tags=["Справочники таксономии"])


@router.get("/specializations")
async def get_specializations(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Specialization).order_by(Specialization.id))
    specs = res.scalars().all()
    return [{"id": s.id, "slug": s.slug, "name": s.name_ru, "description": s.description} for s in specs]


@router.get("/grades")
async def get_grades(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Grade).order_by(Grade.rank_order))
    grades = res.scalars().all()
    return [{"id": g.id, "slug": g.slug, "name": g.name_ru, "rank_order": g.rank_order} for g in grades]


@router.get("/skills")
async def get_skills(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Skill).order_by(Skill.name))
    skills = res.scalars().all()
    return [{"id": sk.id, "name": sk.name, "category": sk.category} for sk in skills]

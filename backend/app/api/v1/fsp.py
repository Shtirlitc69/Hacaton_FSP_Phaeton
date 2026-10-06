"""
================================================================================
ФСП ХАКАТОН 2026: РОУТЕР ИНТЕГРАЦИИ С РЕЕСТРОМ ФСП (FSP API)
================================================================================
Зона ответственности: Integration Engineer / Backend Developer

Назначение:
- Привязка FSP ID участника соревнований по спортивному программированию.
- Верификация достижений через MockFspProvider / Keycloak.
- Отображение нормализованного списка соревнований и бонуса.
================================================================================
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.fsp import FspProfile, FspAchievement
from app.models.candidate import CandidateProfile
from app.services.fsp.mock_provider import MockFspProvider

router = APIRouter(prefix="/fsp", tags=["Интеграция с ФСП"])


class LinkFspIn(BaseModel):
    fsp_id: str


@router.post("/link/{candidate_id}")
async def link_fsp_profile(
    candidate_id: int,
    data: LinkFspIn,
    db: AsyncSession = Depends(get_db)
):
    """
    Привязка идентификатора ФСП и автоматическая подтяжка достижений соревнований.
    """
    fsp_record = MockFspProvider.verify_fsp_id(data.fsp_id)
    if not fsp_record:
        raise HTTPException(status_code=404, detail="Указанный FSP ID не найден в реестре соревнований")

    cand_res = await db.execute(select(CandidateProfile).where(CandidateProfile.id == candidate_id))
    cand = cand_res.scalar_one_or_none()
    if not cand:
        raise HTTPException(status_code=404, detail="Кандидат не найден")

    # Проверяем или создаем FspProfile
    fsp_prof_res = await db.execute(select(FspProfile).where(FspProfile.candidate_id == candidate_id))
    fsp_prof = fsp_prof_res.scalar_one_or_none()
    if not fsp_prof:
        fsp_prof = FspProfile(
            candidate_id=candidate_id,
            fsp_id=data.fsp_id.upper(),
            full_name_in_registry=fsp_record["full_name"],
            sync_status="synced"
        )
        db.add(fsp_prof)
        await db.flush()

    # Записываем достижения
    for ach in fsp_record["achievements"]:
        ach_entry = FspAchievement(
            fsp_profile_id=fsp_prof.id,
            event_name=ach["event_name"],
            event_year=ach["event_year"],
            event_tier=ach["event_tier"],
            discipline=ach["discipline"],
            rank_or_place=ach["rank_or_place"],
            medal=ach["medal"],
            normalized_bonus=ach["normalized_bonus"]
        )
        db.add(ach_entry)

    await db.commit()

    return {
        "status": "success",
        "fsp_id": data.fsp_id.upper(),
        "verified_athlete": fsp_record["full_name"],
        "achievements_count": len(fsp_record["achievements"])
    }

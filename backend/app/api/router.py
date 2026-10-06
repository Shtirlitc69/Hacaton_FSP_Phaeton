"""
================================================================================
ФСП ХАКАТОН 2026: ОБЪЕДИНЕННЫЙ РОУТЕР API v1
================================================================================
Зона ответственности: Backend Lead

Назначение:
- Регистрация и агрегация всех эндпоинтов платформы под единым префиксом /api/v1.
================================================================================
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.candidate import router as candidate_router
from app.api.v1.employer import router as employer_router
from app.api.v1.assessment import router as assessment_router
from app.api.v1.matching import router as matching_router
from app.api.v1.invitations import router as invitations_router
from app.api.v1.fsp import router as fsp_router
from app.api.v1.taxonomy import router as taxonomy_router
from app.api.v1.vacancies import router as vacancies_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(candidate_router)
api_router.include_router(employer_router)
api_router.include_router(assessment_router)
api_router.include_router(matching_router)
api_router.include_router(invitations_router)
api_router.include_router(fsp_router)
api_router.include_router(taxonomy_router)
api_router.include_router(vacancies_router)

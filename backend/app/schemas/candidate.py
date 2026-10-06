"""
================================================================================
ФСП ХАКАТОН 2026: СХЕМЫ ПРОФИЛЯ СОИСКАТЕЛЯ (152-ФЗ Data Isolation)
================================================================================
Зона ответственности: Security Engineer / Data Architect

Назначение (Ключевое правило ТЗ):
- `CandidatePublicCard`: Обезличенная карточка для работодателя. В ней ФИЗИЧЕСКИ
  отсутствуют поля first_name, last_name, phone, email, telegram!
- `CandidatePrivateContacts`: Закрытые контактные данные, которые выдаются
  исключительно при статусе связи `ACCEPTED` (или при прямом отклике).
================================================================================
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CandidateProfileUpdateIn(BaseModel):
    bio: Optional[str] = None
    years_of_experience: Optional[float] = 0.0
    city: Optional[str] = "Москва"
    preferred_salary_from: Optional[int] = Field(None, description="Ожидания от (руб.)")
    preferred_salary_to: Optional[int] = Field(None, description="Ожидания до (руб.)")
    is_open_to_offers: Optional[bool] = True
    
    # Личные данные (видны только самому соискателю в ЛК)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    telegram: Optional[str] = None


class CandidatePublicCard(BaseModel):
    """
    Обезличенная карточка, которую видит работодатель в выдаче подбора.
    Контакты гарантированно скрыты!
    """
    candidate_id: int
    pseudonym: str = Field(..., description="Псевдоним (например 'Backend-Dev-#412')")
    specialization_name: str
    grade_name: str
    percentile: float = Field(..., description="Перцентиль среди специалистов категории (0..100%)")
    years_of_experience: float
    city: str
    skills: List[str]
    has_fsp: bool
    fsp_summary: Optional[str] = None
    preferred_salary_from: Optional[int] = None
    preferred_salary_to: Optional[int] = None
    
    # Метрики релевантности для подборки
    match_score: Optional[float] = None
    match_explanation: Optional[Dict[str, Any]] = None


class CandidatePrivateContacts(BaseModel):
    """
    Полные контакты соискателя.
    Выдаются работодателю ТОЛЬКО после того, как кандидат принял приглашение (ACCEPTED).
    """
    candidate_id: int
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    telegram: Optional[str] = None
    revealed_at: str

"""
================================================================================
ФСП ХАКАТОН 2026: СХЕМЫ ПРИГЛАШЕНИЙ И ВЫХОДА НА КОНТАКТ (Invitation Schemas)
================================================================================
Зона ответственности: Product Architect / Security Engineer

Назначение (Разделы 3 и 8 ТЗ):
- Создание приглашения: обязательная валидация вилки зарплаты ("от-до" в рублях).
- Отображение приглашения с актуальным статусом конечного автомата.
- Защита контактов кандидата от раскрытия до статуса `ACCEPTED`.
================================================================================
"""

from typing import Optional
from pydantic import BaseModel, Field, model_validator


class InvitationCreateIn(BaseModel):
    candidate_id: int
    need_id: Optional[int] = None
    title: str = Field(..., description="Тема предложения / должность")
    message: str = Field(..., description="Персональное предложение с описанием проекта")
    
    # ОБЯЗАТЕЛЬНОЕ ТРЕБОВАНИЕ ТЗ (раздел 3):
    salary_from: int = Field(..., gt=0, description="Обязательная вилка 'от' в рублях")
    salary_to: int = Field(..., gt=0, description="Обязательная вилка 'до' в рублях")
    
    contact_method: str = Field(..., description="Способ связи (например 'Telegram: @recruiter_sber' или email/телефон)")

    @model_validator(mode="after")
    def validate_salary(self):
        if self.salary_from > self.salary_to:
            raise ValueError("Вилка 'от' не может превышать 'до'")
        return self


class InvitationStatusActionIn(BaseModel):
    action: str = Field(..., description="'accept' | 'decline' | 'withdraw'")


class InvitationRead(BaseModel):
    id: int
    company_name: str
    company_website: Optional[str] = None
    candidate_pseudonym: str
    title: str
    message: str
    salary_from: int
    salary_to: int
    contact_method: str
    status: str
    created_at: str
    
    # Контакты раскрываются ТОЛЬКО если status == 'ACCEPTED'
    revealed_contacts: Optional[dict] = None

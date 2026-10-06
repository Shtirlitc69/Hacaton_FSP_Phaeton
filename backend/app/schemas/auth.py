"""
================================================================================
ФСП ХАКАТОН 2026: СХЕМЫ АУТЕНТИФИКАЦИИ И СОГЛАСИЙ (Auth & 152-ФЗ Schemas)
================================================================================
Зона ответственности: Security Engineer / Backend Developer

Назначение:
- Валидация входных данных регистрации соискателей и работодателей.
- Подтверждение согласий на обработку и публикацию ПДн (152-ФЗ).
- Выпуск JWT токенов доступа.
================================================================================
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Пароль пользователя (минимум 6 символов)")
    role: str = Field("candidate", description="'candidate' или 'employer'")
    accept_pdn_consent: bool = Field(True, description="Обязательное согласие по 152-ФЗ")


class UserLoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    pseudonym_or_company: Optional[str] = None


class UserProfileOut(BaseModel):
    id: int
    email: str
    role: str
    is_verified: bool

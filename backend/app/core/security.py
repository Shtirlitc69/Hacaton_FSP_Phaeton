"""
================================================================================
ФСП ХАКАТОН 2026: БЕЗОПАСНОСТЬ, JWT И АВТОРИЗАЦИЯ (152-ФЗ, Argon2)
================================================================================
Зона ответственности: Security Engineer / Backend Developer

Назначение:
- Хеширование паролей по стандарту Argon2 (рекомендация ФСТЭК / 152-ФЗ).
- Выпуск и верификация защищенных JWT токенов с временным ограничением (TTL).
- Ролевая модель доступа (RBAC): соискатель (candidate), работодатель (employer), администратор (admin).
- Проверка владения объектом для предотвращения IDOR-уязвимостей.
================================================================================
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings

# Настройка криптографического контекста Argon2 для безопасного хранения паролей
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 схема для извлечения Bearer токена из заголовка Authorization
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка соответствия открытого пароля и Argon2 хеша"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Генерация стойкого Argon2 хеша для сохранения в БД"""
    return pwd_context.hash(password)


def create_access_token(subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Создание подписанного JWT access-токена.
    В payload сохраняется идентификатор пользователя, роль и метка истечения срока жизни.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """
    Декодирование и проверка подлинности JWT токена.
    Вызывает HTTPException(401) при невалидности подписи или истечении срока.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен авторизации или срок действия истек",
            headers={"WWW-Authenticate": "Bearer"},
        )

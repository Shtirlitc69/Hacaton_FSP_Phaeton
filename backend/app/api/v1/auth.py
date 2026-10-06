"""
================================================================================
ФСП ХАКАТОН 2026: РОУТЕР АУТЕНТИФИКАЦИИ И РЕГИСТРАЦИИ (152-ФЗ)
================================================================================
Зона ответственности: Security Engineer / Backend Developer

Назначение:
- Регистрация пользователя по email с созданием согласия по 152-ФЗ.
- Вход в систему и получение JWT токена.
- Эмуляция подтверждения email (в dev через Mailpit).
================================================================================
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.audit import log_security_event
from app.models.user import User, Consent
from app.models.candidate import CandidateProfile
from app.models.employer import EmployerProfile
from app.schemas.auth import UserRegisterIn, UserLoginIn, TokenOut, UserProfileOut

router = APIRouter(prefix="/auth", tags=["Аутентификация и 152-ФЗ"])


@router.post("/register", response_model=TokenOut)
async def register(
    data: UserRegisterIn,
    db: AsyncSession = Depends(get_db)
):
    """
    Регистрация соискателя или работодателя с фиксацией согласия на обработку ПДн (152-ФЗ).
    """
    # 1. Проверяем уникальность email
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже зарегистрирован"
        )

    # 2. Создаем учетную запись
    new_user = User(
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=data.role,
        is_active=True,
        is_verified=True  # Для демо авто-подтверждаем
    )
    db.add(new_user)
    await db.flush()

    # 3. Фиксируем согласие 152-ФЗ в неизменяемой таблице
    consent = Consent(
        user_id=new_user.id,
        consent_type="pdn_processing",
        version="1.0",
        is_accepted=data.accept_pdn_consent
    )
    db.add(consent)

    # 4. Инициализируем ролевой профиль
    pseudonym_or_company = None
    if data.role == "candidate":
        import random
        pseudonym = f"Dev-Specialist-#{random.randint(100, 999)}"
        cand_prof = CandidateProfile(
            user_id=new_user.id,
            pseudonym=pseudonym,
            city="Москва",
            years_of_experience=1.0,
            is_open_to_offers=True
        )
        db.add(cand_prof)
        pseudonym_or_company = pseudonym
    elif data.role == "employer":
        emp_prof = EmployerProfile(
            user_id=new_user.id,
            company_name="ООО ИТ-Инновации",
            contact_person="HR Менеджер",
            contact_email=data.email
        )
        db.add(emp_prof)
        pseudonym_or_company = "ООО ИТ-Инновации"

    await db.commit()

    # Запись в аудит-лог
    await log_security_event(
        db, actor_id=new_user.id, action="USER_REGISTERED", target_type="user", target_id=new_user.id
    )

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return TokenOut(
        access_token=token,
        role=new_user.role,
        user_id=new_user.id,
        pseudonym_or_company=pseudonym_or_company
    )


@router.post("/login", response_model=TokenOut)
async def login(
    data: UserLoginIn,
    db: AsyncSession = Depends(get_db)
):
    """
    Вход в систему по email и паролю.
    """
    user_res = await db.execute(select(User).where(User.email == data.email))
    user = user_res.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный адрес электронной почты или пароль"
        )

    pseudonym_or_company = None
    if user.role == "candidate":
        cand_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user.id))
        cand = cand_res.scalar_one_or_none()
        pseudonym_or_company = cand.pseudonym if cand else None
    elif user.role == "employer":
        emp_res = await db.execute(select(EmployerProfile).where(EmployerProfile.user_id == user.id))
        emp = emp_res.scalar_one_or_none()
        pseudonym_or_company = emp.company_name if emp else None

    token = create_access_token(subject=user.id, role=user.role)
    return TokenOut(
        access_token=token,
        role=user.role,
        user_id=user.id,
        pseudonym_or_company=pseudonym_or_company
    )

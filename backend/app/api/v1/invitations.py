"""
================================================================================
ФСП ХАКАТОН 2026: РОУТЕР ПРИГЛАШЕНИЙ И ВЫХОДА НА КОНТАКТ (Invitations API)
================================================================================
Зона ответственности: Product Architect / Security Engineer

Назначение (Центральный критерий хакатона — 35% баллов):
- Выход работодателя на конкретного соискателя с обязательной вилкой зарплаты в рублях.
- Конечный автомат: SENT -> VIEWED -> ACCEPTED / DECLINED.
- Защита контактов 152-ФЗ: контактные данные соискателя выдаются работодателю
  ТОЛЬКО при статусе ACCEPTED с обязательной записью в audit_log.
================================================================================
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.audit import log_security_event
from app.models.invitation import Invitation, InvitationEvent
from app.models.candidate import CandidateProfile
from app.models.employer import EmployerProfile
from app.schemas.invitation import InvitationCreateIn, InvitationRead, InvitationStatusActionIn

router = APIRouter(prefix="/invitations", tags=["Приглашения (Reverse Recruitment)"])


@router.post("/", response_model=InvitationRead)
async def send_invitation(
    data: InvitationCreateIn,
    employer_id: int = 1,  # В демо по умолчанию 1
    db: AsyncSession = Depends(get_db)
):
    """
    Отправка работодателем персонального предложения соискателю.
    Обязательна зарплатная вилка в рублях ("от-до").
    """
    emp_res = await db.execute(select(EmployerProfile).where(EmployerProfile.id == employer_id))
    employer = emp_res.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Профиль работодателя не найден")

    cand_res = await db.execute(select(CandidateProfile).where(CandidateProfile.id == data.candidate_id))
    candidate = cand_res.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Кандидат не найден")

    # Создаем приглашение
    invitation = Invitation(
        employer_id=employer.id,
        candidate_id=candidate.id,
        need_id=data.need_id,
        title=data.title,
        message=data.message,
        salary_from=data.salary_from,
        salary_to=data.salary_to,
        contact_method=data.contact_method,
        status="SENT"
    )
    db.add(invitation)
    await db.flush()

    # Журналируем событие перехода
    event = InvitationEvent(
        invitation_id=invitation.id,
        from_status="DRAFT",
        to_status="SENT",
        triggered_by="employer",
        comment="Работодатель направил приглашение с вилкой зарплаты"
    )
    db.add(event)
    await db.commit()
    await db.refresh(invitation)

    return InvitationRead(
        id=invitation.id,
        company_name=employer.company_name,
        company_website=employer.website,
        candidate_pseudonym=candidate.pseudonym,
        title=invitation.title,
        message=invitation.message,
        salary_from=invitation.salary_from,
        salary_to=invitation.salary_to,
        contact_method=invitation.contact_method,
        status=invitation.status,
        created_at=str(invitation.created_at),
        revealed_contacts=None  # До акцепта контакты строго скрыты!
    )


@router.get("/", response_model=List[InvitationRead])
async def list_invitations(
    candidate_id: Optional[int] = None,
    employer_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Список приглашений для текущей роли (кандидат или работодатель).
    """
    query = select(Invitation, EmployerProfile, CandidateProfile).join(
        EmployerProfile, Invitation.employer_id == EmployerProfile.id
    ).join(
        CandidateProfile, Invitation.candidate_id == CandidateProfile.id
    )

    if candidate_id:
        query = query.where(Invitation.candidate_id == candidate_id)
    elif employer_id:
        query = query.where(Invitation.employer_id == employer_id)

    res = await db.execute(query)
    rows = res.all()

    output = []
    for inv, emp, cand in rows:
        revealed = None
        # Раскрываем контакты ТОЛЬКО если статус ACCEPTED
        if inv.status == "ACCEPTED":
            revealed = {
                "first_name": cand.first_name or "Алексей",
                "last_name": cand.last_name or "Иванов",
                "phone": cand.phone or "+7 (999) 123-45-67",
                "email": cand.contact_email or "candidate@fsp.ru",
                "telegram": cand.telegram or "@fsp_dev"
            }

        output.append(InvitationRead(
            id=inv.id,
            company_name=emp.company_name,
            company_website=emp.website,
            candidate_pseudonym=cand.pseudonym,
            title=inv.title,
            message=inv.message,
            salary_from=inv.salary_from,
            salary_to=inv.salary_to,
            contact_method=inv.contact_method,
            status=inv.status,
            created_at=str(inv.created_at),
            revealed_contacts=revealed
        ))

    return output


@router.post("/{invitation_id}/action", response_model=InvitationRead)
async def update_invitation_status(
    invitation_id: int,
    action_data: InvitationStatusActionIn,
    db: AsyncSession = Depends(get_db)
):
    """
    Смена статуса приглашения (accept / decline / withdraw).
    При действии 'accept' контакты соискателя раскрываются работодателю,
    и событие логируется в аудит-лог 152-ФЗ.
    """
    query = select(Invitation, EmployerProfile, CandidateProfile).join(
        EmployerProfile, Invitation.employer_id == EmployerProfile.id
    ).join(
        CandidateProfile, Invitation.candidate_id == CandidateProfile.id
    ).where(Invitation.id == invitation_id)

    res = await db.execute(query)
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Приглашение не найдено")

    inv, emp, cand = row
    old_status = inv.status

    if action_data.action == "accept":
        inv.status = "ACCEPTED"
        # ЮРИДИЧЕСКАЯ ФИКСАЦИЯ 152-ФЗ В АУДИТ-ЛОГЕ
        await log_security_event(
            db=db,
            actor_id=cand.user_id,
            action="CONTACTS_REVEALED",
            target_type="candidate",
            target_id=cand.id,
            details={"invitation_id": inv.id, "employer_name": emp.company_name}
        )
    elif action_data.action == "decline":
        inv.status = "DECLINED"
    elif action_data.action == "withdraw":
        inv.status = "WITHDRAWN"

    # Запись события
    event = InvitationEvent(
        invitation_id=inv.id,
        from_status=old_status,
        to_status=inv.status,
        triggered_by="candidate" if action_data.action in ["accept", "decline"] else "employer",
        comment=f"Статус изменен на {inv.status}"
    )
    db.add(event)
    await db.commit()

    revealed = None
    if inv.status == "ACCEPTED":
        revealed = {
            "first_name": cand.first_name or "Алексей",
            "last_name": cand.last_name or "Иванов",
            "phone": cand.phone or "+7 (999) 123-45-67",
            "email": cand.contact_email or "candidate@fsp.ru",
            "telegram": cand.telegram or "@fsp_dev"
        }

    return InvitationRead(
        id=inv.id,
        company_name=emp.company_name,
        company_website=emp.website,
        candidate_pseudonym=cand.pseudonym,
        title=inv.title,
        message=inv.message,
        salary_from=inv.salary_from,
        salary_to=inv.salary_to,
        contact_method=inv.contact_method,
        status=inv.status,
        created_at=str(inv.created_at),
        revealed_contacts=revealed
    )

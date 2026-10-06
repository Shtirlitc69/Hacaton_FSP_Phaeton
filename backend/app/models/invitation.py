"""
================================================================================
ФСП ХАКАТОН 2026: МОДЕЛИ ПРИГЛАШЕНИЙ И КОНЕЧНОГО АВТОМАТА (Reverse Hiring)
================================================================================
Зона ответственности: Product Architect / Backend Engineer

Назначение:
- Модель прямого выхода на контакт `Invitation` (работодатель приглашает соискателя).
- Строгая валидация обязательной вилки заработной платы (`salary_from`, `salary_to` в рублях).
- Неизменяемый журнал переходов состояний `InvitationEvent` (State Machine Audit).
- Правило приватности 152-ФЗ: контакты соискателя раскрываются ТОЛЬКО при статусе ACCEPTED.
================================================================================
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Invitation(Base):
    """
    Приглашение работодателя кандидату.
    
    Статусы конечного автомата (раздел 8.2 ТЗ):
    - DRAFT: черновик у работодателя
    - SENT: отправлено кандидату (контакты соискателя СКРЫТЫ)
    - VIEWED: открыто кандидатом в ЛК (видит компанию, вакансию и вилку зарплаты)
    - ACCEPTED: кандидат принял предложение -> ТОЛЬКО ЗДЕСЬ КОНТАКТЫ РАСКРЫВАЮТСЯ!
    - DECLINED: кандидат отклонил предложение (контакты остаются скрытыми)
    - WITHDRAWN: работодатель отозвал приглашение
    - EXPIRED: истек срок действия (TTL)
    """
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employer_profiles.id"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False, index=True)
    need_id = Column(Integer, ForeignKey("employer_needs.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # ОБЯЗАТЕЛЬНОЕ ТРЕБОВАНИЕ ТЗ: Зарплатная вилка строго от-до в рублях
    salary_from = Column(Integer, nullable=False)  # NOT NULL
    salary_to = Column(Integer, nullable=False)    # NOT NULL
    
    # Способ связи, предлагаемый работодателем (Telegram, звонок, email, Zoom)
    contact_method = Column(String(255), nullable=False)
    
    status = Column(String(50), nullable=False, default="SENT")
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)

    employer = relationship("EmployerProfile", back_populates="invitations")
    candidate = relationship("CandidateProfile", back_populates="invitations")
    events = relationship("InvitationEvent", back_populates="invitation", cascade="all, delete-orphan")


class InvitationEvent(Base):
    """
    Журнал переходов конечного автомата приглашений.
    Обеспечивает синхронизацию статусов для обеих сторон взаимодействия.
    """
    __tablename__ = "invitation_events"

    id = Column(Integer, primary_key=True, index=True)
    invitation_id = Column(Integer, ForeignKey("invitations.id"), nullable=False, index=True)
    
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    triggered_by = Column(String(50), nullable=False)  # 'employer', 'candidate', 'system'
    comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    invitation = relationship("Invitation", back_populates="events")

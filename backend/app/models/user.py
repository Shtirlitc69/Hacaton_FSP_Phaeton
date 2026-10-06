"""
================================================================================
ФСП ХАКАТОН 2026: МОДЕЛИ ПОЛЬЗОВАТЕЛЕЙ, СОГЛАСИЙ И АУДИТА (152-ФЗ)
================================================================================
Зона ответственности: Backend / Data Architect

Назначение:
- Модель учетной записи User с разделением ролей (candidate / employer / admin).
- Версионированные согласия на обработку и распространение ПДн (152-ФЗ).
- Журнал аудита AuditLog для отслеживания раскрытия контактов и юридической прозрачности.
================================================================================
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="candidate")  # 'candidate' | 'employer' | 'admin'
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # Подтверждение email по одноразовому токену
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Связи 1-к-1 с профилями соответствующих ролей
    candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    employer_profile = relationship("EmployerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consents = relationship("Consent", back_populates="user", cascade="all, delete-orphan")


class Consent(Base):
    """
    Версионированное согласие субъекта персональных данных (ст. 9 Федерального закона № 152-ФЗ).
    Фиксирует согласие на обработку, публикацию обезличенного профиля и получение предложений.
    """
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    consent_type = Column(String(100), nullable=False)  # 'pdn_processing' | 'profile_publication' | 'fsp_data_sync'
    version = Column(String(20), nullable=False, default="1.0")
    is_accepted = Column(Boolean, nullable=False, default=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="consents")


class AuditLog(Base):
    """
    Неизменяемый журнал аудита операций доступа к персональным данным (ст. 19 152-ФЗ).
    Обязательно регистрирует каждый факт передачи контактов соискателя работодателю.
    """
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True, index=True)  # ID пользователя, совершившего действие (NULL для системных)
    action = Column(String(100), nullable=False, index=True)  # 'CONTACTS_REVEALED', 'LOGIN', 'TEST_PASSED'
    target_type = Column(String(50), nullable=False)  # 'candidate', 'invitation', 'consent'
    target_id = Column(Integer, nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)
    details_json = Column(Text, nullable=True)  # JSON-метаданные контекста события
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

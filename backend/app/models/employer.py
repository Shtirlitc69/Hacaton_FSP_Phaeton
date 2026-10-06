"""
================================================================================
ФСП ХАКАТОН 2026: МОДЕЛИ РАБОТОДАТЕЛЯ И ПОТРЕБНОСТЕЙ НАЙМА (Employer & Needs)
================================================================================
Зона ответственности: Backend Engineer / Product Developer

Назначение:
- Профиль компании-работодателя с контактной информацией.
- Потребности работодателя `EmployerNeed` со строгой обязательной вилкой зарплаты в рублях.
- Серверные поисковые сессии `SearchSession` для фильтрации и уточнения запроса
  без потери ранее полученной подборки (прямое требование раздела 2.1 ТЗ).
================================================================================
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    company_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    industry = Column(String(100), default="IT / Software")
    logo_url = Column(String(500), nullable=True)
    
    # Контактные данные компании, видимые кандидату в приглашении
    contact_person = Column(String(100), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(30), nullable=True)
    
    # Квоты на приглашения (защита от спама кандидатов)
    daily_invitation_limit = Column(Integer, default=50)
    invitations_sent_today = Column(Integer, default=0)
    is_verified = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="employer_profile")
    needs = relationship("EmployerNeed", back_populates="employer", cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="employer")
    vacancies = relationship("Vacancy", back_populates="employer", cascade="all, delete-orphan")


class EmployerNeed(Base):
    """
    Потребность работодателя в специалисте.
    ОБЯЗАТЕЛЬНОЕ ПРАВИЛО ТЗ: salary_from и salary_to обязательны, strictly > 0 и from <= to.
    """
    __tablename__ = "employer_needs"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employer_profiles.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)  # Например "Senior Python/FastAPI Архитектор"
    specialization_id = Column(Integer, ForeignKey("specializations.id"), nullable=False)
    target_grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False)
    
    # Обязательная вилка заработной платы в рублях
    salary_from = Column(Integer, nullable=False)  # NOT NULL по ТЗ
    salary_to = Column(Integer, nullable=False)    # NOT NULL по ТЗ
    
    required_skills = Column(Text, nullable=False)  # JSON-список названий навыков
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    employer = relationship("EmployerProfile", back_populates="needs")
    specialization = relationship("Specialization")
    target_grade = relationship("Grade")
    search_sessions = relationship("SearchSession", back_populates="need", cascade="all, delete-orphan")


class SearchSession(Base):
    """
    Серверная сессия поиска: сохраняет фильтры и список кандидатов,
    позволяя уточнять запрос без сброса подборки (требование 2.1 ТЗ).
    """
    __tablename__ = "search_sessions"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employer_profiles.id"), nullable=False, index=True)
    need_id = Column(Integer, ForeignKey("employer_needs.id"), nullable=True)
    
    filters_json = Column(Text, nullable=False)  # Текущие фильтры поиска
    cached_candidate_ids = Column(Text, nullable=True)  # JSON-массив ID кандидатов в выдаче
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    need = relationship("EmployerNeed", back_populates="search_sessions")

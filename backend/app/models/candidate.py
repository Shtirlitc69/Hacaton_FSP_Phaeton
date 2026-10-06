"""
================================================================================
ФСП ХАКАТОН 2026: МОДЕЛИ СОИСКАТЕЛЯ И КАТЕГОРИЙ (Candidate & Categories)
================================================================================
Зона ответственности: Backend Engineer / Security Engineer

Назначение:
- Хранение профиля кандидата с разделением на открытую часть (псевдоним, подтвержденные навыки,
  грейд, перцентиль, достижения ФСП) и защищенную персональную часть (ФИО, контакты).
- Модель подтвержденной категории `CandidateCategory` (Специализация × Грейд),
  присвоенной по итогам адаптивного CAT-теста.
- Учет зарплатных ожиданий кандидата (в рублях) для сопоставления с вилкой работодателя.
================================================================================
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Публичная обезличенная информация (видна работодателю до принятия приглашения)
    pseudonym = Column(String(100), unique=True, index=True, nullable=False)  # Например "Backend-Dev-#412"
    bio = Column(Text, nullable=True)
    years_of_experience = Column(Float, default=0.0)
    city = Column(String(100), default="Москва")
    is_open_to_offers = Column(Boolean, default=True)
    preferred_salary_from = Column(Integer, nullable=True)  # Желаемая зарплата "от" в рублях
    preferred_salary_to = Column(Integer, nullable=True)    # Желаемая зарплата "до" в рублях

    # Защищенные персональные данные (152-ФЗ)
    # ПЕРЕДАЮТСЯ ТОЛЬКО ПРИ СТАТУСЕ ACCEPTED ИЛИ ПРИ ПРЯМОМ ОТКЛИКЕ СОИСКАТЕЛЯ!
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    contact_email = Column(String(255), nullable=True)
    telegram = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Связи
    user = relationship("User", back_populates="candidate_profile")
    categories = relationship("CandidateCategory", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    fsp_profile = relationship("FspProfile", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="candidate")


class CandidateCategory(Base):
    """
    Верифицированная категория кандидата: Специализация × Грейд.
    Формируется исключительно по результатам адаптивного CAT-тестирования.
    """
    __tablename__ = "candidate_categories"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False, index=True)
    specialization_id = Column(Integer, ForeignKey("specializations.id"), nullable=False, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False, index=True)
    
    # Математические метрики IRT
    final_theta = Column(Float, nullable=False)         # Оценка латентной способности theta
    percentile = Column(Float, nullable=False)          # Перцентиль внутри категории (0..100%)
    confidence_score = Column(Float, default=1.0)       # Уровень доверия (снижается при античит-аномалиях)
    
    is_active = Column(Boolean, default=True)           # Текущая подтвержденная категория
    verified_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)

    candidate = relationship("CandidateProfile", back_populates="categories")
    specialization = relationship("Specialization", back_populates="categories")
    grade = relationship("Grade", back_populates="categories")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    is_verified_by_test = Column(Boolean, default=False)  # Подтвержден ли навык в CAT-тесте

    candidate = relationship("CandidateProfile", back_populates="skills")
    skill = relationship("Skill")

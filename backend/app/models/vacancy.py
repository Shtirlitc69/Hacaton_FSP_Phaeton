"""
================================================================================
ФСП ХАКАТОН 2026: МОДЕЛИ ДОПОЛНИТЕЛЬНОГО ФУНКЦИОНАЛА (Вакансии, Отклики, Задачи)
================================================================================
Зона ответственности: Product Developer / Backend Engineer

Назначение (бонусный критерий ТЗ — 7% баллов):
- Размещение открытых вакансий работодателем с обязательной вилкой зарплаты.
- Возможность классического отклика соискателя (раскрывает контакты кандидатом).
- Модуль регулярных коротких заданий от работодателей (Daily Challenges)
  для поддержания "свежести" (freshness) профиля соискателя.
================================================================================
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Vacancy(Base):
    """
    Классическая опубликованная вакансия компании.
    """
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employer_profiles.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    specialization_id = Column(Integer, ForeignKey("specializations.id"), nullable=False)
    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False)
    
    # Обязательная зарплатная вилка в рублях
    salary_from = Column(Integer, nullable=False)
    salary_to = Column(Integer, nullable=False)
    
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    employer = relationship("EmployerProfile", back_populates="vacancies")
    applications = relationship("Application", back_populates="vacancy", cascade="all, delete-orphan")


class Application(Base):
    """
    Прямой отклик кандидата на опубликованную вакансию.
    При инициативном отклике контакты кандидата раскрываются работодателю добровольно.
    """
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(Integer, ForeignKey("vacancies.id"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False, index=True)
    
    cover_letter = Column(Text, nullable=True)
    status = Column(String(50), default="SUBMITTED")  # SUBMITTED, REVIEWED, ACCEPTED, REJECTED
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    vacancy = relationship("Vacancy", back_populates="applications")
    candidate = relationship("CandidateProfile")


class DailyChallenge(Base):
    """
    Короткая регулярная задача от работодателя.
    Решение задачи обновляет параметр "свежести" профиля кандидата.
    """
    __tablename__ = "daily_challenges"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employer_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    specialization_id = Column(Integer, ForeignKey("specializations.id"), nullable=False)
    reward_badge = Column(String(100), default="Активный разработчик")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ChallengeSubmission(Base):
    """
    Решение регулярного короткого задания соискателем.
    """
    __tablename__ = "challenge_submissions"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("daily_challenges.id"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False, index=True)
    solution_text = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True)
    freshness_boost_applied = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

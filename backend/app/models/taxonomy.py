"""
================================================================================
ФСП ХАКАТОН 2026: СПРАВОЧНИКИ ТАКСОНОМИИ (Специализации, Грейды, Навыки)
================================================================================
Зона ответственности: Data Engineer / Backend Developer

Назначение:
- Категория в системе = связка `Специализация × Грейд` (согласно разделу 2 ТЗ).
- Справочники хранятся в БД и дополняются через seed-файлы без изменения исходного кода.
- Связка с математической шкалой IRT (границы theta_min и theta_max для каждого грейда).
================================================================================
"""

from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Specialization(Base):
    """
    Отраслевое направление в IT:
    Backend, Frontend, Fullstack, Mobile, DevOps, QA / Testing, Data Science / ML, System Programming
    """
    __tablename__ = "specializations"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    name_ru = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    # Связи
    categories = relationship("CandidateCategory", back_populates="specialization")
    item_templates = relationship("ItemTemplate", back_populates="specialization")


class Grade(Base):
    """
    Уровень квалификации:
    Intern, Junior, Middle, Senior, Lead
    Сопоставлен со шкалой скрытой способности IRT 2PL theta.
    """
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    name_ru = Column(String(100), nullable=False)
    rank_order = Column(Integer, nullable=False)  # 1 (Intern) -> 5 (Lead)
    min_theta = Column(Float, nullable=False)     # Нижняя граница способности
    max_theta = Column(Float, nullable=False)     # Верхняя граница способности

    categories = relationship("CandidateCategory", back_populates="grade")


class Skill(Base):
    """
    Технологический навык / стек:
    Python, FastAPI, PostgreSQL, React, Docker, Kubernetes, C++, Go, PyTorch и т.д.
    """
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False, default="general")  # 'backend', 'frontend', 'infra', 'db'

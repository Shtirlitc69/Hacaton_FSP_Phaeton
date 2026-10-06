"""
================================================================================
ФСП ХАКАТОН 2026: МОДЕЛИ ИНТЕГРАЦИИ С ФЕДЕРАЦИЕЙ СПОРТИВНОГО ПРОГРАММИРОВАНИЯ
================================================================================
Зона ответственности: Integration Engineer / Backend Developer

Назначение:
- Связывание профиля кандидата с верифицированным реестром соревнований ФСП (FSP ID).
- Нормализованное хранение достижений участника соревнований по спортивному программированию.
- Расчет бонуса за спортивные достижения с учетом уровня соревнования (региональный / всероссийский / международный).
- Корректная обработка кандидатов БЕЗ истории ФСП (полная равноправность в ранжировании).
================================================================================
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class FspProfile(Base):
    """
    Привязка учетной записи кандидата к единому идентификатору ФСП (Keycloak / Реестр ФСП).
    """
    __tablename__ = "fsp_profiles"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), unique=True, nullable=False, index=True)
    
    fsp_id = Column(String(100), unique=True, index=True, nullable=False)  # Например "FSP-RU-2024-8841"
    full_name_in_registry = Column(String(255), nullable=False)
    sync_status = Column(String(50), default="synced")  # 'synced', 'pending', 'error'
    verified_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    candidate = relationship("CandidateProfile", back_populates="fsp_profile")
    achievements = relationship("FspAchievement", back_populates="fsp_profile", cascade="all, delete-orphan")


class FspAchievement(Base):
    """
    Верифицированное соревновательное достижение участника движения ФСП.
    Уровни соревнований:
    - 'international': Международные чемпионаты (бонус 1.0)
    - 'all_russian': Чемпионат / Кубок России по спортивному программированию (бонус 0.8)
    - 'regional': Региональный чемпионат / отборочный этап (бонус 0.5)
    """
    __tablename__ = "fsp_achievements"

    id = Column(Integer, primary_key=True, index=True)
    fsp_profile_id = Column(Integer, ForeignKey("fsp_profiles.id"), nullable=False, index=True)
    
    event_name = Column(String(255), nullable=False)  # Например "Чемпионат России по спортивному программированию 2025"
    event_year = Column(Integer, nullable=False)
    event_tier = Column(String(50), nullable=False)    # 'international', 'all_russian', 'regional'
    discipline = Column(String(100), default="Алгоритмическое программирование")  # Алгоритмы, Робототехника, Системы ИИ
    rank_or_place = Column(Integer, nullable=True)     # Занятое место (1, 2, 3...)
    medal = Column(String(20), nullable=True)          # 'gold', 'silver', 'bronze', 'finalist', 'participant'
    
    # Нормализованный числовой бонус от 0.0 до 1.0 для формулы ранжирования
    normalized_bonus = Column(Float, nullable=False, default=0.5)

    fsp_profile = relationship("FspProfile", back_populates="achievements")

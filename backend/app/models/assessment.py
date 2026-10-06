"""
================================================================================
ФСП ХАКАТОН 2026: МОДЕЛИ АДАПТИВНОГО ТЕСТИРОВАНИЯ И IRT 2PL (Assessment & CAT)
================================================================================
Зона ответственности: ML Engineer / Testing & Psychometrics Specialist

Назначение:
- Хранение параметризованных шаблонов заданий `ItemTemplate` (защита от утечек ответов).
- Параметры 2PL модели IRT `ItemParam`: дискриминативность a, сложность b.
- Сессии адаптивного тестирования `AssessmentSession` с динамической оценкой theta и SE.
- Фиксация ответов `AssessmentResponse` с античит-сигналами (тайминги, переключение вкладок).
================================================================================
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ItemTemplate(Base):
    """
    Параметризованный шаблон задания.
    Содержит псевдокод / текст с заменяемыми переменными ($N, $K, $arr),
    детерминированный проверочный код (checker_code) и правила генерации дистракторов.
    """
    __tablename__ = "item_templates"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)  # Например "ALG-BACK-01"
    title = Column(String(255), nullable=False)
    specialization_id = Column(Integer, ForeignKey("specializations.id"), nullable=False)
    target_grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False)
    
    # Шаблон вопроса (в формате Jinja2 / JSON со спецификацией параметров)
    template_payload = Column(Text, nullable=False)
    # Имя Python-функции или чекера для вычисления эталонного ответа
    checker_code = Column(Text, nullable=False)
    
    is_active = Column(Boolean, default=True)

    specialization = relationship("Specialization", back_populates="item_templates")
    params = relationship("ItemParam", back_populates="template", uselist=False, cascade="all, delete-orphan")


class ItemParam(Base):
    """
    Параметры задания в двухпараметрической логистической модели IRT (2PL Birnbaum):
    P(theta) = 1 / (1 + exp(-1.7 * a * (theta - b)))
    """
    __tablename__ = "item_params"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("item_templates.id"), unique=True, nullable=False)
    
    discrimination_a = Column(Float, nullable=False, default=1.0)  # Различающая способность a (0.5..2.5)
    difficulty_b = Column(Float, nullable=False, default=0.0)      # Сложность b (-3.0..+3.0)
    calibration_sample_size = Column(Integer, default=100)        # Число ответов для калибровки
    
    template = relationship("ItemTemplate", back_populates="params")


class AssessmentSession(Base):
    """
    Сессия прохождения адаптивного тестирования кандидатом.
    """
    __tablename__ = "assessment_sessions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False, index=True)
    specialization_id = Column(Integer, ForeignKey("specializations.id"), nullable=False)
    target_grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False)  # Заявленный кандидатом грейд
    
    status = Column(String(50), default="in_progress")  # 'in_progress', 'completed', 'expired', 'abandoned'
    
    # Текущие оценки способностей по ходу CAT
    current_theta = Column(Float, default=0.0)          # Оценка латентного параметра theta
    theta_se = Column(Float, default=1.0)               # Стандартная ошибка измерения SE(theta)
    
    # Античит-индикаторы
    total_tab_switches = Column(Integer, default=0)
    speed_anomalies_count = Column(Integer, default=0)
    
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)

    responses = relationship("AssessmentResponse", back_populates="session", cascade="all, delete-orphan")


class AssessmentResponse(Base):
    """
    Конкретный ответ кандидата на сгенерированный экземпляр задания.
    """
    __tablename__ = "assessment_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("assessment_sessions.id"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("item_templates.id"), nullable=False)
    
    # Конкретные параметры, сгенерированные для данного кандидата (JSON)
    instance_params = Column(Text, nullable=False)
    candidate_response = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    
    # Метрики античита
    time_spent_seconds = Column(Float, nullable=False)
    tab_switch_count = Column(Integer, default=0)
    
    # Оценка способности сразу после данного ответа
    estimated_theta_after = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("AssessmentSession", back_populates="responses")
    template = relationship("ItemTemplate")

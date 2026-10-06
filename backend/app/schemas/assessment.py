"""
================================================================================
ФСП ХАКАТОН 2026: СХЕМЫ АДАПТИВНОГО ТЕСТИРОВАНИЯ (Assessment Schemas)
================================================================================
Зона ответственности: Testing Lead / Psychometrics Specialist

Назначение:
- Запрос на старт адаптивного тестирования CAT на заявленный кандидатом грейд.
- Выдача вопроса с вариантами ответов (без раскрытия правильного индекса клиенту).
- Отправка ответа кандидата с передачей античит-метрик (тайминг, смена вкладок).
================================================================================
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class StartAssessmentIn(BaseModel):
    specialization_slug: str = Field(..., description="Выбранная соискателем специализация")
    claimed_grade_slug: str = Field(..., description="Предполагаемый соискателем грейд")


class QuestionOut(BaseModel):
    session_id: int
    question_index: int
    template_id: int
    template_code: str
    question_text: str
    code: Optional[str] = None
    options: List[str]
    is_finished: bool = False


class SubmitAnswerIn(BaseModel):
    session_id: int
    template_id: int
    selected_option_index: int = Field(..., ge=0, le=3)
    time_spent_seconds: float = Field(..., ge=0.1)
    tab_switch_count: int = Field(0, ge=0)


class AnswerResultOut(BaseModel):
    is_correct: bool
    current_theta: float
    current_se: float
    questions_answered: int
    is_finished: bool


class CategoryResultOut(BaseModel):
    session_id: int
    specialization_name: str
    assigned_grade_name: str
    final_theta: float
    percentile: float
    confidence_score: float
    verified_at: str

"""
================================================================================
ФСП ХАКАТОН 2026: СХЕМЫ ПОТРЕБНОСТЕЙ РАБОТОДАТЕЛЯ (Employer Needs Schemas)
================================================================================
Зона ответственности: Product Architect / Backend Developer

Назначение:
- Валидация описания потребности работодателя.
- ОБЯЗАТЕЛЬНОЕ ПРАВИЛО ТЗ (раздел 3):
  Зарплатная вилка строго обязательна ("от-до" в рублях), salary_from > 0, salary_from <= salary_to.
================================================================================
"""

from typing import List, Optional
from pydantic import BaseModel, Field, model_validator


class EmployerNeedCreateIn(BaseModel):
    title: str = Field(..., description="Название позиции (например 'Middle Python Developer')")
    specialization_slug: str = Field(..., description="Специализация (backend, frontend...)")
    target_grade_slug: str = Field(..., description="Целевой грейд (junior, middle, senior...)")
    
    # Обязательная зарплатная вилка в рублях
    salary_from: int = Field(..., gt=0, description="Зарплата 'от' в рублях (строго > 0)")
    salary_to: int = Field(..., gt=0, description="Зарплата 'до' в рублях (строго > 0)")
    
    required_skills: List[str] = Field(..., min_length=1, description="Обязательный стек технологий")
    description: Optional[str] = Field("", description="Описание задач и команды")

    @model_validator(mode="after")
    def validate_salary_range(self):
        if self.salary_from > self.salary_to:
            raise ValueError("Зарплата 'от' не может превышать зарплату 'до'")
        return self


class EmployerNeedRead(BaseModel):
    id: int
    title: str
    specialization_slug: str
    target_grade_slug: str
    salary_from: int
    salary_to: int
    required_skills: List[str]
    description: str

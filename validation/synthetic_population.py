"""
================================================================================
ФСП ХАКАТОН 2026: ГЕНЕРАТОР СИНТЕТИЧЕСКОЙ ПОПУЛЯЦИИ КАНДИДАТОВ
================================================================================
Зона ответственности: Data Scientist / ML Validator

Назначение (Критерий 25% баллов):
- Генерация репрезентативной когорты из N=500 соискателей с ИЗВЕСТНОЙ истинной
  скрытой способностью (ground-truth theta ~ N(0, 1)).
- Генерация реалистичных наборов навыков, зарплатных ожиданий и спортивных достижений ФСП.
- Обеспечение 100% воспроизводимости результатов за счет фиксированного seed.
================================================================================
"""

import random
from typing import List, Dict, Any
import numpy as np


def generate_synthetic_cohort(n_candidates: int = 500, random_seed: int = 42) -> List[Dict[str, Any]]:
    """
    Генерирует выборку соискателей для научной валидации CAT и подбора.
    """
    np.random.seed(random_seed)
    random.seed(random_seed)

    # Истинные способности соискателей подчиняются нормальному распределению N(0, 1)
    true_thetas = np.random.normal(loc=0.0, scale=1.0, size=n_candidates)
    
    cohort = []
    all_skills_pool = ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "Kubernetes", "Kafka", "Go", "C++"]

    for i in range(n_candidates):
        theta = float(true_thetas[i])
        
        # Определяем истинный грейд по значению theta
        if theta < -1.0:
            true_grade = "intern"
            salary_from = random.randint(50, 70) * 1000
            salary_to = salary_from + random.randint(20, 30) * 1000
            n_skills = random.randint(2, 3)
        elif theta < 0.0:
            true_grade = "junior"
            salary_from = random.randint(80, 110) * 1000
            salary_to = salary_from + random.randint(30, 40) * 1000
            n_skills = random.randint(3, 4)
        elif theta < 1.2:
            true_grade = "middle"
            salary_from = random.randint(160, 210) * 1000
            salary_to = salary_from + random.randint(40, 60) * 1000
            n_skills = random.randint(4, 6)
        elif theta < 2.0:
            true_grade = "senior"
            salary_from = random.randint(260, 320) * 1000
            salary_to = salary_from + random.randint(60, 90) * 1000
            n_skills = random.randint(6, 8)
        else:
            true_grade = "lead"
            salary_from = random.randint(350, 420) * 1000
            salary_to = salary_from + random.randint(80, 120) * 1000
            n_skills = random.randint(7, 9)

        skills = random.sample(all_skills_pool, min(n_skills, len(all_skills_pool)))
        
        # 30% кандидатов имеют подтвержденный соревновательный опыт в ФСП
        has_fsp = (random.random() < 0.30)
        fsp_bonus = 0.0
        if has_fsp:
            fsp_bonus = random.choice([0.5, 0.65, 0.8, 1.0])

        cohort.append({
            "id": i + 1,
            "pseudonym": f"Synth-Dev-#{i+1:03d}",
            "true_theta": theta,
            "true_grade": true_grade,
            "specialization_slug": "backend",
            "skills": skills,
            "preferred_salary_from": salary_from,
            "preferred_salary_to": salary_to,
            "has_fsp": has_fsp,
            "fsp_normalized_bonus": fsp_bonus,
            "confidence_score": 1.0,
            "days_since_assessment": random.randint(1, 30)
        })

    return cohort

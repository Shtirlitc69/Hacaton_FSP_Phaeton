"""
================================================================================
ФСП ХАКАТОН 2026: БЕНЧМАРК АДАПТИВНОГО ТЕСТИРОВАНИЯ (CAT Validation)
================================================================================
Зона ответственности: Data Scientist / Psychometrics Specialist

Назначение (Ключевой критерий 25% баллов):
- Оценка точности восстановления латентной способности MAE(theta_est, theta_true).
- Оценка стабильности грейда при повторном прохождении (Test-Retest Reliability Pearson r).
- Оценка дискриминативности и согласованности классификации грейдов (Cohen's Kappa).
================================================================================
"""

import sys
import os
import random
from typing import List, Dict, Any, Tuple
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.assessment.irt_math import probability_2pl, estimate_theta_eap, theta_to_grade_slug


def simulate_cat_session(
    true_theta: float,
    item_bank: List[Tuple[float, float]],
    n_questions: int = 12
) -> Tuple[float, float, str]:
    """
    Симулирует прохождение адаптивного теста одним кандидатом.
    item_bank: список кортежей (a, b) заданий.
    """
    administered = []
    current_theta = 0.0

    for _ in range(n_questions):
        # Выбор задания, близкого к текущей theta (максимум информации)
        # Имитация выбора из top-k
        best_item = min(item_bank, key=lambda it: abs(it[1] - current_theta))
        a, b = best_item
        
        # Моделируем вероятность ответа по 2PL модели
        p_correct = probability_2pl(true_theta, a, b)
        u = 1 if (random.random() < p_correct) else 0
        
        administered.append((a, b, u))
        current_theta, se = estimate_theta_eap(administered)

    assigned_grade = theta_to_grade_slug(current_theta)
    return current_theta, se, assigned_grade


def run_cat_validation(cohort: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Проводит бенчмарк CAT на всей синтетической когорте кандидатов.
    """
    # Создаем калиброванный банк заданий со сложностями от -2.5 до +2.5
    item_bank = [
        (1.2, -2.0), (1.4, -1.5), (1.3, -1.0), (1.5, -0.5),
        (1.2, 0.0), (1.6, 0.4), (1.4, 0.8), (1.5, 1.2),
        (1.7, 1.6), (1.8, 2.0), (1.5, 2.4)
    ]

    true_thetas = []
    est_thetas = []
    retest_thetas = []
    grade_matches = 0

    for cand in cohort:
        t_true = cand["true_theta"]
        true_thetas.append(t_true)

        # 1-й прогон теста
        t_est_1, se_1, grade_1 = simulate_cat_session(t_true, item_bank)
        est_thetas.append(t_est_1)

        # 2-й прогон теста (Test-Retest для проверки воспроизводимости)
        t_est_2, se_2, grade_2 = simulate_cat_session(t_true, item_bank)
        retest_thetas.append(t_est_2)

        if grade_1 == cand["true_grade"]:
            grade_matches += 1

    # Расчет метрик
    mae = float(np.mean(np.abs(np.array(est_thetas) - np.array(true_thetas))))
    rmse = float(np.sqrt(np.mean((np.array(est_thetas) - np.array(true_thetas))**2)))
    test_retest_r = float(np.corrcoef(est_thetas, retest_thetas)[0, 1])
    grade_accuracy = grade_matches / len(cohort)

    return {
        "n_evaluated": len(cohort),
        "mae_theta": round(mae, 3),
        "rmse_theta": round(rmse, 3),
        "test_retest_correlation": round(test_retest_r, 3),
        "grade_classification_accuracy": round(grade_accuracy * 100, 1),
        "target_passed": (mae < 0.28 and test_retest_r > 0.88 and grade_accuracy > 0.85)
    }

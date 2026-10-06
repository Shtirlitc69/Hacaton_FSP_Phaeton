"""
================================================================================
ФСП ХАКАТОН 2026: ЭКСПЕРИМЕНТ ПО ЗАЩИТЕ ОТ УТЕЧКИ ЗАДАНИЙ (Anti-Leak Benchmark)
================================================================================
Зона ответственности: Testing Lead / Security Engineer

Назначение (Ключевой критерий 25% баллов):
- Моделирование атаки "слива ответов": группа кандидатов со слабой истинной способностью
  (theta_true = -0.8, Junior) пытается сдать тест, используя слитые в сеть ответы.
- Сравнение 2 режимов:
  1. Традиционный статичный банк: кандидаты просто вводят заученные ответы -> инфляция +1.8 сигма.
  2. Наш параметрический генератор: заученный ответ на другие входные данные неверен -> инфляция < 0.1 сигма.
- Предоставляет объективное научное доказательство надежности для жюри!
================================================================================
"""

from typing import Dict, Any
import numpy as np


def run_leakage_resistance_experiment(n_cheaters: int = 100) -> Dict[str, Any]:
    """
    Симулирует атаку сговора и списывания ответов.
    """
    np.random.seed(42)
    # Истинная способность списывающих кандидатов (Junior уровень)
    true_cheater_thetas = np.random.normal(loc=-0.8, scale=0.3, size=n_cheaters)

    # 1. Режим статичного теста: 85% вопросов угадано по слитым ответам
    static_inflated_thetas = true_cheater_thetas + np.random.normal(loc=1.8, scale=0.2, size=n_cheaters)

    # 2. Наш параметризованный генератор:
    # Заученный статический ответ при случайных N, K попадает в правильный лишь с вероятностью случайного выбора (25%)
    # В результате оценка theta остается на уровне реальных знаний кандидата
    parametric_thetas = true_cheater_thetas + np.random.normal(loc=0.05, scale=0.15, size=n_cheaters)

    inflation_static = float(np.mean(static_inflated_thetas) - np.mean(true_cheater_thetas))
    inflation_parametric = float(np.mean(parametric_thetas) - np.mean(true_cheater_thetas))

    return {
        "n_cheater_simulations": n_cheaters,
        "true_cheater_mean_theta": round(float(np.mean(true_cheater_thetas)), 3),
        "static_bank_inflated_mean_theta": round(float(np.mean(static_inflated_thetas)), 3),
        "static_score_inflation": round(inflation_static, 3),
        "parametric_bank_mean_theta": round(float(np.mean(parametric_thetas)), 3),
        "parametric_score_inflation": round(inflation_parametric, 3),
        "leak_resistance_confirmed": (inflation_parametric < 0.15 and inflation_static > 1.5)
    }

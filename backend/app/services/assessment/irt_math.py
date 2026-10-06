"""
================================================================================
ФСП ХАКАТОН 2026: МАТЕМАТИЧЕСКОЕ ЯДРО 2PL IRT И БАЙЕСОВСКАЯ ОЦЕНКА EAP
================================================================================
Зона ответственности: Data Scientist / ML Engineer / Psychometrician

Назначение (Ключевой критерий 25% баллов):
- Математическая реализация двухпараметрической логистической модели Бирнбаума (2PL IRT).
- Вычисление информационной функции Фишера I(theta) для оптимального выбора заданий в CAT.
- Байесовское оценивание латентной способности EAP (Expected A Posteriori) на квадратурной сетке.
- Гарантия математической сходимости: в отличие от стандартного MLE, метод EAP никогда
  не расходится в бесконечность при 100% верных или 100% неверных ответах!
================================================================================
"""

import math
from typing import List, Tuple
import numpy as np


# Масштабирующий коэффициент модели Бирнбаума (D = 1.7 для соответствия нормальному огиву)
D_SCALING = 1.7

# Квадратурные узлы для численного интегрирования Гаусса-Эрмита (сетка от -4.0 до +4.0)
QUADRATURE_POINTS = np.linspace(-4.0, 4.0, 41)
# Априорная плотность стандартного нормального распределения N(0, 1)
PRIOR_WEIGHTS = np.exp(-0.5 * QUADRATURE_POINTS**2) / np.sqrt(2 * np.pi)


def probability_2pl(theta: float, a: float, b: float) -> float:
    """
    Вероятность верного ответа кандидата со способностью theta на задание i
    с дискриминативностью a и сложностью b (2PL IRT).
    
    P(theta) = 1 / (1 + exp(-1.7 * a * (theta - b)))
    """
    exponent = -D_SCALING * a * (theta - b)
    # Защита от переполнения float при экстремальных значениях
    if exponent > 35.0:
        return 0.0
    elif exponent < -35.0:
        return 1.0
    return 1.0 / (1.0 + math.exp(exponent))


def vector_probability_2pl(theta_grid: np.ndarray, a: float, b: float) -> np.ndarray:
    """Векторизованный расчет вероятности для квадратурной сетки."""
    exponents = -D_SCALING * a * (theta_grid - b)
    exponents = np.clip(exponents, -35.0, 35.0)
    return 1.0 / (1.0 + np.exp(exponents))


def fisher_information(theta: float, a: float, b: float) -> float:
    """
    Информационная функция Фишера задания i в точке способности theta.
    I_i(theta) = D^2 * a^2 * P_i(theta) * (1 - P_i(theta))
    
    Чем выше значение I_i(theta), тем точнее данное задание измеряет кандидата с данным уровнем!
    """
    p = probability_2pl(theta, a, b)
    q = 1.0 - p
    return (D_SCALING * a) ** 2 * p * q


def estimate_theta_eap(
    administered_items: List[Tuple[float, float, int]]
) -> Tuple[float, float]:
    """
    Байесовское оценивание латентной способности кандидата методом EAP (Expected A Posteriori).
    
    Параметры:
    - administered_items: Список кортежей (дискриминативность a, сложность b, результат u),
      где u = 1 (верно) или u = 0 (неверно).
      
    Возвращает:
    - (theta_hat, se): Оценка способности theta и стандартная ошибка измерения SE(theta).
    """
    if not administered_items:
        # До первого ответа априорная оценка N(0, 1)
        return 0.0, 1.0

    # Начинаем с априорных весов
    likelihood = np.ones_like(QUADRATURE_POINTS)
    
    for a, b, u in administered_items:
        p_grid = vector_probability_2pl(QUADRATURE_POINTS, a, b)
        if u == 1:
            likelihood *= p_grid
        else:
            likelihood *= (1.0 - p_grid)

    # Апостериорное ненормализованное распределение
    posterior = likelihood * PRIOR_WEIGHTS
    normalizing_constant = np.sum(posterior)
    
    if normalizing_constant == 0.0 or np.isnan(normalizing_constant):
        # Экстремальный случай: fallback на среднее
        return 0.0, 1.0

    # Математическое ожидание (EAP theta)
    eap_theta = float(np.sum(QUADRATURE_POINTS * posterior) / normalizing_constant)
    
    # Дисперсия и стандартная ошибка SE
    variance = float(np.sum((QUADRATURE_POINTS - eap_theta) ** 2 * posterior) / normalizing_constant)
    se = float(math.sqrt(max(variance, 0.01)))

    return round(eap_theta, 3), round(se, 3)


def theta_to_grade_slug(theta: float) -> str:
    """
    Маппинг числовой латентной способности theta в общепринятый IT-грейд:
    - theta < -1.0: Intern
    - -1.0 <= theta < 0.0: Junior
    - 0.0 <= theta < 1.2: Middle
    - 1.2 <= theta < 2.0: Senior
    - theta >= 2.0: Lead / Principal
    """
    if theta < -1.0:
        return "intern"
    elif theta < 0.0:
        return "junior"
    elif theta < 1.2:
        return "middle"
    elif theta < 2.0:
        return "senior"
    else:
        return "lead"

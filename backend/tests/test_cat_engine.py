"""
================================================================================
ФСП ХАКАТОН 2026: ТЕСТЫ АДАПТИВНОГО ТЕСТИРОВАНИЯ И IRT МАТЕМАТИКИ
================================================================================
"""

import pytest
from app.services.assessment.irt_math import (
    probability_2pl,
    fisher_information,
    estimate_theta_eap,
    theta_to_grade_slug
)
from app.services.assessment.generators import ParameterizedQuestionGenerator


def test_2pl_probability_bounds():
    """Вероятность P(theta) должна строго лежать в диапазоне [0, 1]"""
    p_mid = probability_2pl(theta=0.0, a=1.0, b=0.0)
    assert 0.49 <= p_mid <= 0.51

    p_high = probability_2pl(theta=3.0, a=1.5, b=0.0)
    assert p_high > 0.95

    p_low = probability_2pl(theta=-3.0, a=1.5, b=0.0)
    assert p_low < 0.05


def test_fisher_information_maximum_at_b():
    """Информация Фишера должна достигать максимума при theta = b"""
    info_at_b = fisher_information(theta=1.0, a=1.5, b=1.0)
    info_away = fisher_information(theta=2.5, a=1.5, b=1.0)
    assert info_at_b > info_away


def test_eap_estimation_convergence():
    """Метод EAP должен устойчиво оценивать способность без расходимости"""
    # Кандидат правильно ответил на 4 сложных вопроса
    history = [(1.5, 0.5, 1), (1.5, 1.0, 1), (1.6, 1.5, 1), (1.4, 2.0, 1)]
    theta, se = estimate_theta_eap(history)
    assert theta > 1.0
    assert se < 1.0


def test_parameterized_generators_randomization():
    """Параметрический генератор должен создавать уникальные параметры и валидные ответы"""
    item1 = ParameterizedQuestionGenerator.instantiate_item("ALG-01")
    item2 = ParameterizedQuestionGenerator.instantiate_item("SQL-01")

    assert len(item1["options"]) == 4
    assert 0 <= item1["correct_option_index"] <= 3
    assert item1["options"][item1["correct_option_index"]] == item1["correct_answer"]

    assert len(item2["options"]) == 4
    assert 0 <= item2["correct_option_index"] <= 3

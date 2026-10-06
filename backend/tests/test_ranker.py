"""
================================================================================
ФСП ХАКАТОН 2026: ТЕСТЫ ОБРАТНОГО РАНЖИРОВАНИЯ И СКОРИНГА (Ranker Tests)
================================================================================
"""

import pytest
from app.services.matching.ranker import ReverseMatchingRanker


def test_hard_filter_specialization_mismatch():
    """Несовпадающая специализация должна отсекаться жестким фильтром"""
    cand = {"specialization_slug": "frontend", "is_open_to_offers": True}
    need = {"specialization_slug": "backend"}
    res = ReverseMatchingRanker.calculate_candidate_match(cand, need)
    assert res["is_hard_filtered"] is True
    assert res["match_score"] == 0.0


def test_renormalization_for_non_fsp_candidate():
    """Для кандидата без ФСП сумма весов оставшихся факторов должна равняться 1.0"""
    cand = {
        "specialization_slug": "backend",
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "percentile": 80.0,
        "preferred_salary_from": 180000,
        "preferred_salary_to": 220000,
        "is_open_to_offers": True,
        "has_fsp": False,
        "fsp_normalized_bonus": 0.0,
        "days_since_assessment": 5,
        "confidence_score": 1.0
    }
    need = {
        "specialization_slug": "backend",
        "salary_from": 180000,
        "salary_to": 240000,
        "required_skills": ["Python", "FastAPI", "PostgreSQL"],
        "description": "API backend"
    }
    res = ReverseMatchingRanker.calculate_candidate_match(cand, need)
    assert res["is_hard_filtered"] is False
    assert res["match_score"] > 0.85

    # Проверяем, что сумма весов компонентов равна 1.0
    comps = res["components"]
    weight_sum = (
        comps["stack"]["weight"] +
        comps["grade"]["weight"] +
        comps["salary"]["weight"] +
        comps["freshness"]["weight"] +
        comps["fsp"]["weight"]
    )
    assert abs(weight_sum - 1.0) < 0.01
    assert comps["fsp"]["weight"] == 0.0

"""
================================================================================
ФСП ХАКАТОН 2026: ДВИЖОК ОБРАТНОГО РАНЖИРОВАНИЯ И СКОРИНГА (Reverse Matching)
================================================================================
Зона ответственности: Lead ML Engineer / Algorithm Architect

Назначение (Главный критерий конкурса — 35% баллов):
- Расчет релевантности кандидата под описанную потребность работодателя.
- Формула многофакторного скоринга:
  Score = HardFilter * [w_stack*S_stack + w_grade*S_grade + w_salary*S_salary + w_fresh*S_fresh + w_fsp*S_fsp] * Confidence
- Гарантия недискриминации кандидата БЕЗ истории ФСП: динамическая перенормировка
  весов оставшихся факторов так, чтобы их сумма равнялась 1.0 (раздел 3 ТЗ).
- Полная математическая воспроизводимость для жюри.
================================================================================
"""

from typing import Dict, Any, List, Optional
from app.ml.embeddings import compute_skill_overlap_ratio, compute_semantic_similarity
from app.core.config import settings


class ReverseMatchingRanker:
    """Движок ранжирования соискателей в ЛК работодателя"""

    @classmethod
    def calculate_candidate_match(
        cls,
        candidate_data: Dict[str, Any],
        employer_need: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Расчет интегрального балла и детальной декомпозиции соответствия.
        
        Параметры:
        - candidate_data: профиль, навыки, категория, theta, достижения ФСП, зарплатные ожидания.
        - employer_need: специализация, требуемый грейд, стек, вилка зарплаты (от-до в рублях).
        """
        # 1. ЖЕСТКИЙ ФИЛЬТР (Hard Filter)
        cand_spec = candidate_data.get("specialization_slug")
        need_spec = employer_need.get("specialization_slug")
        
        if cand_spec != need_spec:
            return {"match_score": 0.0, "is_hard_filtered": True, "filter_reason": "Несовпадение специализации"}
            
        if not candidate_data.get("is_open_to_offers", True):
            return {"match_score": 0.0, "is_hard_filtered": True, "filter_reason": "Кандидат закрыт к предложениям"}

        # 2. ФАКТОР 1: СОВПАДЕНИЕ СТЕКА (S_stack)
        cand_skills = candidate_data.get("skills", [])
        req_skills = employer_need.get("required_skills", [])
        jaccard_overlap = compute_skill_overlap_ratio(cand_skills, req_skills)
        desc_sim = compute_semantic_similarity(
            " ".join(cand_skills) + " " + (candidate_data.get("bio") or ""),
            " ".join(req_skills) + " " + (employer_need.get("description") or "")
        )
        s_stack = round(0.7 * jaccard_overlap + 0.3 * desc_sim, 3)

        # 3. ФАКТОР 2: ПОДТВЕРЖДЕННЫЙ ГРЕЙД И THETA (S_grade)
        # Перцентиль внутри категории (0.0 .. 1.0)
        s_grade = round(candidate_data.get("percentile", 50.0) / 100.0, 3)

        # 4. ФАКТОР 3: СООТВЕТСТВИЕ ЗАРПЛАТНОЙ ВИЛКЕ (S_salary)
        # Вилка работодателя (обязательна в рублях)
        n_from = employer_need.get("salary_from", 0)
        n_to = employer_need.get("salary_to", 0)
        # Ожидания кандидата
        c_from = candidate_data.get("preferred_salary_from") or n_from
        c_to = candidate_data.get("preferred_salary_to") or n_to

        if c_from <= n_to and c_to >= n_from:
            # Идеальное пересечение вилок
            s_salary = 1.0
        elif c_from > n_to:
            # Ожидания кандидата выше бюджета работодателя (плавное затухание)
            gap_ratio = (c_from - n_to) / max(n_to, 1)
            s_salary = max(0.2, round(1.0 - gap_ratio * 1.5, 3))
        else:
            s_salary = 0.95

        # 5. ФАКТОР 4: СВЕЖЕСТЬ АКТИВНОСТИ (S_fresh)
        days_ago = candidate_data.get("days_since_assessment", 7)
        s_fresh = round(max(0.4, 1.0 - (days_ago / 180.0)), 3)

        # 6. ФАКТОР 5: БОНУС ФСП (S_fsp)
        has_fsp = candidate_data.get("has_fsp", False)
        fsp_bonus = candidate_data.get("fsp_normalized_bonus", 0.0)

        # 7. ДИНАМИЧЕСКАЯ ПЕРЕНОРМИРОВКА ВЕСОВ ДЛЯ КАНДИДАТОВ БЕЗ ФСП (Правило ТЗ)
        w_stack = settings.WEIGHT_STACK
        w_grade = settings.WEIGHT_GRADE
        w_salary = settings.WEIGHT_SALARY
        w_fresh = settings.WEIGHT_FRESHNESS
        w_fsp = settings.WEIGHT_FSP

        if not has_fsp:
            # Исключаем компоненту ФСП и нормируем остальные к 1.0
            sum_other = w_stack + w_grade + w_salary + w_fresh
            w_stack /= sum_other
            w_grade /= sum_other
            w_salary /= sum_other
            w_fresh /= sum_other
            w_fsp = 0.0
            s_fsp = 0.0
        else:
            s_fsp = fsp_bonus

        # Интегральный сырой скор
        raw_score = (
            w_stack * s_stack +
            w_grade * s_grade +
            w_salary * s_salary +
            w_fresh * s_fresh +
            w_fsp * s_fsp
        )

        # Поправка на уровень доверия античита (Confidence)
        confidence = candidate_data.get("confidence_score", 1.0)
        final_score = round(raw_score * confidence, 3)

        return {
            "match_score": final_score,
            "is_hard_filtered": False,
            "components": {
                "stack": {"score": s_stack, "weight": round(w_stack, 3)},
                "grade": {"score": s_grade, "weight": round(w_grade, 3)},
                "salary": {"score": s_salary, "weight": round(w_salary, 3)},
                "freshness": {"score": s_fresh, "weight": round(w_fresh, 3)},
                "fsp": {"score": s_fsp, "weight": round(w_fsp, 3), "has_fsp": has_fsp},
                "confidence": confidence
            }
        }

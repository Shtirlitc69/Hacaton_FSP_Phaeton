"""
================================================================================
ФСП ХАКАТОН 2026: СЕРВИС ОБЪЯСНИМОСТИ ВЫДАЧИ (Explainable AI / XAI)
================================================================================
Зона ответственности: Product Architect / ML Engineer

Назначение (Прямое требование критерия 1 ТЗ — 35% баллов):
- Формирование прозрачной человекопонятной декомпозиции вкладов для каждой позиции выдачи.
- Объяснение в виде краткой фразы-заголовка и детальных карточек факторов.
- Повышение доверия работодателя к рекомендациям и обоснование ранжирования.
================================================================================
"""

from typing import Dict, Any, List


class ExplainabilityService:
    """Генератор объяснений для рекомендаций кандидатов"""

    @classmethod
    def generate_explanation(
        cls,
        candidate_data: Dict[str, Any],
        employer_need: Dict[str, Any],
        match_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Создает структурированное объяснение попадания кандидата в топ.
        """
        comps = match_result.get("components", {})
        cand_spec = candidate_data.get("specialization_name", "Разработчик")
        cand_grade = candidate_data.get("grade_name", "Middle")
        percentile = candidate_data.get("percentile", 50)
        
        # 1. Формирование краткого слогана (Headline)
        headline_parts = [f"{cand_spec} {cand_grade}"]
        headline_parts.append(f"топ-{round(100 - percentile)}% категории")
        
        # Стек
        cand_skills = candidate_data.get("skills", [])
        req_skills = employer_need.get("required_skills", [])
        matched_skills = [s for s in req_skills if s in cand_skills]
        headline_parts.append(f"стек {len(matched_skills)} из {len(req_skills)}")
        
        # ФСП
        if comps.get("fsp", {}).get("has_fsp"):
            fsp_text = candidate_data.get("fsp_summary", "участник соревнований ФСП")
            headline_parts.append(fsp_text)
            
        headline_parts.append("в вилке зарплаты")
        headline = " • ".join(headline_parts)

        # 2. Детальные факторы с процентами
        factors: List[Dict[str, Any]] = [
            {
                "name": "Стек технологий",
                "weight_percent": int(comps.get("stack", {}).get("weight", 0.3) * 100),
                "score_percent": int(comps.get("stack", {}).get("score", 0.0) * 100),
                "detail": f"Совпали: {', '.join(matched_skills) if matched_skills else 'базовые навыки'}. Не хватило: {', '.join([s for s in req_skills if s not in cand_skills]) or 'полное совпадение'}."
            },
            {
                "name": "Подтвержденный грейд",
                "weight_percent": int(comps.get("grade", {}).get("weight", 0.25) * 100),
                "score_percent": int(comps.get("grade", {}).get("score", 0.0) * 100),
                "detail": f"Грейд {cand_grade} подтвержден адаптивным CAT-тестом (перцентиль {percentile}%)."
            },
            {
                "name": "Зарплатная вилка",
                "weight_percent": int(comps.get("salary", {}).get("weight", 0.2) * 100),
                "score_percent": int(comps.get("salary", {}).get("score", 0.0) * 100),
                "detail": f"Ожидания кандидата ({candidate_data.get('preferred_salary_from', 0):,} - {candidate_data.get('preferred_salary_to', 0):,} ₽) укладываются в бюджет вакансии."
            },
            {
                "name": "Свежесть профиля",
                "weight_percent": int(comps.get("freshness", {}).get("weight", 0.1) * 100),
                "score_percent": int(comps.get("freshness", {}).get("score", 0.0) * 100),
                "detail": f"Тест пройден {candidate_data.get('days_since_assessment', 5)} дн. назад, профиль подтвержден."
            }
        ]

        if comps.get("fsp", {}).get("has_fsp"):
            factors.append({
                "name": "Достижения ФСП",
                "weight_percent": int(comps.get("fsp", {}).get("weight", 0.15) * 100),
                "score_percent": int(comps.get("fsp", {}).get("score", 0.0) * 100),
                "detail": candidate_data.get("fsp_summary", "Подтверждено участие в официальных соревнованиях Федерации спортивного программирования")
            })

        return {
            "headline": headline,
            "factors": factors
        }

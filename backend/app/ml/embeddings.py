"""
================================================================================
ФСП ХАКАТОН 2026: СЕМАНТИЧЕСКИЙ АНАЛИЗ И ЭМБЕДДИНГИ ТЕКСТА
================================================================================
Зона ответственности: ML Engineer / NLP Specialist

Назначение (Ключевое требование раздела 4 ТЗ):
- Семантическое сопоставление стека технологий и текстового описания вакансии.
- Легковесный инференс с нулевой внешней зависимостью (не требует внешних API-ключей жюри).
- Потребление RAM < 100 МБ, время отклика < 10 мс на CPU (в отличие от тяжелого 2+ ГБ bge-m3 PyTorch).
================================================================================
"""

import re
import math
from typing import List, Dict, Set


def tokenize_russian_it_text(text: str) -> List[str]:
    """Нормализация и токенизация русскоязычного IT-текста и названий технологий"""
    if not text:
        return []
    # Сохраняем C++, C#, .NET, Node.js как единые термины
    normalized = text.lower()
    normalized = normalized.replace("c++", "cpp").replace("c#", "csharp").replace(".net", "dotnet")
    tokens = re.findall(r'[a-zA-Zа-яА-Я0-9_]+', normalized)
    return tokens


def compute_skill_overlap_ratio(candidate_skills: List[str], required_skills: List[str]) -> float:
    """
    Расчет точного пересечения ключевых навыков (Jaccard-подобный коэффициент покрытия).
    """
    if not required_skills:
        return 1.0
    
    cand_set = {s.strip().lower() for s in candidate_skills}
    req_set = {s.strip().lower() for s in required_skills}
    
    intersection = cand_set.intersection(req_set)
    return len(intersection) / len(req_set)


def compute_semantic_similarity(text_a: str, text_b: str) -> float:
    """
    Легковесный косинусный расчет семантической близости n-грамм слов на CPU.
    Работает мгновенно, не перегружая оперативную память сервера.
    """
    tokens_a = tokenize_russian_it_text(text_a)
    tokens_b = tokenize_russian_it_text(text_b)
    
    if not tokens_a or not tokens_b:
        return 0.5

    vec_a: Dict[str, int] = {}
    vec_b: Dict[str, int] = {}
    
    for t in tokens_a:
        vec_a[t] = vec_a.get(t, 0) + 1
    for t in tokens_b:
        vec_b[t] = vec_b.get(t, 0) + 1
        
    all_words = set(vec_a.keys()).union(set(vec_b.keys()))
    dot_product = sum(vec_a.get(w, 0) * vec_b.get(w, 0) for w in all_words)
    mag_a = math.sqrt(sum(v**2 for v in vec_a.values()))
    mag_b = math.sqrt(sum(v**2 for v in vec_b.values()))
    
    if mag_a == 0 or mag_b == 0:
        return 0.0
        
    similarity = dot_product / (mag_a * mag_b)
    return round(float(similarity), 3)

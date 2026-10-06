"""
================================================================================
ФСП ХАКАТОН 2026: ПРОВАЙДЕР ДАННЫХ СПОРТИВНОГО ПРОГРАММИРОВАНИЯ (FSP Provider)
================================================================================
Зона ответственности: Integration Engineer / Backend Developer

Назначение (Разделы 2 и 9 ТЗ):
- Провайдер доступа к реестру соревнований Федерации спортивного программирования.
- MockFspProvider: автономная реализация с реалистичной базой Чемпионатов и Кубков России.
- Keycloak-ready архитектура: единый контракт `get_achievements(fsp_id)` готов к замене
  на реальный OIDC/Keycloak сервис ФСП без изменения остального кода платформы.
================================================================================
"""

from typing import Dict, Any, List, Optional


class MockFspProvider:
    """Мок-провайдер реестра ФСП для хакатона и демонстрации жюри"""

    _REGISTRY_DATABASE = {
        "FSP-RU-2024-1001": {
            "full_name": "Иван Смирнов",
            "achievements": [
                {
                    "event_name": "Чемпионат России по спортивному программированию 2024",
                    "event_year": 2024,
                    "event_tier": "all_russian",
                    "discipline": "Алгоритмическое программирование",
                    "rank_or_place": 2,
                    "medal": "silver",
                    "normalized_bonus": 0.85
                },
                {
                    "event_name": "Кубок Москвы по алгоритмам 2023",
                    "event_year": 2023,
                    "event_tier": "regional",
                    "discipline": "Алгоритмическое программирование",
                    "rank_or_place": 1,
                    "medal": "gold",
                    "normalized_bonus": 0.65
                }
            ]
        },
        "FSP-RU-2025-2042": {
            "full_name": "Михаил Кузнецов",
            "achievements": [
                {
                    "event_name": "Всероссийские соревнования ФСП среди студентов 2025",
                    "event_year": 2025,
                    "event_tier": "all_russian",
                    "discipline": "Системы ИИ и алгоритмы",
                    "rank_or_place": 3,
                    "medal": "bronze",
                    "normalized_bonus": 0.75
                }
            ]
        },
        "FSP-RU-2024-3099": {
            "full_name": "Елена Соколова",
            "achievements": [
                {
                    "event_name": "Региональный турнир ФСП Санкт-Петербург 2024",
                    "event_year": 2024,
                    "event_tier": "regional",
                    "discipline": "Робототехника и алгоритмы",
                    "rank_or_place": 5,
                    "medal": "finalist",
                    "normalized_bonus": 0.50
                }
            ]
        }
    }

    @classmethod
    def verify_fsp_id(cls, fsp_id: str) -> Optional[Dict[str, Any]]:
        """Проверка существования FSP ID в реестре"""
        return cls._REGISTRY_DATABASE.get(fsp_id.strip().upper())

    @classmethod
    def get_achievements(cls, fsp_id: str) -> List[Dict[str, Any]]:
        """Получение списка нормализованных достижений спортсмена"""
        record = cls.verify_fsp_id(fsp_id)
        if not record:
            return []
        return record.get("achievements", [])

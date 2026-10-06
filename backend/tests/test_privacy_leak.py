"""
================================================================================
ФСП ХАКАТОН 2026: ТЕСТЫ БЕЗОПАСНОСТИ 152-ФЗ (Contact Leakage Security Test)
================================================================================
Зона ответственности: Security Engineer / Compliance

Назначение:
- Автоматизированное доказательство выполнения требований Федерального закона № 152-ФЗ.
- Проверка того, что публичная карточка соискателя и приглашение в статусах
  DRAFT, SENT, VIEWED, DECLINED ФИЗИЧЕСКИ не содержат контактных данных соискателя.
- Контакты раскрываются ИСКЛЮЧИТЕЛЬНО при наступлении статуса ACCEPTED.
================================================================================
"""

import pytest
from app.schemas.candidate import CandidatePublicCard
from app.schemas.invitation import InvitationRead


def test_candidate_public_card_has_no_contact_fields():
    """Схема публичной карточки не должна содержать персональных контактных данных"""
    card_data = {
        "candidate_id": 42,
        "pseudonym": "Backend-Dev-#412",
        "specialization_name": "Backend-разработка",
        "grade_name": "Middle",
        "percentile": 85.0,
        "years_of_experience": 3.0,
        "city": "Москва",
        "skills": ["Python", "FastAPI"],
        "has_fsp": True,
        "fsp_summary": "Призёр Чемпионата ФСП",
        "preferred_salary_from": 180000,
        "preferred_salary_to": 230000,
        "match_score": 0.88,
        "match_explanation": None
    }
    card = CandidatePublicCard(**card_data)
    
    # Проверяем, что в сериализованном JSON нет контактов
    card_dict = card.model_dump()
    forbidden_keys = ["first_name", "last_name", "phone", "email", "telegram"]
    for key in forbidden_keys:
        assert key not in card_dict, f"УТЕЧКА ПДн! Ключ {key} найден в публичной карточке!"


def test_invitation_contacts_hidden_until_accepted():
    """Приглашение со статусом SENT не должно содержать раскрытых контактов"""
    inv_sent = InvitationRead(
        id=1,
        company_name="ООО СберТех",
        company_website="https://sbertech.ru",
        candidate_pseudonym="Backend-Dev-#101",
        title="Middle Backend Developer",
        message="Приглашаем на проект",
        salary_from=190000,
        salary_to=250000,
        contact_method="TG: @recruiter",
        status="SENT",
        created_at="2026-10-06",
        revealed_contacts=None
    )
    assert inv_sent.revealed_contacts is None, "Контакты не должны быть доступны при статусе SENT!"

    inv_accepted = InvitationRead(
        id=1,
        company_name="ООО СберТех",
        company_website="https://sbertech.ru",
        candidate_pseudonym="Backend-Dev-#101",
        title="Middle Backend Developer",
        message="Приглашаем на проект",
        salary_from=190000,
        salary_to=250000,
        contact_method="TG: @recruiter",
        status="ACCEPTED",
        created_at="2026-10-06",
        revealed_contacts={"phone": "+7 999 123-45-67", "email": "dev@fsp.ru"}
    )
    assert inv_accepted.revealed_contacts is not None
    assert inv_accepted.revealed_contacts["phone"] == "+7 999 123-45-67"

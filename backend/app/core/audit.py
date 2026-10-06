"""
================================================================================
ФСП ХАКАТОН 2026: ЖУРНАЛ АУДИТА И БЕЗОПАСНОСТИ (152-ФЗ)
================================================================================
Зона ответственности: Compliance / Security Engineer

Назначение:
- Юридически значимое логирование всех операций с персональными данными (ПДн).
- Обязательная фиксация каждого случая раскрытия контактов соискателя работодателю.
- Фиксация изменений согласий, смены грейдов и попыток несанкционированного доступа.
- Неизменяемость (append-only) записей аудита.
================================================================================
"""

import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert

# Опережающий импорт модели AuditLog


async def log_security_event(
    db: AsyncSession,
    actor_id: Optional[int],
    action: str,
    target_type: str,
    target_id: Optional[int] = None,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Запись события безопасности в неизменяемый аудит-лог.
    
    Примеры действий:
    - 'CONTACTS_REVEALED': Кандидат принял приглашение, контакты переданы компании.
    - 'CONSENT_GRANTED': Принято согласие на обработку ПДн по 152-ФЗ.
    - 'CONSENT_REVOKED': Отозвано согласие на обработку данных.
    - 'GRADE_CHANGED': Успешно пройден CAT-тест, обновлена категория.
    - 'DATA_EXPORT_REQUESTED': Выгрузка персональных данных по ст. 14 152-ФЗ.
    """
    from app.models.user import AuditLog

    audit_entry = AuditLog(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        ip_address=ip_address,
        details_json=json.dumps(details or {}, ensure_ascii=False),
        created_at=datetime.now(timezone.utc),
    )
    db.add(audit_entry)
    await db.commit()

"""
================================================================================
ФСП ХАКАТОН 2026: СКРИПТ НАПОЛНЕНИЯ БАЗЫ ДАННЫХ (Seed Database CLI)
================================================================================
Зона ответственности: Data Engineer / DevOps

Назначение:
- Автоматическое наполнение пустой базы данных справочниками таксономии,
  банком параметризованных заданий IRT, демонстрационными кандидатами
  (с историей ФСП и без) и профилями компаний-работодателей (Сбер, Яндекс).
- Запуск одной командой: `python -m seed.seed_data` (или `make seed`).
================================================================================
"""

import asyncio
import json
import os
import sys

# Обеспечиваем безопасный вывод UTF-8 в консолях Windows (cp1251)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Добавляем backend в sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, Consent
from app.models.taxonomy import Specialization, Grade, Skill
from app.models.candidate import CandidateProfile, CandidateCategory, CandidateSkill
from app.models.employer import EmployerProfile, EmployerNeed
from app.models.assessment import ItemTemplate, ItemParam
from app.models.fsp import FspProfile, FspAchievement
from app.models.invitation import Invitation
from app.models.vacancy import Vacancy, Application, DailyChallenge, ChallengeSubmission
from app.services.fsp.mock_provider import MockFspProvider


async def seed_all():
    print("🚀 [FSP Seed] Инициализация структуры базы данных...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        seed_dir = os.path.dirname(__file__)

        # ---------------------------------------------------------------------
        # 1. Загрузка таксономии (Специализации, Грейды, Навыки)
        # ---------------------------------------------------------------------
        print("📦 [FSP Seed] Наполнение справочников таксономии...")
        with open(os.path.join(seed_dir, "taxonomy.json"), "r", encoding="utf-8") as f:
            tax_data = json.load(f)

        spec_map = {}
        for s in tax_data["specializations"]:
            res = await db.execute(select(Specialization).where(Specialization.slug == s["slug"]))
            existing = res.scalar_one_or_none()
            if not existing:
                existing = Specialization(slug=s["slug"], name_ru=s["name_ru"], description=s["description"])
                db.add(existing)
                await db.flush()
            spec_map[s["slug"]] = existing

        grade_map = {}
        for g in tax_data["grades"]:
            res = await db.execute(select(Grade).where(Grade.slug == g["slug"]))
            existing = res.scalar_one_or_none()
            if not existing:
                existing = Grade(slug=g["slug"], name_ru=g["name_ru"], rank_order=g["rank_order"], min_theta=g["min_theta"], max_theta=g["max_theta"])
                db.add(existing)
                await db.flush()
            grade_map[g["slug"]] = existing

        skill_map = {}
        for sk in tax_data["skills"]:
            res = await db.execute(select(Skill).where(Skill.name == sk["name"]))
            existing = res.scalar_one_or_none()
            if not existing:
                existing = Skill(name=sk["name"], category=sk["category"])
                db.add(existing)
                await db.flush()
            skill_map[sk["name"]] = existing

        # ---------------------------------------------------------------------
        # 2. Загрузка параметризованных шаблонов заданий CAT (2PL IRT)
        # ---------------------------------------------------------------------
        print("📝 [FSP Seed] Загрузка калиброванного банка заданий CAT...")
        with open(os.path.join(seed_dir, "question_templates.json"), "r", encoding="utf-8") as f:
            templates_data = json.load(f)

        for t in templates_data:
            res = await db.execute(select(ItemTemplate).where(ItemTemplate.code == t["code"]))
            if not res.scalar_one_or_none():
                spec = spec_map[t["specialization_slug"]]
                grade = grade_map[t["target_grade_slug"]]
                tmpl = ItemTemplate(
                    code=t["code"],
                    title=t["title"],
                    specialization_id=spec.id,
                    target_grade_id=grade.id,
                    template_payload=t["template_payload"],
                    checker_code=t["checker_code"],
                    is_active=True
                )
                db.add(tmpl)
                await db.flush()

                param = ItemParam(
                    template_id=tmpl.id,
                    discrimination_a=t["discrimination_a"],
                    difficulty_b=t["difficulty_b"],
                    calibration_sample_size=150
                )
                db.add(param)

        # ---------------------------------------------------------------------
        # 3. Загрузка демо-кандидатов (с историей ФСП и без нее)
        # ---------------------------------------------------------------------
        print("👤 [FSP Seed] Загрузка демо-соискателей...")
        with open(os.path.join(seed_dir, "demo_candidates.json"), "r", encoding="utf-8") as f:
            cand_list = json.load(f)

        for c in cand_list:
            res = await db.execute(select(User).where(User.email == c["email"]))
            if not res.scalar_one_or_none():
                user = User(
                    email=c["email"],
                    password_hash=get_password_hash("password123"),
                    role="candidate",
                    is_active=True,
                    is_verified=True
                )
                db.add(user)
                await db.flush()

                # Согласие 152-ФЗ
                db.add(Consent(user_id=user.id, consent_type="pdn_processing", is_accepted=True))

                profile = CandidateProfile(
                    user_id=user.id,
                    pseudonym=c["pseudonym"],
                    first_name=c["first_name"],
                    last_name=c["last_name"],
                    phone=c["phone"],
                    contact_email=c["contact_email"],
                    telegram=c["telegram"],
                    bio=c["bio"],
                    years_of_experience=c["years_of_experience"],
                    city=c["city"],
                    is_open_to_offers=True,
                    preferred_salary_from=c["preferred_salary_from"],
                    preferred_salary_to=c["preferred_salary_to"]
                )
                db.add(profile)
                await db.flush()

                # Присвоение категории
                spec = spec_map[c["specialization_slug"]]
                grade = grade_map[c["grade_slug"]]
                db.add(CandidateCategory(
                    candidate_id=profile.id,
                    specialization_id=spec.id,
                    grade_id=grade.id,
                    final_theta=c["theta"],
                    percentile=c["percentile"],
                    confidence_score=1.0,
                    is_active=True
                ))

                # Навыки
                for s_name in c["skills"]:
                    if s_name in skill_map:
                        db.add(CandidateSkill(
                            candidate_id=profile.id,
                            skill_id=skill_map[s_name].id,
                            is_verified_by_test=True
                        ))

                # ФСП
                if c.get("fsp_id"):
                    fsp_record = MockFspProvider.verify_fsp_id(c["fsp_id"])
                    if fsp_record:
                        fsp_prof = FspProfile(
                            candidate_id=profile.id,
                            fsp_id=c["fsp_id"],
                            full_name_in_registry=fsp_record["full_name"],
                            sync_status="synced"
                        )
                        db.add(fsp_prof)
                        await db.flush()
                        for ach in fsp_record["achievements"]:
                            db.add(FspAchievement(
                                fsp_profile_id=fsp_prof.id,
                                event_name=ach["event_name"],
                                event_year=ach["event_year"],
                                event_tier=ach["event_tier"],
                                discipline=ach["discipline"],
                                rank_or_place=ach["rank_or_place"],
                                medal=ach["medal"],
                                normalized_bonus=ach["normalized_bonus"]
                            ))

        # ---------------------------------------------------------------------
        # 4. Загрузка компаний-работодателей и потребностей
        # ---------------------------------------------------------------------
        print("🏢 [FSP Seed] Загрузка компаний-работодателей...")
        with open(os.path.join(seed_dir, "demo_employers.json"), "r", encoding="utf-8") as f:
            emp_list = json.load(f)

        for emp_idx, e in enumerate(emp_list, start=1):
            emp_email = f"employer{emp_idx}@demo.ru"
            res = await db.execute(select(User).where(User.email == emp_email))
            if not res.scalar_one_or_none():
                user = User(
                    email=emp_email,
                    password_hash=get_password_hash("password123"),
                    role="employer",
                    is_active=True,
                    is_verified=True
                )
                db.add(user)
                await db.flush()

                db.add(Consent(user_id=user.id, consent_type="pdn_processing", is_accepted=True))

                profile = EmployerProfile(
                    user_id=user.id,
                    company_name=e["company_name"],
                    description=e["description"],
                    website=e["website"],
                    industry=e["industry"],
                    contact_person=e["contact_person"],
                    contact_email=e["contact_email"]
                )
                db.add(profile)
                await db.flush()

                for need in e.get("needs", []):
                    spec = spec_map[need["specialization_slug"]]
                    grade = grade_map[need["target_grade_slug"]]
                    db.add(EmployerNeed(
                        employer_id=profile.id,
                        title=need["title"],
                        specialization_id=spec.id,
                        target_grade_id=grade.id,
                        salary_from=need["salary_from"],
                        salary_to=need["salary_to"],
                        required_skills=",".join(need["required_skills"]),
                        description=need["description"]
                    ))

        await db.commit()
        print("✅ [FSP Seed] База данных успешно наполнена всеми справочниками и демо-данными!")


if __name__ == "__main__":
    asyncio.run(seed_all())

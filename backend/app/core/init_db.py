import os
import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.taxonomy import Specialization, Grade, Skill
from app.models.assessment import ItemTemplate, ItemParam
from app.models.user import User, Consent
from app.models.candidate import CandidateProfile, CandidateCategory, CandidateSkill
from app.models.employer import EmployerProfile, EmployerNeed
from app.models.fsp import FspProfile, FspAchievement
from app.models.invitation import Invitation
from app.models.vacancy import Vacancy, Application, DailyChallenge
from app.core.security import get_password_hash

logger = logging.getLogger("fsp_init_db")

async def ensure_db_initialized(db: AsyncSession):
    """
    Проверяет, наполнена ли БД базовыми справочниками.
    Если база пуста, автоматически загружает таксономию, шаблоны CAT и демо-пользователей.
    """
    res = await db.execute(select(func.count(Specialization.id)))
    count = res.scalar() or 0
    if count > 0:
        return

    logger.info("⚡ [Auto-Init] Обнаружена пустая БД. Запуск автоматической инициализации...")

    # Путь к seed-файлам (в корне репозитория или в папке seed)
    possible_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "seed")),
        os.path.abspath(os.path.join(os.getcwd(), "seed")),
        os.path.abspath(os.path.join(os.getcwd(), "..", "seed")),
    ]
    seed_dir = None
    for d in possible_dirs:
        if os.path.exists(os.path.join(d, "taxonomy.json")):
            seed_dir = d
            break

    if not seed_dir:
        logger.warning("⚠️ [Auto-Init] Папка seed не найдена, авто-наполнение пропущено.")
        return

    try:
        # 1. Таксономия
        with open(os.path.join(seed_dir, "taxonomy.json"), "r", encoding="utf-8") as f:
            tax_data = json.load(f)

        spec_map = {}
        for s in tax_data["specializations"]:
            spec = Specialization(slug=s["slug"], name_ru=s["name_ru"], description=s["description"])
            db.add(spec)
            await db.flush()
            spec_map[s["slug"]] = spec

        grade_map = {}
        for g in tax_data["grades"]:
            grade = Grade(slug=g["slug"], name_ru=g["name_ru"], rank_order=g["rank_order"], min_theta=g["min_theta"], max_theta=g["max_theta"])
            db.add(grade)
            await db.flush()
            grade_map[g["slug"]] = grade

        skill_map = {}
        for sk in tax_data["skills"]:
            skill = Skill(name=sk["name"], category=sk["category"])
            db.add(skill)
            await db.flush()
            skill_map[sk["name"]] = skill

        # 2. Банк заданий CAT
        with open(os.path.join(seed_dir, "question_templates.json"), "r", encoding="utf-8") as f:
            templates_data = json.load(f)

        for t in templates_data:
            spec = spec_map.get(t["specialization_slug"])
            grade = grade_map.get(t["target_grade_slug"])
            if not spec or not grade:
                continue
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
                discrimination_a=t.get("discrimination_a", 1.25),
                difficulty_b=t.get("difficulty_b", 0.0),
                calibration_sample_size=1000
            )
            db.add(param)

        # 3. Демо-соискатели
        with open(os.path.join(seed_dir, "demo_candidates.json"), "r", encoding="utf-8") as f:
            candidates_data = json.load(f)

        for c in candidates_data:
            user = User(
                email=c["email"],
                password_hash=get_password_hash("password123"),
                role="candidate",
                is_active=True,
                is_verified=True
            )
            db.add(user)
            await db.flush()

            consent = Consent(user_id=user.id, consent_type="pdn_processing", version="1.0", is_accepted=True)
            db.add(consent)

            cand = CandidateProfile(
                user_id=user.id,
                first_name=c["first_name"],
                last_name=c["last_name"],
                phone=c["phone"],
                contact_email=c.get("contact_email", c["email"]),
                telegram=c.get("telegram", ""),
                city=c.get("city", "Москва"),
                years_of_experience=c.get("years_of_experience", 2.0),
                preferred_salary_from=c.get("preferred_salary_from", 150000),
                preferred_salary_to=c.get("preferred_salary_to", 200000),
                pseudonym=c["pseudonym"],
                is_open_to_offers=True
            )
            db.add(cand)
            await db.flush()

            spec_slug = c.get("specialization_slug") or (c.get("category", {}).get("specialization_slug"))
            grade_slug = c.get("grade_slug") or (c.get("category", {}).get("grade_slug"))
            cat_spec = spec_map.get(spec_slug)
            cat_grade = grade_map.get(grade_slug)
            if cat_spec and cat_grade:
                category = CandidateCategory(
                    candidate_id=cand.id,
                    specialization_id=cat_spec.id,
                    grade_id=cat_grade.id,
                    final_theta=c.get("theta") or c.get("category", {}).get("final_theta", 0.0),
                    percentile=c.get("percentile") or c.get("category", {}).get("percentile", 50.0),
                    confidence_score=c.get("confidence_score") or c.get("category", {}).get("confidence_score", 1.0),
                    is_active=True
                )
                db.add(category)

            for sk_name in c.get("skills", []):
                if sk_name in skill_map:
                    cand_skill = CandidateSkill(candidate_id=cand.id, skill_id=skill_map[sk_name].id)
                    db.add(cand_skill)

            fsp_id = c.get("fsp_id") or (c.get("fsp", {}).get("fsp_id") if isinstance(c.get("fsp"), dict) else None)
            if fsp_id:
                fsp_prof = FspProfile(candidate_id=cand.id, fsp_id=fsp_id)
                db.add(fsp_prof)
                await db.flush()
                achievements = c.get("fsp", {}).get("achievements", []) if isinstance(c.get("fsp"), dict) else [
                    {"event": "Чемпионат России по спортивному программированию 2024", "year": 2024, "medal": "silver", "place": "2 место"}
                ]
                for a in achievements:
                    ach = FspAchievement(
                        fsp_profile_id=fsp_prof.id,
                        event_name=a.get("event", "Турнир ФСП"),
                        event_year=a.get("year", 2024),
                        medal=a.get("medal", "silver"),
                        rank_or_place=a.get("place", "Призёр")
                    )
                    db.add(ach)

        # 4. Демо-работодатели
        with open(os.path.join(seed_dir, "demo_employers.json"), "r", encoding="utf-8") as f:
            employers_data = json.load(f)

        for emp_data in employers_data:
            emp_email = emp_data.get("contact_email") or emp_data.get("email") or "employer@demo.ru"
            user = User(
                email=emp_email,
                password_hash=get_password_hash("password123"),
                role="employer",
                is_active=True,
                is_verified=True
            )
            db.add(user)
            await db.flush()

            emp = EmployerProfile(
                user_id=user.id,
                company_name=emp_data["company_name"],
                industry=emp_data.get("industry", "IT"),
                website=emp_data.get("website", ""),
                contact_person=emp_data.get("contact_person", "HR-директор"),
                contact_email=emp_email,
                contact_phone=emp_data.get("contact_phone", "+7 (495) 000-00-00")
            )
            db.add(emp)
            await db.flush()

            for n in emp_data.get("needs", []):
                spec = spec_map.get(n.get("specialization_slug"))
                grade = grade_map.get(n.get("target_grade_slug"))
                if spec and grade:
                    sal_min = n.get("salary_budget_min") or n.get("salary_from", 150000)
                    sal_max = n.get("salary_budget_max") or n.get("salary_to", 220000)
                    req_skills = n.get("required_skills", [])
                    if isinstance(req_skills, list):
                        req_skills = ",".join(req_skills)
                    need = EmployerNeed(
                        employer_id=emp.id,
                        title=n["title"],
                        specialization_id=spec.id,
                        target_grade_id=grade.id,
                        salary_budget_min=sal_min,
                        salary_budget_max=sal_max,
                        required_skills=req_skills,
                        is_active=True
                    )
                    db.add(need)

        # 5. Демо-вакансии и ежедневные задачи
        daily1 = DailyChallenge(
            title="Оптимизация поиска в отсортированном циклическом массиве",
            description="Дан циклически сдвинутый отсортированный массив. Предложите алгоритм поиска элемента с временной сложностью O(log N).",
            reward_badge="Алгоритмический спринтер ФСП"
        )
        daily2 = DailyChallenge(
            title="Проектирование идемпотентного API-эндпоинта списания баланса",
            description="Опишите механизм предотвращения двойного списания при сетевых таймаутах (Idempotency Key в заголовках, Redis Distributed Lock).",
            reward_badge="Системный архитектор ФСП"
        )
        db.add_all([daily1, daily2])

        await db.commit()
        logger.info("[Auto-Init] Database initialized successfully on startup!")
    except Exception as e:
        await db.rollback()
        logger.error(f"[Auto-Init] Initialization error: {e}", exc_info=True)

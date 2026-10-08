"""
================================================================================
ФСП ХАКАТОН 2026: ГЕНЕРАТОР PDF-ДОКУМЕНТАЦИИ ДЛЯ BACKEND-КОМАНДЫ
================================================================================
Зона ответственности: Backend Lead / Data Architect / ML Engineer

Назначение:
- Генерация исчерпывающего технического руководства для разработчиков бэкенда
  (docs/FSP_Backend_Architecture_and_Guide.pdf).
- Детальный разбор FastAPI, SQLAlchemy 2.0 Async, PostgreSQL + pgvector,
  конечного автомата приглашений, защиты 152-ФЗ, 2PL IRT математики,
  скоринга подбора и перенормировки весов.
================================================================================
"""

import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def register_cyrillic_fonts():
    font_paths = [
        ("Arial", "C:/Windows/Fonts/arial.ttf"),
        ("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"),
    ]
    for font_name, path in font_paths:
        if os.path.exists(path):
            pdfmetrics.registerFont(TTFont(font_name, path))


def generate_backend_guide_pdf(output_path: str):
    register_cyrillic_fonts()

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm
    )

    styles = getSampleStyleSheet()

    fsp_purple = colors.HexColor("#4A0E4E")
    fsp_primary = colors.HexColor("#5E17EB")
    fsp_slate = colors.HexColor("#1E293B")
    fsp_bg_light = colors.HexColor("#F8FAFC")

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Arial-Bold',
        fontSize=17,
        leading=22,
        textColor=fsp_purple,
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Arial',
        fontSize=10,
        leading=14,
        textColor=fsp_slate,
        spaceAfter=10
    )
    h1_style = ParagraphStyle(
        'DocH1',
        fontName='Arial-Bold',
        fontSize=12,
        leading=16,
        textColor=fsp_primary,
        spaceBefore=9,
        spaceAfter=5
    )
    h2_style = ParagraphStyle(
        'DocH2',
        fontName='Arial-Bold',
        fontSize=10,
        leading=13.5,
        textColor=fsp_purple,
        spaceBefore=7,
        spaceAfter=3
    )
    body_style = ParagraphStyle(
        'DocBody',
        fontName='Arial',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        spaceAfter=4
    )
    bullet_style = ParagraphStyle(
        'DocBullet',
        fontName='Arial',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#334155"),
        leftIndent=12,
        spaceAfter=3
    )
    code_block_style = ParagraphStyle(
        'DocCode',
        fontName='Arial',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0F172A"),
        leftIndent=8,
        spaceAfter=3
    )
    table_text = ParagraphStyle(
        'TableText',
        fontName='Arial',
        fontSize=7.5,
        leading=10,
        textColor=fsp_slate
    )
    table_header = ParagraphStyle(
        'TableHeader',
        fontName='Arial-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    story = []

    # ТИТУЛ
    story.append(Paragraph("ФЕДЕРАЦИЯ СПОРТИВНОГО ПРОГРАММИРОВАНИЯ РОССИИ • ХАКАТОН 2026", ParagraphStyle('FSPH', fontName='Arial-Bold', fontSize=9, textColor=fsp_primary, leading=11)))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Архитектурное и техническое руководство для Backend-команды", title_style))
    story.append(Paragraph("Команда: <b>Phaeton</b> • FastAPI, SQLAlchemy 2.0 Async, PostgreSQL + pgvector, 2PL IRT, 152-ФЗ", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=fsp_primary, spaceBefore=0, spaceAfter=10))

    # РАЗДЕЛ 1: СТЕК И АРХИТЕКТУРА
    story.append(Paragraph("1. Архитектурный стек бэкенда и структура слоев", h1_style))
    story.append(Paragraph(
        "Бэкенд реализован по архитектуре <b>модульного монолита</b> на базе <b>Python 3.11+, FastAPI 0.115+, SQLAlchemy 2.0 Async (asyncpg) и Pydantic v2</b>. Решение разворачивается в одном контейнере без тяжелых зависимостей (PyTorch заменен на легковесный ONNX Runtime CPU + PostgreSQL Russian Full-Text Search).",
        body_style
    ))

    stack_data = [
        [Paragraph("Компонент", table_header), Paragraph("Технологии / Библиотеки", table_header), Paragraph("Функциональные обязанности и ключевые файлы", table_header)],
        [
            Paragraph("<b>Core & Security</b>", table_text),
            Paragraph("Argon2 (argon2-cffi)<br/>python-jose (JWT)<br/>Pydantic Settings", table_text),
            Paragraph("Хеширование паролей, выпуск и верификация токенов авторизации, ролевая модель RBAC (candidate, employer, admin).<br/>Файлы: <code>core/config.py</code>, <code>core/security.py</code>", table_text)
        ],
        [
            Paragraph("<b>Data Layer (БД)</b>", table_text),
            Paragraph("PostgreSQL 16<br/>pgvector, pg_trgm<br/>SQLAlchemy 2.0 Async", table_text),
            Paragraph("Асинхронные сессии через asyncpg, реляционные модели со строгими внешними ключами и каскадами. Гибридный полнотекстовый и векторный поиск.<br/>Файлы: <code>core/database.py</code>, <code>models/</code>", table_text)
        ],
        [
            Paragraph("<b>Адаптивное тестирование</b>", table_text),
            Paragraph("2PL IRT Бирнбаума<br/>Bayes EAP (NumPy/SciPy)<br/>Jinja2 чекеры", table_text),
            Paragraph("Выбор следующего вопроса по максимуму информации Фишера, байесовский пересчет способности theta, детекция читерства (тайминг, смены вкладок).<br/>Файлы: <code>services/assessment/</code>", table_text)
        ],
        [
            Paragraph("<b>Обратный подбор (Matching)</b>", table_text),
            Paragraph("ReverseMatchingRanker<br/>ExplainabilityService<br/>Эмбеддинги ONNX", table_text),
            Paragraph("Многофакторное ранжирование (стек, грейд, зарплата, свежесть, ФСП). Автоматическая перенормировка весов для кандидатов БЕЗ ФСП.<br/>Файлы: <code>services/matching/</code>", table_text)
        ],
        [
            Paragraph("<b>Конечный автомат (Инвайты)</b>", table_text),
            Paragraph("State Machine<br/>Audit Logger (152-ФЗ)", table_text),
            Paragraph("Управление статусами приглашений (DRAFT -> SENT -> ACCEPTED). Физическое скрытие контактов соискателя до акцепта.<br/>Файлы: <code>api/v1/invitations.py</code>, <code>core/audit.py</code>", table_text)
        ]
    ]

    stack_table = Table(stack_data, colWidths=[3.2 * cm, 4.3 * cm, 10.5 * cm])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), fsp_primary),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, fsp_bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(stack_table)
    story.append(Spacer(1, 8))

    # РАЗДЕЛ 2: СХЕМА БАЗЫ ДАННЫХ
    story.append(Paragraph("2. Точечные детали моделей данных и реляционной схемы", h1_style))
    story.append(Paragraph("В проекте выделено 8 ключевых доменных сущностей (папка <code>backend/app/models/</code>):", body_style))
    story.append(Paragraph("• <b>User, Consent, AuditLog (user.py):</b> учетная запись пользователя, версионированное согласие по 152-ФЗ и неизменяемый журнал событий безопасности.", bullet_style))
    story.append(Paragraph("• <b>CandidateProfile, CandidateCategory, CandidateSkill (candidate.py):</b> профиль соискателя с псевдонимом (например <code>Backend-Dev-#101</code>), подтвержденная категория (Специализация x Грейд) по результатам CAT, перцентиль и закрытые контакты.", bullet_style))
    story.append(Paragraph("• <b>EmployerProfile, EmployerNeed, SearchSession (employer.py):</b> профиль компании, потребность найма с обязательной зарплатной вилкой (<code>salary_from <= salary_to</code>, строго > 0) и серверные сессии поиска, предотвращающие сброс фильтров.", bullet_style))
    story.append(Paragraph("• <b>ItemTemplate, ItemParam, AssessmentSession, AssessmentResponse (assessment.py):</b> шаблоны параметризованных задач с детерминированным чекером, психометрические параметры 2PL IRT (a, b), сессии CAT и журнал ответов кандидатов.", bullet_style))
    story.append(Paragraph("• <b>Invitation, InvitationEvent (invitation.py):</b> модель персонального выхода на контакт с гарантированной зарплатной вилкой и журнал переходов статусов.", bullet_style))
    story.append(Paragraph("• <b>FspProfile, FspAchievement (fsp.py):</b> привязка к единому FSP ID и достижения участника соревнований по спортивному программированию.", bullet_style))
    story.append(Spacer(1, 6))

    # РАЗДЕЛ 3: 152-ФЗ И СОКРЫТИЕ КОНТАКТОВ
    story.append(Paragraph("3. Реализация защиты персональных данных (152-ФЗ)", h1_style))
    story.append(Paragraph(
        "<b>КРИТИЧЕСКОЕ ТРЕБОВАНИЕ ТЗ:</b> Сокрытие контактов кандидата должно выполняться на уровне сервиса данных и DTO, а не просто стилями в UI! Если в ответе API работодателю присутствуют поля email/phone/telegram до статуса ACCEPTED — это грубое нарушение 152-ФЗ.",
        body_style
    ))
    story.append(Paragraph("<b>Как это реализовано в коде:</b>", h2_style))
    story.append(Paragraph("1. В схеме <code>CandidatePublicCard</code> (файл <code>schemas/candidate.py</code>) поля <code>first_name, last_name, phone, email, telegram</code> физически отсутствуют в структуре класса.", bullet_style))
    story.append(Paragraph("2. В эндпоинтах приглашений (<code>api/v1/invitations.py</code>) блок <code>revealed_contacts</code> заполняется данными ТОЛЬКО при условии: <code>if invitation.status == 'ACCEPTED': ...</code>. Во всех остальных статусах (DRAFT, SENT, VIEWED, DECLINED) возвращается <code>null</code>.", bullet_style))
    story.append(Paragraph("3. При переходе в ACCEPTED вызывается сервис <code>log_security_event()</code>, который делает юридически значимую запись в таблицу <code>audit_log</code>.", bullet_style))
    story.append(Paragraph("4. В репозитории написан специальный тест безопасности <code>tests/test_privacy_leak.py</code>, подтверждающий отсутствие утечек.", bullet_style))
    story.append(Spacer(1, 6))

    # РАЗДЕЛ 4: МАТЕМАТИКА CAT И СКОРИНГ
    story.append(Paragraph("4. Математика тестирования (2PL IRT) и скоринг подбора", h1_style))
    story.append(Paragraph("<b>Формулы адаптивного тестирования CAT:</b>", h2_style))
    story.append(Paragraph("• Вероятность правильного ответа (Birnbaum 2PL): <code>P(theta) = 1 / (1 + exp(-1.7 * a * (theta - b)))</code>", bullet_style))
    story.append(Paragraph("• Информационная функция Фишера: <code>I(theta) = (1.7 * a)^2 * P(theta) * (1 - P(theta))</code>", bullet_style))
    story.append(Paragraph("• Выбор следующего вопроса: <code>argmax I(theta_hat)</code> среди доступных заданий с randomesque выборкой из топ-3 (контроль экспозиции).", bullet_style))
    story.append(Paragraph("• Оценка методом Bayes EAP: численное интегрирование на 41 квадратурном узле Гаусса-Эрмита от -4.0 до +4.0 с априорным N(0, 1). Никогда не расходится!", bullet_style))
    story.append(Paragraph("• Критерий остановки: <code>SE(theta) <= 0.35</code> или достижение диапазона 8..15 вопросов.", bullet_style))

    story.append(Paragraph("<b>Многофакторный скоринг обратного подбора (Reverse Matching):</b>", h2_style))
    story.append(Paragraph("<code>Score = HardFilter * [w_stack*S_stack + w_grade*S_grade + w_salary*S_salary + w_fresh*S_fresh + w_fsp*S_fsp] * Confidence</code>", code_block_style))
    story.append(Paragraph("• <b>Правило справедливости для кандидатов БЕЗ ФСП:</b> если <code>has_fsp == False</code>, вес <code>w_fsp = 0</code>, а остальные веса динамически делятся на сумму оставшихся: <code>w_new = w / (w_stack + w_grade + w_salary + w_fresh)</code>. Их сумма всегда строго равна 1.0! Сильные кандидаты без соревнований не штрафуются.", bullet_style))
    story.append(Spacer(1, 6))

    # РАЗДЕЛ 5: ЗАПУСК И КОМАНДЫ
    story.append(Paragraph("5. Инструкция по локальной разработке и проверке бэкенда", h1_style))
    story.append(Paragraph("<code>pip install -r backend/requirements.txt</code> — установка зависимостей", code_block_style))
    story.append(Paragraph("<code>python -m seed.seed_data</code> — автоматическое наполнение БД таксономией, шаблонами и демо-данными", code_block_style))
    story.append(Paragraph("<code>python -m pytest backend/tests -v</code> — запуск тестов бэкенда и проверки 152-ФЗ на утечки контактов (8/8 успешно)", code_block_style))
    story.append(Paragraph("<code>python -m validation.run_all</code> — запуск полного пакета научной валидации (MAE, r, nDCG)", code_block_style))
    story.append(Paragraph("<code>uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload</code> — локальный запуск сервера FastAPI", code_block_style))

    doc.build(story)
    print(f"✅ [PDF Generator] Документация бэкенда успешно создана: {output_path}")


if __name__ == "__main__":
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs"))
    os.makedirs(out_dir, exist_ok=True)
    out_pdf = os.path.join(out_dir, "FSP_Backend_Architecture_and_Guide.pdf")
    generate_backend_guide_pdf(out_pdf)

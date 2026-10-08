"""
================================================================================
ФСП ХАКАТОН 2026: ГЕНЕРАТОР PDF-ДОКУМЕНТАЦИИ ДЛЯ FRONTEND-КОМАНДЫ
================================================================================
Зона ответственности: Frontend Lead / QA Lead

Назначение:
- Генерация специализированного руководства и дорожной карты в формате PDF
  (docs/FSP_Frontend_Team_Guide.pdf) для разработчиков клиентской части.
- Подробное описание сценариев, компонентов, API-контрактов, брендбука ФСП
  и критериев оценки хакатона.
================================================================================
"""

import os
import sys

# Обеспечиваем безопасный вывод UTF-8 в консолях Windows (cp1251)
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
    """Регистрация системных шрифтов с поддержкой кириллицы"""
    font_paths = [
        ("Arial", "C:/Windows/Fonts/arial.ttf"),
        ("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"),
    ]
    for font_name, path in font_paths:
        if os.path.exists(path):
            pdfmetrics.registerFont(TTFont(font_name, path))


def generate_frontend_guide_pdf(output_path: str):
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

    # Фирменная палитра ФСП
    fsp_purple = colors.HexColor("#4A0E4E")
    fsp_primary = colors.HexColor("#5E17EB")
    fsp_slate = colors.HexColor("#1E293B")
    fsp_bg_light = colors.HexColor("#F8FAFC")
    fsp_gold = colors.HexColor("#D97706")

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Arial-Bold',
        fontSize=18,
        leading=24,
        textColor=fsp_purple,
        spaceAfter=8
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Arial',
        fontSize=10.5,
        leading=15,
        textColor=fsp_slate,
        spaceAfter=12
    )
    h1_style = ParagraphStyle(
        'DocH1',
        fontName='Arial-Bold',
        fontSize=13,
        leading=17,
        textColor=fsp_primary,
        spaceBefore=10,
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        'DocH2',
        fontName='Arial-Bold',
        fontSize=10.5,
        leading=14,
        textColor=fsp_purple,
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'DocBody',
        fontName='Arial',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=5
    )
    bullet_style = ParagraphStyle(
        'DocBullet',
        fontName='Arial',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#334155"),
        leftIndent=12,
        spaceAfter=3
    )
    code_block_style = ParagraphStyle(
        'DocCode',
        fontName='Arial',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        leftIndent=10,
        spaceAfter=4
    )
    table_text = ParagraphStyle(
        'TableText',
        fontName='Arial',
        fontSize=8,
        leading=11,
        textColor=fsp_slate
    )
    table_header = ParagraphStyle(
        'TableHeader',
        fontName='Arial-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.white
    )

    story = []

    # =========================================================================
    # ТИТУЛЬНЫЙ БЛОК
    # =========================================================================
    story.append(Paragraph("ФЕДЕРАЦИЯ СПОРТИВНОГО ПРОГРАММИРОВАНИЯ РОССИИ • ХАКАТОН 2026", ParagraphStyle('FSPHeader', fontName='Arial-Bold', fontSize=9.5, textColor=fsp_primary, leading=12)))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Дорожная карта и техническое руководство для Frontend-команды", title_style))
    story.append(Paragraph("Команда: <b>Phaeton</b> • Стек: React 18, Vite, TypeScript, Tailwind CSS, Lucide • Версия 1.0", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=fsp_primary, spaceBefore=0, spaceAfter=12))

    # =========================================================================
    # РАЗДЕЛ 1: БЫСТРЫЙ СТАРТ
    # =========================================================================
    story.append(Paragraph("1. Быстрый старт и автономный режим разработки", h1_style))
    story.append(Paragraph(
        "Вся базовая структура фронтенда уже создана и находится в каталоге <code>frontend/</code>. В клиентский модуль встроен <b>автономный Mock-режим</b> (в <code>frontend/src/lib/api.ts</code>), который позволяет фронтендерам полноценно верстать, тестировать интерактив и запускать все экраны даже без запущенного бэкенда!",
        body_style
    ))
    story.append(Paragraph("<b>Команды для запуска:</b>", h2_style))
    story.append(Paragraph("<code>cd frontend</code> — перейти в директорию интерфейса", code_block_style))
    story.append(Paragraph("<code>npm install</code> — установить все зависимости (React, Tailwind, Lucide Icons)", code_block_style))
    story.append(Paragraph("<code>npm run dev</code> — запустить сервер разработки на <b>http://localhost:3000</b> (или 5173)", code_block_style))
    story.append(Spacer(1, 6))

    # =========================================================================
    # РАЗДЕЛ 2: КРИТЕРИИ ОЦЕНКИ И ФОКУС ФРОНТЕНДА
    # =========================================================================
    story.append(Paragraph("2. Критерии оценки хакатона и где зарабатываются баллы", h1_style))
    story.append(Paragraph(
        "Фронтенд напрямую определяет оценку по ключевым критериям регламента:",
        body_style
    ))

    criteria_data = [
        [Paragraph("Критерий ТЗ", table_header), Paragraph("Вес", table_header), Paragraph("Что оценивает жюри в интерфейсе", table_header)],
        [
            Paragraph("<b>Новая механика подбора</b>", table_text),
            Paragraph("<b>35%</b>", table_text),
            Paragraph("Сценарий обратного найма: работодатель ищет по верифицированным категориям, видит Explainable AI, отправляет инвайт с <b>обязательной вилкой зарплаты в рублях</b>. Контакты скрыты до принятия соискателем.", table_text)
        ],
        [
            Paragraph("<b>Тестирование и категоризация</b>", table_text),
            Paragraph("<b>25%</b>", table_text),
            Paragraph("Интерактивный адаптивный CAT-тест: динамические параметры кода, таймер, античит-сигнал смены вкладок, мгновенное присвоение категории (Специализация x Грейд) со шкалой перцентиля.", table_text)
        ],
        [
            Paragraph("<b>Интерфейс и UX</b>", table_text),
            Paragraph("<b>10%</b>", table_text),
            Paragraph("Понятность сквозного пути без подсказок, цвета брендбука ФСП (фиолетовый, лавандовый, золото), достаточный контраст, четкие статусные бейджи 152-ФЗ.", table_text)
        ],
        [
            Paragraph("<b>Презентация и питч</b>", table_text),
            Paragraph("<b>10%</b>", table_text),
            Paragraph("<b>Demo Persona Switcher</b>: переключение между демо-пользователями в 1 клик прямо в шапке (Иван с ФСП, Анна без ФСП, работодатели) для мгновенного показа жюри.", table_text)
        ],
        [
            Paragraph("<b>Дополнительный функционал</b>", table_text),
            Paragraph("<b>7%</b>", table_text),
            Paragraph("Клиентская печать/выгрузка PDF-резюме, открытые вакансии и отклик, регулярные микро-задачи дня.", table_text)
        ]
    ]

    crit_table = Table(criteria_data, colWidths=[4.5 * cm, 1.8 * cm, 11.7 * cm])
    crit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), fsp_primary),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, fsp_bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(crit_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # РАЗДЕЛ 3: КОНКРЕТНЫЕ ЗАДАЧИ ДЛЯ ФРОНТЕНДЕРОВ
    # =========================================================================
    story.append(Paragraph("3. Пошаговые задачи и закрепленные компоненты", h1_style))

    story.append(Paragraph("3.1. Экран адаптивного тестирования CAT (25% баллов)", h2_style))
    story.append(Paragraph("• <b>Файл:</b> <code>frontend/src/components/candidate/AssessmentRunner.tsx</code>", bullet_style))
    story.append(Paragraph("• <b>Задачи:</b>", bullet_style))
    story.append(Paragraph("  1. Подсветка кода: блок кода параметризованного вопроса оформить в темной теме с подсветкой синтаксиса.", bullet_style))
    story.append(Paragraph("  2. Индикатор прогресса CAT: шкала «Вопрос X из 12» и динамическое уменьшение стандартной ошибки SE(theta).", bullet_style))
    story.append(Paragraph("  3. Античит: при переключении вкладки браузера отображать мягкий индикатор фиксации аномалии.", bullet_style))
    story.append(Paragraph("  4. Финишный экран: анимированная карточка верифицированного грейда с перцентилем и бейджем.", bullet_style))

    story.append(Paragraph("3.2. Витрина подбора работодателя и Explainable AI (35% баллов)", h2_style))
    story.append(Paragraph("• <b>Файлы:</b> <code>frontend/src/components/employer/EmployerDashboard.tsx</code> и <code>ExplainModal.tsx</code>", bullet_style))
    story.append(Paragraph("• <b>Задачи:</b>", bullet_style))
    story.append(Paragraph("  1. Конструктор потребности: обязательные поля зарплатной вилки «от–до» в рублях с валидацией (от <= до, > 0).", bullet_style))
    story.append(Paragraph("  2. Обезличенные карточки соискателей: отображение псевдонима (Backend-Dev-#101), подтвержденного грейда, навыков и бейджа ФСП. Контакты строго скрыты плашкой 152-ФЗ!", bullet_style))
    story.append(Paragraph("  3. Модальное окно Explainable AI: визуализация декомпозиции факторов (стек 30%, грейд 25%, зарплата 20%, ФСП 15%, свежесть 10%) через анимированные прогресс-бары.", bullet_style))
    story.append(Paragraph("  4. Модалка отправки приглашения: отправка персонального оффера кандидату с предзаполненной вилкой ₽.", bullet_style))

    story.append(Paragraph("3.3. Личный кабинет соискателя и принятие предложений", h2_style))
    story.append(Paragraph("• <b>Файл:</b> <code>frontend/src/components/candidate/CandidateDashboard.tsx</code>", bullet_style))
    story.append(Paragraph("• <b>Задачи:</b>", bullet_style))
    story.append(Paragraph("  1. Входящие офферы компаний: крупное выделение гарантированной вилки зарплаты в рублях («200 000 – 250 000 ₽»).", bullet_style))
    story.append(Paragraph("  2. Кнопка «Принять предложение»: статус меняется на ACCEPTED, плашка меняется на «✅ Контакты раскрыты работодателю».", bullet_style))
    story.append(Paragraph("  3. Кнопка «Отклонить»: статус DECLINED, контакты остаются надежно заблокированными.", bullet_style))

    story.append(Paragraph("3.4. Верхняя панель переключения демо-ролей (Demo Persona Switcher)", h2_style))
    story.append(Paragraph("• <b>Файл:</b> <code>frontend/src/components/shared/PersonaSwitcher.tsx</code>", bullet_style))
    story.append(Paragraph("• <b>Задача:</b> Обеспечить моментальное переключение между Иван Смирнов (Middle с ФСП), Анна Васильева (Junior БЕЗ ФСП — показать честное ранжирование!) и работодателями СберТех / Яндекс без перезагрузки страницы.", bullet_style))
    story.append(Spacer(1, 8))

    # =========================================================================
    # РАЗДЕЛ 4: ДИЗАЙН-СИСТЕМА И БРЕНДБУК ФСП
    # =========================================================================
    story.append(Paragraph("4. Фирменная палитра брендбука ФСП (Tailwind)", h1_style))

    palette_data = [
        [Paragraph("Цвет / Класс Tailwind", table_header), Paragraph("HEX код", table_header), Paragraph("Применение в интерфейсе", table_header)],
        [Paragraph("<code>fsp-purple</code>", table_text), Paragraph("<b>#4A0E4E</b>", table_text), Paragraph("Глубокий фиолетовый: шапка, фон баннеров, градиенты", table_text)],
        [Paragraph("<code>fsp-primary</code>", table_text), Paragraph("<b>#5E17EB</b>", table_text), Paragraph("Яркий брендовый фиолетовый: основные кнопки, активные вкладки, акценты", table_text)],
        [Paragraph("<code>fsp-lavender</code>", table_text), Paragraph("<b>#F5F3FF</b>", table_text), Paragraph("Светлый лавандовый: фон тегов, карточек и активных элементов", table_text)],
        [Paragraph("<code>fsp-gold</code>", table_text), Paragraph("<b>#F59E0B</b>", table_text), Paragraph("Золото ФСП: бейджи призеров соревнований по спортивному программированию", table_text)],
        [Paragraph("<code>emerald-600</code>", table_text), Paragraph("<b>#059669</b>", table_text), Paragraph("Зеленый: вилки зарплаты («от-до ₽»), статус подтвержденных согласий 152-ФЗ", table_text)]
    ]

    pal_table = Table(palette_data, colWidths=[4.5 * cm, 3.5 * cm, 10.0 * cm])
    pal_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), fsp_purple),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, fsp_bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(pal_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # РАЗДЕЛ 5: ЧЕК-ЛИСТ ГОТОВНОСТИ К ПИТЧУ
    # =========================================================================
    story.append(Paragraph("5. Чек-лист готовности фронтенда к защите проекта", h1_style))
    story.append(Paragraph("• [ ] Сборка <code>npm run build</code> проходит успешно без ошибок компиляции TypeScript.", bullet_style))
    story.append(Paragraph("• [ ] Переключатель Persona Switcher в 1 клик переключает роли для показа жюри.", bullet_style))
    story.append(Paragraph("• [ ] В форме работодателя вилка зарплаты в рублях обязательна (валидация от <= до).", bullet_style))
    story.append(Paragraph("• [ ] Контакты соискателя скрыты до момента нажатия «Принять предложение».", bullet_style))
    story.append(Paragraph("• [ ] Модалка Explainable AI наглядно объясняет вклад каждого фактора в балл кандидата.", bullet_style))
    story.append(Paragraph("• [ ] Прохождение CAT-теста плавно обновляет латентную способность theta и SE.", bullet_style))

    doc.build(story)
    print(f"✅ [PDF Generator] Документация фронтенда успешно создана: {output_path}")


if __name__ == "__main__":
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs"))
    os.makedirs(out_dir, exist_ok=True)
    out_pdf = os.path.join(out_dir, "FSP_Frontend_Team_Guide.pdf")
    generate_frontend_guide_pdf(out_pdf)

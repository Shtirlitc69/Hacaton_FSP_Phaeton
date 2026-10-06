# ==============================================================================
# ФСП ХАКАТОН 2026: УПРАВЛЕНИЕ ПРОЕКТОМ ЧЕРЕЗ MAKEFILE
# ==============================================================================

.PHONY: help up down restart logs build seed test validate clean lint

help:
	@echo "Доступные команды:"
	@echo "  make up        - Запустить все сервисы в Docker Compose"
	@echo "  make down      - Остановить все сервисы"
	@echo "  make restart   - Перезапустить все сервисы"
	@echo "  make logs      - Просмотреть логи всех контейнеров"
	@echo "  make seed      - Наполнить базу данных справочниками и демо-данными"
	@echo "  make test      - Запустить unit- и интеграционные тесты бэкенда"
	@echo "  make validate  - Запустить научные симуляции валидации CAT и подбора (25% баллов)"
	@echo "  make doc-pdf   - Сгенерировать официальный PDF-отчет по стеку и ролям команды"

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

logs:
	docker compose logs -f

build:
	docker compose build

seed:
	python -m seed.seed_data

test:
	pytest backend/tests/ -v

validate:
	python -m validation.run_all

doc-pdf:
	python scripts/generate_project_pdf.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

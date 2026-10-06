# ==============================================================================
# ФСП ХАКАТОН 2026: DOCKERFILE ДЛЯ FASTAPI БЭКЕНДА
# ==============================================================================
FROM python:3.11-slim

# Отключаем буферизацию вывода и запись .pyc файлов
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Устанавливаем системные зависимости (curl для healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Установка Python-зависимостей
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Копирование исходного кода приложения
COPY . .

# Открываем порт 8000
EXPOSE 8000

# Запуск FastAPI с поддержкой автоперезагрузки в dev-режиме
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

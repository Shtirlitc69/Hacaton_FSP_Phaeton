"""
================================================================================
ФСП ХАКАТОН 2026: ГЛАВНАЯ ТОЧКА ВХОДА ПРИЛОЖЕНИЯ (FastAPI Application)
================================================================================
Зона ответственности: Backend Lead / Архитектор

Назначение:
- Инициализация веб-приложения FastAPI с полной поддержкой OpenAPI 3.1.
- Настройка CORS для работы с фронтендом React SPA на Vite.
- Автоматическая инициализация таблиц БД при старте (lifespan hook).
- Эндпоинт проверки здоровья сервиса /health.
================================================================================
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Жизненный цикл приложения (Startup & Shutdown).
    Автоматически инициализирует схемы БД при первом старте сервиса.
    """
    # Создаем таблицы БД асинхронно
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Очистка ресурсов при завершении
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
## Цифровая платформа-агрегатор ИТ-вакансий с верифицированным профилем достижений ФСП

### Ключевые возможности:
* **Обратная механика найма (Reverse Recruiting)** — инициатива у работодателя, обязательная зарплатная вилка в рублях («от-до»).
* **Защита персональных данных (152-ФЗ)** — контакты соискателя физически скрыты до принятия приглашения (ACCEPTED).
* **Адаптивное тестирование (CAT 2PL IRT)** — калиброванный параметризованный банк заданий с защитой от утечек (Anti-Leak).
* **Спортивное программирование (ФСП)** — объективное обогащение профиля результатами соревнований и пересчет бонусного рейтинга.
* **Explainable AI** — полная объяснимость ранжирования и декомпозиция вкладов для каждого кандидата.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В рамках хакатона разрешаем все источники для удобства жюри
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение API роутов с префиксом /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Служебные"])
async def health_check():
    """Проверка доступности и работоспособности сервиса (Health Check)"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "api_version": "v1"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

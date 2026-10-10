"""
================================================================================
ФСП ХАКАТОН 2026: СЛОЙ ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ (SQLAlchemy 2.0 Async)
================================================================================
Зона ответственности: Data Engineer / Backend Developer

Назначение:
- Создание асинхронного движка базы данных (PostgreSQL с поддержкой pgvector).
- Фабрика асинхронных сессий для внедрения зависимостей (Dependency Injection) в роуты FastAPI.
- Поддержка fallback на SQLite (aiosqlite) в случае запуска локальных легковесных тестов без Docker.
================================================================================
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Определение базового декларативного класса для всех ORM-моделей
Base = declarative_base()

# Создаем асинхронный движок SQLAlchemy
if "sqlite" in settings.DATABASE_URL:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        pool_pre_ping=True,
    )

# Фабрика сессий БД
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession,
)


def get_canonical_sqlite_url() -> str:
    import os
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    db_path = os.path.join(base_dir, "fsp_platform.db").replace("\\", "/")
    return f"sqlite+aiosqlite:///{db_path}"


async def switch_to_sqlite_fallback():
    global engine, AsyncSessionLocal
    fallback_url = get_canonical_sqlite_url()
    engine = create_async_engine(
        fallback_url,
        echo=False,
        future=True,
        connect_args={"check_same_thread": False},
    )
    AsyncSessionLocal.configure(bind=engine)
    return engine


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency: предоставляет асинхронную сессию БД на время выполнения запроса.
    Автоматически закрывает сессию после завершения HTTP-обработчика.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

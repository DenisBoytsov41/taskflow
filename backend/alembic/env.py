import os
from logging.config import fileConfig
from sqlalchemy import create_engine, pool, text
from alembic import context
from app.database import Base
from app.models import User, Task, RefreshToken

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://myuser:password@localhost:5432/ToDoApp")
print("DATABASE_URL:", DATABASE_URL)

engine = create_engine(DATABASE_URL, poolclass=pool.NullPool)

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def ensure_alembic_version_table():
    with engine.connect() as conn:
        trans = conn.begin()
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema='public'
                  AND table_name='alembic_version'
            );
        """))
        table_exists = result.scalar()

        if not table_exists:
            print("Таблица alembic_version отсутствует. Создаю вручную...")
            conn.execute(text("""
                CREATE TABLE public.alembic_version (
                    version_num VARCHAR(32) NOT NULL PRIMARY KEY
                );
            """))
        else:
            print("Таблица alembic_version уже существует.")

        trans.commit()

def run_migrations_offline():
    """Оффлайн-режим миграций."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Онлайн-режим миграций."""
    #ensure_alembic_version_table()  

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import our Base and all models
from backend.app.db.base import Base
# Ensure all models are imported here so Alembic can discover them
import backend.app.models.ingestion
import backend.app.models.payment
import backend.app.models.refund
import backend.app.models.settlement
import backend.app.models.bank_credit
import backend.app.models.reconciliation
import backend.app.models.review
import backend.app.models.user

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = os.environ.get("DATABASE_URL", "postgresql://postgres:password@localhost:5432/finance_controller")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    raw_url = os.environ.get(
        "DATABASE_URL", "postgresql://postgres:password@localhost:5432/finance_controller"
    )
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)
    configuration["sqlalchemy.url"] = raw_url
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

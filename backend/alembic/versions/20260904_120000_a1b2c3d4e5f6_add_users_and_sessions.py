"""add users and user_sessions tables

Revision ID: a1b2c3d4e5f6
Revises: 58fbc994ed73
Create Date: 2026-09-04T12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '58fbc994ed73'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'reviewer',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS ix_public_users_email ON public.users (email);

    CREATE TABLE IF NOT EXISTS public.user_sessions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        session_token_hash TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS ix_public_user_sessions_user_id ON public.user_sessions (user_id);
    CREATE INDEX IF NOT EXISTS ix_public_user_sessions_session_token_hash ON public.user_sessions (session_token_hash);
    """)


def downgrade() -> None:
    op.execute("""
    DROP TABLE IF EXISTS public.user_sessions CASCADE;
    DROP TABLE IF EXISTS public.users CASCADE;
    """)

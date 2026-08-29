"""add optimistic locking version

Revision ID: 58fbc994ed73
Revises: fab641425491
Create Date: 2026-08-29T15:45:00.597082

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '58fbc994ed73'
down_revision: Union[str, None] = 'fab641425491'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('reconciliation_cases', sa.Column('version', sa.Integer(), nullable=False, server_default='1'))


def downgrade() -> None:
    op.drop_column('reconciliation_cases', 'version')

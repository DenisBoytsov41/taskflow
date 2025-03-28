"""Add notified field to Task

Revision ID: 9036c37c03b5
Revises: 77770bb7f05e
Create Date: 2025-03-26 19:58:43.518121

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9036c37c03b5'
down_revision: Union[str, None] = '77770bb7f05e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('tasks', sa.Column('notified', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('tasks', 'notified')
    # ### end Alembic commands ###

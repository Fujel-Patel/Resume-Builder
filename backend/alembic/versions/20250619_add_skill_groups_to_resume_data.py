"""Add skill_groups to resume_data.

Revision ID: 20250619_add_skill_groups_to_resume_data
Revises: 20250619_add_template_style_to_resume_data
Create Date: 2026-06-19 13:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision = "20250619_add_skill_groups_to_resume_data"
down_revision = "20250619_add_template_style_to_resume_data"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("resume_data")]

    if "skill_groups" not in columns:
        op.add_column(
            "resume_data",
            sa.Column("skill_groups", JSONB(), nullable=True),
        )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("resume_data")]

    if "skill_groups" in columns:
        op.drop_column("resume_data", "skill_groups")

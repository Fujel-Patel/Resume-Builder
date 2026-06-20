"""Add injected_file_path to resumes.

Revision ID: 20250620_add_injected_file_path_to_resumes
Revises: 20250619_add_skill_groups_to_resume_data
Create Date: 2026-06-20 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20250620_add_injected_file_path_to_resumes"
down_revision = "20250619_add_skill_groups_to_resume_data"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("resumes")]

    if "injected_file_path" not in columns:
        op.add_column(
            "resumes",
            sa.Column("injected_file_path", sa.String(500), nullable=True),
        )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("resumes")]

    if "injected_file_path" in columns:
        op.drop_column("resumes", "injected_file_path")

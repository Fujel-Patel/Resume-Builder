"""Add template_style to resume_data.

Revision ID: 20250619_add_template_style_to_resume_data
Revises: 20240617_add_original_file_fields_to_resumes
Create Date: 2026-06-19 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision = "20250619_add_template_style_to_resume_data"
down_revision = "20240617_add_original_file_fields_to_resumes"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("resume_data")]

    if "template_style" not in columns:
        op.add_column(
            "resume_data",
            sa.Column("template_style", JSONB(), nullable=True),
        )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("resume_data")]

    if "template_style" in columns:
        op.drop_column("resume_data", "template_style")

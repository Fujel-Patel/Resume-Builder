"""Add original_file_path and original_file_type to resumes.

Revision ID: 20240617_add_original_file_fields_to_resumes
Revises: 20240616_add_model_to_ai_providers_and_ats_scans
Create Date: 2026-06-17 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20240617_add_original_file_fields_to_resumes"
down_revision = "20240616_add_model_to_ai_providers_and_ats_scans"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("resumes")]

    if "original_file_path" not in columns:
        op.add_column(
            "resumes",
            sa.Column("original_file_path", sa.String(500), nullable=True),
        )
    if "original_file_type" not in columns:
        op.add_column(
            "resumes",
            sa.Column("original_file_type", sa.String(10), nullable=True),
        )

    # Add parsed_data to resume_data (idempotent)
    rdata_columns = [c["name"] for c in inspector.get_columns("resume_data")]
    if "parsed_data" not in rdata_columns:
        op.add_column(
            "resume_data",
            sa.Column("parsed_data", sa.JSON(), nullable=True),
        )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    rdata_columns = [c["name"] for c in inspector.get_columns("resume_data")]
    if "parsed_data" in rdata_columns:
        op.drop_column("resume_data", "parsed_data")

    resumes_columns = [c["name"] for c in inspector.get_columns("resumes")]
    if "original_file_type" in resumes_columns:
        op.drop_column("resumes", "original_file_type")
    if "original_file_path" in resumes_columns:
        op.drop_column("resumes", "original_file_path")

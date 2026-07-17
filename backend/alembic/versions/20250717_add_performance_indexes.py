"""Add composite indexes for performance-critical queries.

Revision ID: 20250717_add_performance_indexes
Revises: 20250620_add_injected_file_path_to_resumes
Create Date: 2025-07-17 12:00:00.000000
"""

from alembic import op

revision = "20250717_add_performance_indexes"
down_revision = "20250620_add_injected_file_path_to_resumes"
branch_labels = None
depends_on = None


def upgrade():
    # list_resumes: filters by user_id + is_deleted, sorts by created_at DESC
    op.create_index(
        "ix_resumes_user_deleted_created",
        "resumes",
        ["user_id", "is_deleted", "created_at"],
    )

    # get_default_provider: filters by user_id + is_default
    op.create_index(
        "ix_ai_providers_user_default",
        "ai_providers",
        ["user_id", "is_default"],
    )

    # get_scans_by_user: filters by user_id, sorts by created_at DESC
    op.create_index(
        "ix_ats_scans_user_created",
        "ats_scans",
        ["user_id", "created_at"],
    )


def downgrade():
    op.drop_index("ix_resumes_user_deleted_created", table_name="resumes")
    op.drop_index("ix_ai_providers_user_default", table_name="ai_providers")
    op.drop_index("ix_ats_scans_user_created", table_name="ats_scans")

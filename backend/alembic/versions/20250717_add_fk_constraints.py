"""Add FK constraints and JSONB for data integrity.

Revision ID: 20250717_add_fk_constraints
Revises: 20250717_add_performance_indexes
Create Date: 2025-07-17 18:00:00.000000
"""

from alembic import op

revision = "20250717_add_fk_constraints"
down_revision = "20250717_add_performance_indexes"
branch_labels = None
depends_on = None


def upgrade():
    # Delete orphaned rows that reference non-existent users
    op.execute("DELETE FROM ai_providers WHERE user_id NOT IN (SELECT id FROM users)")
    op.execute("DELETE FROM ats_scans WHERE user_id NOT IN (SELECT id FROM users)")
    op.execute("DELETE FROM resumes WHERE user_id NOT IN (SELECT id FROM users)")

    # FK: ai_providers.user_id → users.id
    op.create_foreign_key(
        "fk_ai_providers_user",
        "ai_providers",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # FK: ats_scans.user_id → users.id
    op.create_foreign_key(
        "fk_ats_scans_user",
        "ats_scans",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # FK: ats_scans.resume_id → resumes.id (nullable)
    op.create_foreign_key(
        "fk_ats_scans_resume",
        "ats_scans",
        "resumes",
        ["resume_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # Convert ats_scans.score_report from JSON to JSONB for better querying
    op.execute("ALTER TABLE ats_scans ALTER COLUMN score_report TYPE JSONB USING score_report::JSONB")


def downgrade():
    op.execute("ALTER TABLE ats_scans ALTER COLUMN score_report TYPE JSON USING score_report::JSON")
    op.drop_constraint("fk_ats_scans_resume", "ats_scans")
    op.drop_constraint("fk_ats_scans_user", "ats_scans")
    op.drop_constraint("fk_ai_providers_user", "ai_providers")

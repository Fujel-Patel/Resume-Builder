"""Add model column to ai_providers and create ats_scans table.

Revision ID: 20240616_add_model_to_ai_providers_and_ats_scans
Revises: 20240614_add_auth_constraints
Create Date: 2026-06-16 17:30:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20240616_add_model_to_ai_providers_and_ats_scans"
down_revision = "20240614_add_auth_constraints"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # Add model column to ai_providers (idempotent)
    columns = [c["name"] for c in inspector.get_columns("ai_providers")]
    if "model" not in columns:
        op.add_column(
            "ai_providers",
            sa.Column("model", sa.String(200), nullable=True),
        )

    # Create ats_scans table (idempotent)
    if not inspector.has_table("ats_scans"):
        op.create_table(
            "ats_scans",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("user_id", sa.UUID(), nullable=False, index=True),
            sa.Column("resume_id", sa.UUID(), nullable=True, index=True),
            sa.Column("job_description", sa.Text(), nullable=True),
            sa.Column("score_report", sa.JSON(), nullable=False),
            sa.Column("overall_score", sa.Integer(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
            ),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if inspector.has_table("ats_scans"):
        op.drop_table("ats_scans")
    columns = [c["name"] for c in inspector.get_columns("ai_providers")]
    if "model" in columns:
        op.drop_column("ai_providers", "model")

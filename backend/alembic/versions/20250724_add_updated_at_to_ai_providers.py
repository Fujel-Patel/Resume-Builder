"""Add updated_at column to ai_providers table.

Revision ID: 20250724_add_updated_at_to_ai_providers
Revises: 20250721_profile_on_verify
Create Date: 2025-07-24 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "20250724_add_updated_at_to_ai_providers"
down_revision = "20250721_profile_on_verify"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("ai_providers")]
    if "updated_at" not in columns:
        op.add_column(
            "ai_providers",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
            ),
        )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns("ai_providers")]
    if "updated_at" in columns:
        op.drop_column("ai_providers", "updated_at")

"""Add pending user flow, email verification fields, and security improvements.

Revision ID: 20250718_add_pending_user_flow
Revises: 20250717_add_fk_constraints
Create Date: 2025-07-18 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "20250718_add_pending_user_flow"
down_revision = "20250717_add_fk_constraints"
branch_labels = None
depends_on = None


def upgrade():
    # --- New columns on users table ---
    op.add_column("users", sa.Column("status", sa.String(20), server_default="active", nullable=False))
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("users", sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("verification_token_hash", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("verification_sent_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("verification_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("verification_attempts", sa.Integer(), server_default="0", nullable=False))
    op.add_column("users", sa.Column("last_verification_sent_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("pending_expires_at", sa.DateTime(timezone=True), nullable=True))

    # --- Indexes ---
    op.create_index("ix_users_status", "users", ["status"])
    op.create_index("ix_users_verification_token_hash", "users", ["verification_token_hash"])
    op.create_index("ix_users_pending_expires_at", "users", ["pending_expires_at"])

    # --- Sync existing data: mark all previously active users as verified ---
    # Users who were already active before verification flow existed should not be blocked
    op.execute(
        "UPDATE users SET email_verified = true, verified_at = created_at, is_verified = true "
        "WHERE is_active = true OR is_verified = true"
    )

    # --- Add family_id to refresh_tokens for replay detection ---
    op.add_column("refresh_tokens", sa.Column("family_id", sa.String(255), nullable=True))
    op.add_column("refresh_tokens", sa.Column("replaced_by_hash", sa.String(255), nullable=True))

    # --- Add email_tokens.used_at for single-use enforcement ---
    op.add_column("email_tokens", sa.Column("used_at", sa.DateTime(timezone=True), nullable=True))


def downgrade():
    op.drop_column("email_tokens", "used_at")
    op.drop_column("refresh_tokens", "replaced_by_hash")
    op.drop_column("refresh_tokens", "family_id")
    op.drop_index("ix_users_pending_expires_at", "users")
    op.drop_index("ix_users_verification_token_hash", "users")
    op.drop_index("ix_users_status", "users")
    op.drop_column("users", "pending_expires_at")
    op.drop_column("users", "last_verification_sent_at")
    op.drop_column("users", "verification_attempts")
    op.drop_column("users", "verification_expires_at")
    op.drop_column("users", "verification_sent_at")
    op.drop_column("users", "verification_token_hash")
    op.drop_column("users", "verified_at")
    op.drop_column("users", "email_verified")
    op.drop_column("users", "status")

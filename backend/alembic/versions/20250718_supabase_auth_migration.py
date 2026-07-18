"""Migrate from custom auth to Supabase Auth.

Creates profiles table (linked to auth.users), migrates data from users,
drops refresh_tokens and email_tokens tables, and updates all FK constraints.

Revision ID: 20250718_supabase_auth_migration
Revises: 20250718_add_pending_user_flow
Create Date: 2025-07-18 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "20250718_supabase_auth_migration"
down_revision = "20250718_add_pending_user_flow"
branch_labels = None
depends_on = None


def upgrade():
    # ── 1. Drop FK constraints that reference users.id ──────────────
    op.execute("ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_user_id_fkey")
    op.execute("ALTER TABLE ai_providers DROP CONSTRAINT IF EXISTS ai_providers_user_id_fkey")
    op.execute("ALTER TABLE ats_scans DROP CONSTRAINT IF EXISTS ats_scans_user_id_fkey")
    op.execute("ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey")
    op.execute("ALTER TABLE email_tokens DROP CONSTRAINT IF EXISTS email_tokens_user_id_fkey")

    # ── 2. Create profiles table ────────────────────────────────────
    op.create_table(
        "profiles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, index=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── 3. Migrate existing data from users → profiles ──────────────
    op.execute("""
        INSERT INTO profiles (id, name, email, avatar_url, created_at, updated_at)
        SELECT id, name, email, avatar_url, created_at, updated_at
        FROM users
    """)

    # ── 4. Drop old tables ──────────────────────────────────────────
    op.execute("DROP TABLE IF EXISTS email_tokens CASCADE")
    op.execute("DROP TABLE IF EXISTS refresh_tokens CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")

    # ── 5. Recreate FK constraints pointing to profiles.id ──────────
    op.execute("ALTER TABLE resumes ADD CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE")
    op.execute("ALTER TABLE ai_providers ADD CONSTRAINT ai_providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE")
    op.execute("ALTER TABLE ats_scans ADD CONSTRAINT ats_scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE")

    # ── 6. Create Supabase Auth trigger for auto-profile creation ───
    op.execute("""
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.profiles (id, name, email)
            VALUES (
                NEW.id,
                COALESCE(
                    NEW.raw_user_meta_data->>'name',
                    NEW.raw_user_meta_data->>'full_name',
                    split_part(NEW.email, '@', 1)
                ),
                NEW.email
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER
    """)

    op.execute("""
        CREATE OR REPLACE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
    """)

    # ── 7. Grant permissions ────────────────────────────────────────
    op.execute("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY")
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated")
    op.execute("GRANT SELECT ON profiles TO anon")
    op.execute("GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated")


def downgrade():
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user()")

    op.execute("ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_user_id_fkey")
    op.execute("ALTER TABLE ai_providers DROP CONSTRAINT IF EXISTS ai_providers_user_id_fkey")
    op.execute("ALTER TABLE ats_scans DROP CONSTRAINT IF EXISTS ats_scans_user_id_fkey")

    # Recreate users table (simplified — full restore would need backup)
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), server_default="active", nullable=False),
        sa.Column("is_verified", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("email_verified", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verification_token_hash", sa.String(255), nullable=True),
        sa.Column("verification_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verification_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verification_attempts", sa.Integer(), server_default="0", nullable=False),
        sa.Column("last_verification_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pending_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_login_attempts", sa.Integer(), server_default="0", nullable=False),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.execute("""
        INSERT INTO users (id, name, email, avatar_url, created_at, updated_at)
        SELECT id, name, email, avatar_url, created_at, updated_at
        FROM profiles
    """)

    op.drop_table("profiles")

    op.execute("ALTER TABLE resumes ADD CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE")
    op.execute("ALTER TABLE ai_providers ADD CONSTRAINT ai_providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE")
    op.execute("ALTER TABLE ats_scans ADD CONSTRAINT ats_scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE")

    # Recreate auth tables (empty — data lost)
    op.create_table(
        "refresh_tokens",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("token_hash", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("family_id", sa.String(255), nullable=True, index=True),
        sa.Column("replaced_by_hash", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "email_tokens",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("token_hash", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

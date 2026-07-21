"""Move profile creation from signup to email confirmation.

Drops the AFTER INSERT trigger that creates profiles on signup.
Adds an AFTER UPDATE trigger that creates profiles when email_confirmed_at
transitions from NULL to a value (i.e. when the user verifies their email).

Revision ID: 20250721_profile_on_verify
Revises: 20250718_supabase_auth_migration
Create Date: 2025-07-21 00:00:00.000000
"""

from alembic import op

revision = "20250721_profile_on_verify"
down_revision = "20250718_supabase_auth_migration"
branch_labels = None
depends_on = None


def upgrade():
    # ── 1. Drop the old INSERT trigger and function ─────────────────
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user()")

    # ── 2. Create new function — fires on email confirmation ────────
    op.execute("""
        CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
        RETURNS TRIGGER AS $$
        DECLARE
            existing_profile RECORD;
        BEGIN
            -- Only fire when email_confirmed_at transitions from NULL to a value
            IF NEW.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS NOT NULL THEN
                RETURN NEW;
            END IF;

            -- Check if a profile with this email already exists
            SELECT id, email INTO existing_profile
            FROM public.profiles
            WHERE email = NEW.email
            LIMIT 1;

            IF FOUND THEN
                -- Update existing profile's id to match the auth user
                UPDATE public.profiles
                SET id = NEW.id,
                    name = COALESCE(
                        NEW.raw_user_meta_data->>'name',
                        NEW.raw_user_meta_data->>'full_name',
                        name
                    ),
                    updated_at = now()
                WHERE email = NEW.email;
            ELSE
                -- Create new profile
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
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER
    """)

    # ── 3. Create the new UPDATE trigger ────────────────────────────
    op.execute("""
        CREATE TRIGGER on_auth_email_confirmed
            AFTER UPDATE ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmed()
    """)

    # ── 4. Clean up any existing unverified profiles ────────────────
    # Profiles that were created by the old INSERT trigger but whose
    # auth user was never verified.  We keep them if the auth user
    # has email_confirmed_at set; otherwise they're orphaned.
    op.execute("""
        DELETE FROM public.profiles
        WHERE id IN (
            SELECT p.id FROM public.profiles p
            LEFT JOIN auth.users u ON u.id = p.id
            WHERE u.id IS NULL OR u.email_confirmed_at IS NULL
        )
    """)


def downgrade():
    op.execute("DROP TRIGGER IF EXISTS on_auth_email_confirmed ON auth.users")
    op.execute("DROP FUNCTION IF EXISTS public.handle_email_confirmed()")

    # Restore the original INSERT trigger
    op.execute("""
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        DECLARE
            existing_profile RECORD;
        BEGIN
            SELECT id INTO existing_profile
            FROM public.profiles
            WHERE email = NEW.email
            LIMIT 1;

            IF FOUND THEN
                UPDATE public.profiles
                SET id = NEW.id,
                    name = COALESCE(
                        NEW.raw_user_meta_data->>'name',
                        NEW.raw_user_meta_data->>'full_name',
                        name
                    ),
                    updated_at = now()
                WHERE email = NEW.email;
            ELSE
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
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER
    """)

    op.execute("""
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
    """)

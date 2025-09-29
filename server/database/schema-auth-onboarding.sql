-- ServiceTime Auth + Onboarding Schema
-- This file contains only the objects required for passwordless auth (OTP)
-- and onboarding data. It can be run alongside existing schema files.

-- Safety: enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Case-insensitive text for emails
CREATE EXTENSION IF NOT EXISTS "citext";

-- =============================
-- Tenancy Core (Accounts/Users)
-- =============================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    email CITEXT UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'owner', -- owner, admin, dispatcher, technician, accountant
    status VARCHAR(20) DEFAULT 'active',   -- active, inactive, pending
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('owner','admin','dispatcher','technician','accountant')),
    CONSTRAINT chk_users_status CHECK (status IN ('active','inactive','pending'))
);

CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ======================
-- Auth: OTP + Sessions
-- ======================
CREATE TABLE IF NOT EXISTS user_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email CITEXT NOT NULL,
    otp_code CHAR(6) NOT NULL,
    purpose VARCHAR(20) DEFAULT 'login', -- login, signup, password_reset
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_otps_code_digits CHECK (otp_code ~ '^[0-9]{6}$'),
    CONSTRAINT chk_user_otps_purpose CHECK (purpose IN ('login','signup','password_reset'))
);

CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email);
CREATE INDEX IF NOT EXISTS idx_user_otps_expires_at ON user_otps(expires_at);
-- For fast retrieval of the latest OTP per purpose
CREATE INDEX IF NOT EXISTS idx_user_otps_email_purpose_created ON user_otps(email, purpose, created_at DESC);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);

-- ======================
-- Onboarding Data
-- ======================
-- Stores onboarding profile data captured during the wizard
CREATE TABLE IF NOT EXISTS onboarding_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Example fields reflecting onboarding UI at src/components/onboarding/
    business_name VARCHAR(255),
    business_category VARCHAR(100),      -- hvac, plumbing, electrical, etc.
    team_size INTEGER,                   -- number of technicians/users
    phone VARCHAR(50),
    website VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    -- Plan selection
    selected_plan VARCHAR(50),           -- starter, pro, business, enterprise
    custom_pricing BOOLEAN DEFAULT FALSE,
    -- Status flags
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_onboarding_selected_plan CHECK (selected_plan IS NULL OR selected_plan IN ('starter','pro','business','enterprise'))
);

CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_account_id ON onboarding_profiles(account_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_user_id ON onboarding_profiles(user_id);

-- Tracks step-by-step progress/events for analytics and resume capability
CREATE TABLE IF NOT EXISTS onboarding_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_key VARCHAR(100) NOT NULL,      -- e.g., personal_info, business_info, category, plan, confirm
    status VARCHAR(30) NOT NULL,         -- started, completed, skipped, error
    payload JSONB,                       -- arbitrary data snapshot for the step
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_account_id ON onboarding_events(account_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_step_key ON onboarding_events(step_key);

-- Validate onboarding_events.status values
DO $$ BEGIN
    -- Add a constraint only if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_onboarding_events_status'
    ) THEN
        ALTER TABLE onboarding_events
        ADD CONSTRAINT chk_onboarding_events_status CHECK (status IN ('started','completed','skipped','error'));
    END IF;
END $$;

-- ======================
-- RLS + Policies
-- ======================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

-- Expect the app to set these at session level to scope queries
--   SET LOCAL app.current_account_id = '<uuid>';
--   SET LOCAL app.current_user_id = '<uuid>';

-- Accounts: restrict by current account
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'accounts' AND policyname = 'account_isolation'
    ) THEN
        CREATE POLICY account_isolation ON accounts
            FOR ALL USING (id = current_setting('app.current_account_id', true)::UUID);
    END IF;
END $$;

-- Users: same-account access
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'user_account_isolation'
    ) THEN
        CREATE POLICY user_account_isolation ON users
            FOR ALL USING (account_id = current_setting('app.current_account_id', true)::UUID);
    END IF;
END $$;

-- Ensure inserts are scoped to the current account
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'user_account_insert_check'
    ) THEN
        CREATE POLICY user_account_insert_check ON users
            FOR INSERT WITH CHECK (account_id = current_setting('app.current_account_id', true)::UUID);
    END IF;
END $$;

-- OTPs: only for current user
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_otps' AND policyname = 'otp_user_isolation'
    ) THEN
        CREATE POLICY otp_user_isolation ON user_otps
            FOR ALL USING (
                (user_id IS NOT NULL AND user_id = current_setting('app.current_user_id', true)::UUID)
                OR (user_id IS NULL AND email = current_setting('app.current_user_email', true))
            );
    END IF;
END $$;

-- Inserts must match current user or email context
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_otps' AND policyname = 'otp_insert_check'
    ) THEN
        CREATE POLICY otp_insert_check ON user_otps
            FOR INSERT WITH CHECK (
                (user_id IS NOT NULL AND user_id = current_setting('app.current_user_id', true)::UUID)
                OR (user_id IS NULL AND email = current_setting('app.current_user_email', true))
            );
    END IF;
END $$;

-- Sessions: only for current user
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'session_user_isolation'
    ) THEN
        CREATE POLICY session_user_isolation ON user_sessions
            FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
    END IF;
END $$;

-- Enforce insert scoping for sessions
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'session_insert_check'
    ) THEN
        CREATE POLICY session_insert_check ON user_sessions
            FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true)::UUID);
    END IF;
END $$;

-- Onboarding: only within same account
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_profiles' AND policyname = 'onboarding_profile_isolation'
    ) THEN
        CREATE POLICY onboarding_profile_isolation ON onboarding_profiles
            FOR ALL USING (account_id = current_setting('app.current_account_id', true)::UUID);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_profiles' AND policyname = 'onboarding_profile_insert_check'
    ) THEN
        CREATE POLICY onboarding_profile_insert_check ON onboarding_profiles
            FOR INSERT WITH CHECK (account_id = current_setting('app.current_account_id', true)::UUID);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_events' AND policyname = 'onboarding_event_isolation'
    ) THEN
        CREATE POLICY onboarding_event_isolation ON onboarding_events
            FOR ALL USING (account_id = current_setting('app.current_account_id', true)::UUID);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_events' AND policyname = 'onboarding_event_insert_check'
    ) THEN
        CREATE POLICY onboarding_event_insert_check ON onboarding_events
            FOR INSERT WITH CHECK (account_id = current_setting('app.current_account_id', true)::UUID);
    END IF;
END $$;

-- ======================
-- Updated-at trigger helper
-- ======================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers where applicable
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_accounts_updated_at'
    ) THEN
        CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
    ) THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_onboarding_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_onboarding_profiles_updated_at BEFORE UPDATE ON onboarding_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ======================
-- Helper functions to set/reset RLS session context
-- ======================
CREATE OR REPLACE FUNCTION set_app_context(p_account_id uuid, p_user_id uuid, p_user_email text DEFAULT NULL)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_account_id', COALESCE(p_account_id::text, ''), true);
    PERFORM set_config('app.current_user_id', COALESCE(p_user_id::text, ''), true);
    IF p_user_email IS NOT NULL THEN
        PERFORM set_config('app.current_user_email', p_user_email, true);
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reset_app_context()
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_account_id', NULL, true);
    PERFORM set_config('app.current_user_id', NULL, true);
    PERFORM set_config('app.current_user_email', NULL, true);
END;
$$ LANGUAGE plpgsql;

-- ======================
-- Optional: minimal seed for dev
-- ======================
-- INSERT INTO accounts (name, business_type) VALUES ('Demo Account', 'hvac') ON CONFLICT DO NOTHING;

-- RealtyDesk Canada — PostgreSQL Schema
-- Run: psql $DATABASE_URL -f src/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  full_name     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── User Settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id               UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  province              CHAR(2) NOT NULL DEFAULT 'AB',
  google_calendar_token TEXT,
  google_drive_token    TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Clients ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  email               TEXT,
  phone               TEXT,
  type                TEXT        NOT NULL CHECK (type IN ('buyer', 'seller')),
  stage               TEXT        NOT NULL DEFAULT 'lead'
                        CHECK (stage IN ('lead','consultation','preapproval',
                                         'active','offer','conditional','firm','closed')),
  budget              NUMERIC(12,2) DEFAULT 0,
  address             TEXT,
  google_drive_folder TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_stage   ON clients(user_id, stage);

-- ─── Client Notes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_notes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);

-- ─── Transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id        UUID          REFERENCES clients(id) ON DELETE SET NULL,
  address          TEXT          NOT NULL,
  sale_price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_rate  NUMERIC(5,3)  NOT NULL DEFAULT 2.5,
  brokerage_split  NUMERIC(5,2)  NOT NULL DEFAULT 0,
  gst_collected    NUMERIC(10,2) NOT NULL DEFAULT 0,
  closing_date     DATE,
  status           TEXT          NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'closed')),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- ─── Expenses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE          NOT NULL,
  category    TEXT          NOT NULL,
  description TEXT,
  amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst_paid    NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date    ON expenses(user_id, date);

-- ─── Meetings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id                UUID        REFERENCES clients(id) ON DELETE SET NULL,
  title                    TEXT        NOT NULL,
  datetime                 TIMESTAMPTZ NOT NULL,
  duration_minutes         INT         NOT NULL DEFAULT 60,
  type                     TEXT        NOT NULL DEFAULT 'showing'
                             CHECK (type IN ('showing','consultation','closing',
                                             'inspection','other')),
  google_calendar_event_id TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id   ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_meetings_datetime  ON meetings(user_id, datetime);

-- ─── Documents ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id  UUID        REFERENCES clients(id) ON DELETE SET NULL,
  name       TEXT        NOT NULL,
  category   TEXT        NOT NULL DEFAULT 'Other',
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  url        TEXT,
  drive_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_user_id   ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);

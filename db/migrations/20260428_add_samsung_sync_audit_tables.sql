-- Tabelas de auditoria da sincronização Samsung BART

CREATE TABLE IF NOT EXISTS samsung_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL DEFAULT 'running',
  triggered_by_user_id UUID NULL,
  trigger_type VARCHAR(30) NOT NULL DEFAULT 'manual',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ NULL,
  total_patients INTEGER NOT NULL DEFAULT 0,
  synced_patients INTEGER NOT NULL DEFAULT 0,
  errored_patients INTEGER NOT NULL DEFAULT 0,
  uploaded_files INTEGER NOT NULL DEFAULT 0,
  skipped_files INTEGER NOT NULL DEFAULT 0,
  deleted_files INTEGER NOT NULL DEFAULT 0,
  error_files INTEGER NOT NULL DEFAULT 0,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS samsung_sync_run_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES samsung_sync_runs(id) ON DELETE CASCADE,
  patient_id UUID NULL,
  binary_collection_id UUID NULL,
  action VARCHAR(20) NOT NULL,
  artifact_repo VARCHAR(120) NOT NULL,
  artifact_path TEXT NOT NULL,
  sha256 TEXT NULL,
  uploaded BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_samsung_sync_runs_started_at
  ON samsung_sync_runs (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_samsung_sync_runs_status
  ON samsung_sync_runs (status);

CREATE INDEX IF NOT EXISTS idx_samsung_sync_items_run_id
  ON samsung_sync_run_items (run_id);

CREATE INDEX IF NOT EXISTS idx_samsung_sync_items_patient_id
  ON samsung_sync_run_items (patient_id);

CREATE INDEX IF NOT EXISTS idx_samsung_sync_items_created_at
  ON samsung_sync_run_items (created_at DESC);

-- Diário diário FreeLiving (1 linha por paciente/dia) + marcos no catálogo de ações

INSERT INTO freeliving_action_types (code, label_pt, sort_order, active)
VALUES
  ('diary_started', 'Iniciou diário', 10, TRUE),
  ('diary_submitted', 'Enviou diário', 11, TRUE)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS freeliving_diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_cpf_hash VARCHAR(128) NOT NULL,
  diary_date DATE NOT NULL,
  protocol_day SMALLINT NOT NULL CHECK (protocol_day BETWEEN 1 AND 7),
  status VARCHAR(20) NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'completo')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  save_count INTEGER NOT NULL DEFAULT 0,
  first_saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_diary_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_freeliving_diaries_patient_date UNIQUE (patient_id, diary_date)
);

CREATE INDEX IF NOT EXISTS idx_freeliving_diaries_date
  ON freeliving_diaries (diary_date DESC, last_saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_freeliving_diaries_patient_date
  ON freeliving_diaries (patient_id, diary_date DESC);

CREATE INDEX IF NOT EXISTS idx_freeliving_diaries_status_date
  ON freeliving_diaries (status, diary_date);

CREATE INDEX IF NOT EXISTS idx_freeliving_diaries_cpf_hash
  ON freeliving_diaries (patient_cpf_hash);

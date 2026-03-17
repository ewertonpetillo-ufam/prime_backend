-- Adiciona campos de tempo de coleta acumulado ao questionário

ALTER TABLE questionnaires
  ADD COLUMN IF NOT EXISTS collection_time_seconds INTEGER NOT NULL DEFAULT 0;

ALTER TABLE questionnaires
  ADD COLUMN IF NOT EXISTS current_session_started_at TIMESTAMP NULL;


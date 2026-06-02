-- Indica se o paciente foi marcado para recomendação de teste de sono (Step 4 neurológico)

ALTER TABLE questionnaires
  ADD COLUMN IF NOT EXISTS sleep_test_recommended BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN questionnaires.sleep_test_recommended IS
  'Indica se o paciente foi marcado para recomendação de teste de sono na avaliação neurológica (Step 4).';

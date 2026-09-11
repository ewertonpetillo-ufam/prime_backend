-- Indica se o paciente foi marcado para recomendação de teste Free Living (Step 4 neurológico)

ALTER TABLE questionnaires
  ADD COLUMN IF NOT EXISTS free_living_test_recommended BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN questionnaires.free_living_test_recommended IS
  'Indica se o paciente foi marcado para recomendação de teste Free Living na avaliação neurológica (Step 4).';

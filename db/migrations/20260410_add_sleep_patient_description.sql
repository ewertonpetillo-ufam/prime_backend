-- Descrição global do paciente na avaliação do sono (mesmo padrão de physio_patient_description)
ALTER TABLE clinical_assessments
  ADD COLUMN IF NOT EXISTS sleep_patient_description TEXT NULL;

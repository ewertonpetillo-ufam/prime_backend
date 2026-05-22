-- Descrição global do paciente na avaliação da fala (mesmo padrão de physio_patient_description)
ALTER TABLE clinical_assessments
  ADD COLUMN IF NOT EXISTS speech_patient_description TEXT NULL;

-- 1) Lista de tipos de discinesia em clinical_assessments
ALTER TABLE clinical_assessments
  ADD COLUMN IF NOT EXISTS dyskinesia_type_codes TEXT NULL;

-- 2) Descrição do Paciente (Avaliação Fisioterápica) em clinical_assessments
ALTER TABLE clinical_assessments
  ADD COLUMN IF NOT EXISTS physio_patient_description TEXT NULL;

-- 3) Inicializar a nova lista com o tipo existente, quando houver (PostgreSQL)
UPDATE clinical_assessments ca
SET dyskinesia_type_codes = to_jsonb(ARRAY[dt.description])::text
FROM dyskinesia_types dt
WHERE ca.dyskinesia_type_id = dt.id
  AND ca.dyskinesia_type_codes IS NULL;


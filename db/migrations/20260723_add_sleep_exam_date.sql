-- Data do exame de sono (polissonografia), preenchida no passo Avaliação do Sono
ALTER TABLE clinical_assessments
  ADD COLUMN IF NOT EXISTS sleep_exam_date DATE NULL;

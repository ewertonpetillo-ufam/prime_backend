-- Pendência Samsung: flags em pdf_reports + permitir limpar file_sync_pending em binary_collections
-- após confirmação (UPDATE com file_synced_at), sem o trigger forçar TRUE de novo.

-- 1) pdf_reports: mesmo padrão de dirty bit que binary_collections
ALTER TABLE pdf_reports
  ADD COLUMN IF NOT EXISTS file_sync_pending BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE pdf_reports
  ADD COLUMN IF NOT EXISTS file_synced_at TIMESTAMPTZ NULL;

-- PDFs já existentes: tratamos como já refletidos no último estado conhecido (evita reenvio massivo).
-- file_synced_at preenchido faz o trigger aceitar a limpeza sem reativar pending.
UPDATE pdf_reports
   SET file_sync_pending = FALSE,
       file_synced_at = COALESCE(file_synced_at, uploaded_at, NOW())
 WHERE file_sync_pending = TRUE;

CREATE OR REPLACE FUNCTION flag_patient_from_pdf_report()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_id UUID;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.file_sync_pending = FALSE
       AND OLD.file_sync_pending IS DISTINCT FROM NEW.file_sync_pending
       AND NEW.file_synced_at IS NOT NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  NEW.file_sync_pending = TRUE;

  SELECT q.patient_id
    INTO v_patient_id
    FROM questionnaires q
   WHERE q.id = NEW.questionnaire_id;

  IF v_patient_id IS NOT NULL THEN
    UPDATE patients
       SET sync_pending = TRUE,
           sync_pending_at = NOW(),
           sync_version = sync_version + 1
     WHERE id = v_patient_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pdf_report_flag_sync ON pdf_reports;
CREATE TRIGGER trg_pdf_report_flag_sync
  BEFORE INSERT OR UPDATE ON pdf_reports
  FOR EACH ROW
  EXECUTE FUNCTION flag_patient_from_pdf_report();

-- 2) binary_collections: não sobrescrever confirmação de sync (file_sync_pending FALSE + file_synced_at)
CREATE OR REPLACE FUNCTION flag_patient_from_binary_collection()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_cpf_hash VARCHAR(128);
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE binary_collections
       SET deleted_pending = TRUE,
           file_sync_pending = TRUE
     WHERE id = OLD.id;

    UPDATE patients
       SET sync_pending = TRUE,
           sync_pending_at = NOW(),
           sync_version = sync_version + 1
     WHERE cpf_hash = OLD.patient_cpf_hash;

    RETURN NULL;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.file_sync_pending = FALSE
       AND OLD.file_sync_pending IS DISTINCT FROM NEW.file_sync_pending
       AND NEW.file_synced_at IS NOT NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  NEW.file_sync_pending = TRUE;

  IF TG_OP = 'INSERT' THEN
    NEW.deleted_pending = FALSE;
  ELSE
    NEW.deleted_pending = COALESCE(NEW.deleted_pending, FALSE);
  END IF;

  v_patient_cpf_hash := NEW.patient_cpf_hash;

  UPDATE patients
     SET sync_pending = TRUE,
         sync_pending_at = NOW(),
         sync_version = sync_version + 1
   WHERE cpf_hash = v_patient_cpf_hash;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

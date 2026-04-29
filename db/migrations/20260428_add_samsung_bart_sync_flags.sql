-- Flags de sincronização diferencial Samsung BART (dirty bit)

-- 1) Colunas de sincronização em patients
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS sync_pending BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS sync_pending_at TIMESTAMPTZ NULL;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ NULL;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS sync_version BIGINT NOT NULL DEFAULT 0;

-- 2) Colunas de sincronização em binary_collections
ALTER TABLE binary_collections
  ADD COLUMN IF NOT EXISTS file_sync_pending BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE binary_collections
  ADD COLUMN IF NOT EXISTS file_hash TEXT NULL;

ALTER TABLE binary_collections
  ADD COLUMN IF NOT EXISTS file_synced_at TIMESTAMPTZ NULL;

ALTER TABLE binary_collections
  ADD COLUMN IF NOT EXISTS deleted_pending BOOLEAN NOT NULL DEFAULT FALSE;

-- 3) Índices operacionais
CREATE INDEX IF NOT EXISTS idx_patients_sync_pending_at
  ON patients (sync_pending, sync_pending_at);

CREATE INDEX IF NOT EXISTS idx_binary_collections_sync_flags
  ON binary_collections (patient_cpf_hash, file_sync_pending, deleted_pending);

-- 4) Trigger para marcar paciente como pendente de sync
CREATE OR REPLACE FUNCTION flag_patient_sync()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sync_pending = TRUE;
  NEW.sync_pending_at = NOW();
  NEW.sync_version = COALESCE(OLD.sync_version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_patient_flag_sync ON patients;
CREATE TRIGGER trg_patient_flag_sync
  BEFORE UPDATE ON patients
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION flag_patient_sync();

-- 5) Trigger para marcar arquivo e propagar dirty bit ao paciente
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
    RETURN NULL;
  END IF;

  NEW.file_sync_pending = TRUE;
  NEW.deleted_pending = FALSE;

  v_patient_cpf_hash := NEW.patient_cpf_hash;

  UPDATE patients
     SET sync_pending = TRUE,
         sync_pending_at = NOW(),
         sync_version = sync_version + 1
   WHERE cpf_hash = v_patient_cpf_hash;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_binary_collection_flag_sync ON binary_collections;
CREATE TRIGGER trg_binary_collection_flag_sync
  BEFORE INSERT OR UPDATE OR DELETE ON binary_collections
  FOR EACH ROW
  EXECUTE FUNCTION flag_patient_from_binary_collection();

-- Rollback (executar manualmente se necessário):
-- DROP TRIGGER IF EXISTS trg_binary_collection_flag_sync ON binary_collections;
-- DROP FUNCTION IF EXISTS flag_patient_from_binary_collection();
-- DROP TRIGGER IF EXISTS trg_patient_flag_sync ON patients;
-- DROP FUNCTION IF EXISTS flag_patient_sync();
-- DROP INDEX IF EXISTS idx_binary_collections_sync_flags;
-- DROP INDEX IF EXISTS idx_patients_sync_pending_at;
-- ALTER TABLE binary_collections DROP COLUMN IF EXISTS deleted_pending;
-- ALTER TABLE binary_collections DROP COLUMN IF EXISTS file_synced_at;
-- ALTER TABLE binary_collections DROP COLUMN IF EXISTS file_hash;
-- ALTER TABLE binary_collections DROP COLUMN IF EXISTS file_sync_pending;
-- ALTER TABLE patients DROP COLUMN IF EXISTS sync_version;
-- ALTER TABLE patients DROP COLUMN IF EXISTS synced_at;
-- ALTER TABLE patients DROP COLUMN IF EXISTS sync_pending_at;
-- ALTER TABLE patients DROP COLUMN IF EXISTS sync_pending;

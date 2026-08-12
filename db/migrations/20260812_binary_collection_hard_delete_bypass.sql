-- Permite hard delete explícito via SET LOCAL app.hard_delete = 'true'
-- (API de dataset / confirmação pós-sync Samsung), preservando soft delete
-- para demais DELETEs (fila Samsung/BART).

CREATE OR REPLACE FUNCTION flag_patient_from_binary_collection()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_cpf_hash VARCHAR(128);
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF current_setting('app.hard_delete', true) = 'true' THEN
      RETURN OLD;
    END IF;

    IF binary_collection_is_samsung_speech_excluded(OLD.task_id, OLD.metadata) THEN
      RETURN OLD;
    END IF;

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

  IF binary_collection_is_samsung_speech_excluded(NEW.task_id, NEW.metadata) THEN
    NEW.file_sync_pending := FALSE;
    IF TG_OP = 'INSERT' THEN
      NEW.deleted_pending := FALSE;
    ELSE
      NEW.deleted_pending := COALESCE(NEW.deleted_pending, FALSE);
    END IF;
    RETURN NEW;
  END IF;

  NEW.file_sync_pending := TRUE;

  IF TG_OP = 'INSERT' THEN
    NEW.deleted_pending := FALSE;
  ELSE
    NEW.deleted_pending := COALESCE(NEW.deleted_pending, FALSE);
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

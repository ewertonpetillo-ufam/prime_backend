-- Corrige trigger de sync em binary_collections:
-- ao excluir, a linha deve ficar marcada como deleted_pending = TRUE
-- (soft delete para sincronização), sem ser sobrescrita em UPDATE subsequente.

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

  NEW.file_sync_pending = TRUE;

  -- Em INSERT, registros novos nunca começam como excluídos.
  -- Em UPDATE, preserva o valor recebido (inclui fluxo interno do soft delete).
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

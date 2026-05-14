-- TA10/TA11/TA12 (WAV/fala): não entram no Samsung BART — não marcam pendência,
-- não contam em resumos e não disparam sync_pending no paciente.

CREATE OR REPLACE FUNCTION binary_collection_is_samsung_speech_excluded(
  p_task_id integer,
  p_metadata jsonb
) RETURNS boolean AS $$
DECLARE
  v_tc text;
BEGIN
  v_tc := UPPER(TRIM(COALESCE(p_metadata->>'task_code', '')));
  IF v_tc IN ('TA10', 'TA11', 'TA12') THEN
    RETURN TRUE;
  END IF;
  IF p_task_id IS NOT NULL THEN
    SELECT UPPER(TRIM(task_code))
      INTO v_tc
      FROM active_task_definitions
     WHERE id = p_task_id;
    IF v_tc IN ('TA10', 'TA11', 'TA12') THEN
      RETURN TRUE;
    END IF;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Limpar pendência legada em coletas de fala (não enviadas ao BART)
UPDATE binary_collections bc
   SET file_sync_pending = FALSE,
       file_synced_at = COALESCE(file_synced_at, NOW())
 WHERE binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)
   AND file_sync_pending = TRUE
   AND deleted_pending = FALSE;

-- Pacientes que só tinham pendência por fala: baixar sync_pending
UPDATE patients p
   SET sync_pending = FALSE
 WHERE sync_pending = TRUE
   AND NOT EXISTS (
     SELECT 1
       FROM binary_collections bc
      WHERE bc.patient_cpf_hash = p.cpf_hash
        AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)
        AND (bc.file_sync_pending = TRUE OR bc.deleted_pending = TRUE)
   )
   AND NOT EXISTS (
     SELECT 1
       FROM pdf_reports pr
       JOIN questionnaires q ON q.id = pr.questionnaire_id
      WHERE q.patient_id = p.id
        AND pr.file_sync_pending = TRUE
   );

CREATE OR REPLACE FUNCTION flag_patient_from_binary_collection()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_cpf_hash VARCHAR(128);
BEGIN
  IF TG_OP = 'DELETE' THEN
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

-- Laudo PDF de polissonografia: não entra no Samsung BART (dados pessoais).
-- EDF (POLYSOMNOGRAPHY com nome/mime .edf) continua na entrega.

CREATE OR REPLACE FUNCTION pdf_report_is_samsung_psg_laudo_excluded(
  p_report_type text,
  p_file_name text,
  p_mime_type text
) RETURNS boolean AS $$
DECLARE
  v_name text;
  v_mime text;
  v_is_edf boolean;
BEGIN
  IF UPPER(TRIM(COALESCE(p_report_type, ''))) <> 'POLYSOMNOGRAPHY' THEN
    RETURN FALSE;
  END IF;

  v_name := COALESCE(p_file_name, '');
  v_mime := LOWER(COALESCE(p_mime_type, ''));
  v_is_edf :=
    v_name ~* '\.edf(\.|$)'
    OR v_name ~* '(^|[^a-zA-Z])edf([^a-zA-Z]|$)'
    OR position('edf' in v_mime) > 0;

  RETURN NOT v_is_edf;
END;
$$ LANGUAGE plpgsql STABLE;

-- Limpar pendência legada de laudos (não enviados ao BART)
UPDATE pdf_reports pr
   SET file_sync_pending = FALSE,
       file_synced_at = COALESCE(file_synced_at, NOW())
 WHERE pdf_report_is_samsung_psg_laudo_excluded(pr.report_type, pr.file_name, pr.mime_type)
   AND file_sync_pending = TRUE;

-- Pacientes que só estavam pendentes por laudo PSG: baixar sync_pending
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
        AND NOT pdf_report_is_samsung_psg_laudo_excluded(
          pr.report_type, pr.file_name, pr.mime_type
        )
   );

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

  IF pdf_report_is_samsung_psg_laudo_excluded(
    NEW.report_type, NEW.file_name, NEW.mime_type
  ) THEN
    NEW.file_sync_pending := FALSE;
    RETURN NEW;
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

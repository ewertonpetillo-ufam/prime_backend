-- Evita reativar sync_pending durante a confirmação de sincronização
-- (quando o serviço seta sync_pending = false e atualiza synced_at).

CREATE OR REPLACE FUNCTION flag_patient_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sync_pending = FALSE
     AND OLD.sync_pending = TRUE
     AND NEW.synced_at IS DISTINCT FROM OLD.synced_at THEN
    RETURN NEW;
  END IF;

  NEW.sync_pending = TRUE;
  NEW.sync_pending_at = NOW();
  NEW.sync_version = COALESCE(OLD.sync_version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

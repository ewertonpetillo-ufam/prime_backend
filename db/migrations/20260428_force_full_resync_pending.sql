-- Força reprocessamento completo para próxima sincronização com BART.
-- Uso recomendado: executar manualmente quando precisar reenviar todo o acervo.

BEGIN;

UPDATE patients
   SET sync_pending = TRUE,
       sync_pending_at = NOW(),
       sync_version = COALESCE(sync_version, 0) + 1;

UPDATE binary_collections
   SET file_sync_pending = TRUE,
       deleted_pending = FALSE;

COMMIT;

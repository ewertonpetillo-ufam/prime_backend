-- Força reprocessamento completo para próxima sincronização com BART.
-- Uso recomendado: executar manualmente quando precisar reenviar todo o acervo.

BEGIN;

UPDATE patients
   SET sync_pending = TRUE,
       sync_pending_at = NOW(),
       sync_version = COALESCE(sync_version, 0) + 1;

UPDATE binary_collections bc
   SET file_sync_pending = TRUE,
       deleted_pending = FALSE
 WHERE NOT (
   UPPER(TRIM(COALESCE(bc.metadata->>'task_code', ''))) IN ('TA10', 'TA11', 'TA12')
   OR EXISTS (
     SELECT 1
       FROM active_task_definitions atd
      WHERE atd.id = bc.task_id
        AND UPPER(TRIM(atd.task_code)) IN ('TA10', 'TA11', 'TA12')
   )
 );

COMMIT;

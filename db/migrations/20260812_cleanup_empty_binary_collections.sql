-- Remove registros de binary_collections com csv_data vazio (órfãos/corrompidos).
-- Esses registros aparecem na exportação mas falham no download com 404
-- "Binary data not found for binary collection ...".
--
-- Antes de aplicar em produção, execute o diagnóstico:
--
-- SELECT p.public_identifier, bc.id, bc.file_size_bytes,
--        length(bc.csv_data) AS csv_data_bytes,
--        bc.metadata->>'file_name' AS file_name
--   FROM binary_collections bc
--   JOIN patients p ON p.cpf_hash = bc.patient_cpf_hash
--  WHERE length(bc.csv_data) = 0 OR bc.csv_data IS NULL;

BEGIN;

SET LOCAL app.hard_delete = 'true';

DELETE FROM binary_collections
 WHERE csv_data IS NULL
    OR length(csv_data) = 0;

COMMIT;

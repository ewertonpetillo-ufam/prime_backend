-- FL03: Free Living Samsung Health
-- Cadastro da tarefa ativa usada no export UFAM/PRIME e nos filtros de download.

INSERT INTO active_task_definitions (
  task_code,
  task_name,
  task_category,
  collection_form_type_id,
  description,
  instructions,
  active
)
SELECT
  'FL03',
  'Free Living Samsung Health',
  'OTHER',
  (SELECT id FROM collection_form_types WHERE code = 'UNDEFINED' LIMIT 1),
  'Coleta em vida livre via Samsung Health. O paciente utiliza o aplicativo Samsung Health para registrar dados de atividade, sono e sinais vitais fora do ambiente clínico.',
  'Mantenha o Samsung Health ativo no dispositivo conforme orientação da equipe. Realize as atividades habituais sem alterar a rotina. Não desative o aplicativo até o encerramento da coleta.',
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM active_task_definitions WHERE task_code = 'FL03'
);

# Samsung Sync — procedimentos operacionais

## Antes do deploy da correção de OOM

1. **Cancelar runs órfãos** com status `running` no banco:
   ```bash
   curl -X POST "https://<host>/api/v1/sync/samsung/runs/<run-uuid>/cancel"
   ```
   Se o cancel não responder, marcar manualmente no PostgreSQL:
   ```sql
   UPDATE samsung_sync_runs
      SET status = 'failed',
          finished_at = NOW(),
          error_message = 'Cancelado manualmente (run órfão)'
    WHERE status = 'running';
   ```

2. **Verificar `NODE_OPTIONS` e limite do container em produção:**
   ```
   NODE_OPTIONS=--max-old-space-size=4096
   # docker-compose: memory: 10G
   ```
   Heap do Node fica em 4 GiB; o cgroup precisa de folga para zlib, page cache e o PUT. Evitar valores de heap menores (ex.: 2048).

3. **Redis BullMQ — política de eviction:**
   ```
   maxmemory-policy noeviction
   ```
   Com `allkeys-lru`, jobs longos podem ser evictados durante sync de horas.

4. **Espaço do ZIP de entrega:** o pipeline grava em `SAMSUNG_SYNC_TEMP_DIR` (produção: `/var/prime-samsung-sync/{runId}/`, volume Docker `samsung-sync-tmp`). Não usar overlay `/tmp`. Monitorar disco; cleanup automático ao finalizar, falhar, ou após retomar o PUT.

## ZIP no BART e confirm crashou (não cancelar)

Se o ZIP já está no Artifactory (`Data/YYYYMMDD.zip`) e o run falhou em `confirmRunDelivery` (Postgres OOM / "Connection terminated unexpectedly" / "the database system is not yet accepting connections"):

1. **Não cancelar** o run e **não** redefinir pendências (`resetSyncPending`). Cancelar reabre `file_sync_pending` e pode reenviar o mesmo ZIP.
2. Confirmar as flags no banco (`patients.sync_pending`, `binary_collections.file_sync_pending` / `file_synced_at`, `pdf_reports`) para os pacientes já entregues — o ZIP no BART é a fonte da verdade.
3. Causa raiz: o trigger `audit_binary_collections` serializava o BYTEA `csv_data` em JSON a cada UPDATE. A migração `20260830_binary_collections_audit_omit_csv_data.sql` anula `csv_data` antes de `to_jsonb` e grava só metadados (`csv_data_omitted`, `file_size_bytes`, hash/checksum). Aplicar essa migração **antes** do próximo confirm.

## Após o deploy

1. Confirmar volume e memória:
   ```bash
   docker inspect prime-backend --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
   docker stats prime-backend --no-stream
   # LIMITE esperado: 10GiB; volume: /var/prime-samsung-sync
   ```
2. Se houver run `RUNNING` no passo 6 com ZIP no volume, o boot **retoma o PUT** (não marca failed).
3. Validar RSS durante o envio — não deve acompanhar o tamanho do ZIP.
4. Confirmar entrega no Artifactory: `Data/YYYYMMDD.zip` e `Metadata/YYYYMMDD_metadata.csv`.

## Simulação de restart (homologação)

1. Iniciar sync com filtro P013–P030.
2. Durante o passo 6 (`Enviando ZIP para o BART`): `docker restart prime-backend`.
3. Esperado: run permanece `running`; PUT é retomado a partir do ZIP no volume; job Bull continua o polling pelo `runId`.

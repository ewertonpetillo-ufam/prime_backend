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

2. **Verificar `NODE_OPTIONS` em produção:**
   ```
   NODE_OPTIONS=--max-old-space-size=4096
   ```
   Evitar valores menores (ex.: 2048) em syncs com PDFs grandes (DELSYS ~124 MiB).

3. **Redis BullMQ — política de eviction:**
   ```
   maxmemory-policy noeviction
   ```
   Com `allkeys-lru`, jobs longos podem ser evictados durante sync de horas.

4. **Espaço em `/tmp`:** o pipeline grava sub-ZIPs e o ZIP de entrega em `os.tmpdir()/prime-samsung-sync/{runId}/`. Monitorar disco; cleanup automático ao finalizar ou falhar o run.

## Após o deploy

1. Reiniciar o backend uma vez (recovery de runs órfãos no `onModuleInit`).
2. Reexecutar sync **P013–P030** somente após deploy.
3. Validar com `docker stats prime-backend` — RSS deve permanecer estável (sem salto para 3–4 GB).
4. Confirmar entrega no Artifactory: `Data/YYYYMMDD.zip` e `Metadata/YYYYMMDD_metadata.csv`.

## Simulação de restart (homologação)

1. Iniciar sync com filtro P013–P030.
2. Durante execução: `docker restart prime-backend`.
3. Esperado: run anterior marcado `failed`; job Bull retoma polling sem criar novo run; UI retoma poll pelo `runId` UUID.

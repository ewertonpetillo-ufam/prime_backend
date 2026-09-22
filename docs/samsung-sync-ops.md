# Entrega Samsung — procedimentos operacionais

A entrega ao BART/Artifactory usa a hierarquia **Study → Project → Session → Device**
(`MentalHealth/2026_UFAM_Parkinson_1/...`), conforme Data Submission Guidelines v1.9
e `UFAM_PRIME_DataGuidleness_V1`. O envelope Artifactory permanece:

- `Data/YYYYMMDD.zip`
- `Metadata/YYYYMMDD_metadata.csv`

O ZIP UFAM/PRIME (`export-prime`, `Dados_*_Pacientes.zip`) é independente e continua disponível.

## Conteúdo do ZIP Samsung (layout Guidelines)

```
MentalHealth/2026_UFAM_Parkinson_1/
  project_info.md
  {Pxxx}_{YYYYMMDD}_InClinic|PSG|FreeLiving/
    metadata.json
    User_Data|GW8_PrimeInClinic|SP_PrimeInClinic|Baiobit|EMG|...
```

- Voz (TA10–TA12): apenas CSV de features (`features_ta10.csv`, …); `.wav` excluído.
- Free Living: FL01/FL02 → `GW8_PrimeFreeLiving`; FL03 → `GW8_SamsungHealth`;
  diário → `SP_SymptomsDiary/annotations.csv`.

## Antes do deploy

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

3. **Redis BullMQ — política de eviction:**
   ```
   maxmemory-policy noeviction
   ```

4. **Espaço do ZIP de entrega:** o pipeline grava em `SAMSUNG_SYNC_TEMP_DIR` (produção: `/var/prime-samsung-sync/{runId}/`, volume Docker `samsung-sync-tmp`). Cleanup automático ao finalizar.

## ZIP no BART e confirm crashou (não cancelar)

Se o ZIP já está no Artifactory (`Data/YYYYMMDD.zip`) e o run falhou em `confirmRunDelivery`:

1. **Não cancelar** o run e **não** redefinir pendências (`resetSyncPending`).
2. Confirmar as flags no banco para os pacientes já entregues — o ZIP no BART é a fonte da verdade.
3. Causa raiz histórica: trigger `audit_binary_collections` serializava BYTEA — migração `20260830_binary_collections_audit_omit_csv_data.sql`.

## Após o deploy

1. Confirmar volume e memória.
2. Se houver run `RUNNING` no passo 6 com ZIP no volume, o boot **retoma o PUT**.
3. Validar no Artifactory: `Data/YYYYMMDD.zip` e `Metadata/YYYYMMDD_metadata.csv`.
4. Inspecionar árvore interna: `MentalHealth/2026_UFAM_Parkinson_1/project_info.md` e pastas de sessão com `metadata.json`.

## API

Rotas em `/api/v1/sync/samsung/*`. UI: **Entrega Samsung**.

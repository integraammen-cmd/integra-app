# Plan Maestro de Proyecto — Integra

## Fase 0 — MVP seguro
- Estructura de proyecto clonada.
- Script SQL ejecutado en Supabase (Prompt 1).
- Google OAuth + middleware de auth.
- CRUD de eventos + `DailyAgenda.jsx`.

## Fase 1 — Core de seguridad
- Rate limiting en todos los endpoints.
- Validación de schemas.
- `audit_logs` funcional.
- `alarmWorker.js` corriendo.

## Fase 2 — Matriz de costos
- `CostMatrixForm.jsx` + API de servicios.
- `CostMatrixView.jsx` con 5 columnas.
- `useBiometricAuth.js` protegiendo edición.
- API de aumentos porcentuales.

## Fase 3 — Exportación y reportes
- Generador PDF + botón compartir.
- `morningBriefing.js` diario.
- GET `/api/briefings`.

## Fase 4 — Producción
- Deploy en Vercel (staging → prod).
- Tests de contrato.
- Monitoreo y alertas.

## Cómo usar este plan
1. Revisar `spec/SPEC_MATRIX.md`.
2. Completar cada tarea de la fase activa.
3. Actualizar `logs/CHANGELOG_DEV.md` en cada paso.
4. Validar contra `ACCEPTANCE_CRITERIA.md`.

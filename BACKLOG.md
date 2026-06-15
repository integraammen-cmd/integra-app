# Backlog — Integra Mutual

## Sprint 0 — Preparación (EN CURSO)
- [x] Clonar estructura de carpetas + `logs/`
- [ ] Crear `PRIMORDIAL.md` + `ARCHITECTURE.md`
- [ ] Crear `SECURITY.md` + `SECURITY_SUMMARY.md`
- [ ] Configurar `package.json` y dependencias base

## Sprint 1 — Base de datos y autenticación
- [ ] Script SQL completo (Prompt 1) → ejecutar en Supabase
- [ ] Google OAuth configurado en Supabase
- [ ] Middleware de autenticación (`middleware.ts`)
- [ ] Cliente Supabase en `lib/supabase.ts`
- [ ] Validadores de schema en `lib/validators.ts`

## Sprint 2 — Agenda y eventos
- [ ] CRUD de eventos (`app/api/events/`)
- [ ] Componente `DailyAgenda.jsx` (Prompt 2)
- [ ] `alarmWorker.js` en `workers/` (cron cada 1 minuto)

## Sprint 3 — Matriz de costos
- [ ] `CostMatrixForm.jsx` — panel de carga de servicios y precios
- [ ] API CRUD de servicios (`app/api/services/`)
- [ ] `CostMatrixView.jsx` — matriz con 5 columnas de socios

## Sprint 4 — Seguridad y auditoría
- [ ] `useBiometricAuth.js` — protección de edición de precios
- [ ] API de aumentos porcentuales (Prompt 6)
- [ ] Registro en `audit_logs` en cada modificación de precio

## Sprint 5 — Exportación y reportes
- [ ] Generador PDF + botón compartir (Prompt 7)
- [ ] `morningBriefing.js` en `workers/` (Prompt 3)
- [ ] Endpoint GET `/api/briefings` para leer reportes

## Sprint 6 — Producción
- [ ] Rate limiting en endpoints sensibles
- [ ] Validación de esquema en todos los inputs
- [ ] Tests de contrato contra `openapi.yaml`
- [ ] Deploy en Vercel (staging → producción)

---

## Guía de colaboración: Matute, DeepSeek y Copilot

### Matute (Project Owner)
- Define prioridades y flujos de usuario.
- Valida criterios de aceptación.
- Aprueba cada sprint antes de avanzar.

### DeepSeek (Ingeniero principal)
- Implementa el código.
- Asegura que los endpoints cumplan `openapi.yaml`.
- Mantiene seguridad PSAI y `logs/` actualizados.

### Copilot Free + DeepSeek V4 (Asistencia)
- Autocompletado rápido y boilerplate.
- NUNCA tomar decisiones de seguridad o arquitectura.
- Siempre revisado por DeepSeek antes de commit.

---

## Notas
- Evitar crear carpetas hasta que un sprint lo requiera.
- `logs/CHANGELOG_DEV.md` se actualiza en cada paso.
- `logs/BUGS.md` se actualiza ante cualquier error.
- Las API keys NUNCA en el frontend.

<!-- BEGIN:nextjs-agent-rules -->
# Next.js App Router

This project uses Next.js App Router. API routes are in `app/api/`, components in `app/components/`, hooks in `app/hooks/`, and utilities in `app/lib/`.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-reading-order -->
# Orden de lectura del proyecto (economía de tokens)

## Regla de oro
**Si un archivo ya fue leído en esta sesión, NO se vuelve a leer.**

## Etapa 1 — Contexto mínimo (leer siempre al iniciar)
1. `PRIMORDIAL.md` — contexto esencial, <200 líneas
2. `spec/README.md` — mapa de archivos spec
3. `SPEC_MATRIX.md` — qué artefacto para qué fase
4. `SECURITY_SUMMARY.md` — seguridad en 1 minuto
5. `BACKLOG.md` — tareas actuales + guía de colaboración

## Etapa 2 — Por tipo de tarea (leer SOLO UNO)

| Tarea | Leer solo |
|---|---|
| Implementar endpoint | `openapi.yaml` + `API_CONTRACTS.md` |
| Validar feature | `ACCEPTANCE_CRITERIA.md` + `USE_CASES.md` |
| Diseñar DB | `DATA_MODEL.md` |
| Seguridad completa | `SECURITY.md` + `.security/SDD_SECURITY_INTEGRATION.md` |
| UX / producto | `UX_FLOW.md` + `USER_STORIES.md` |
| Desplegar | `DEPLOYMENT.md` + `DEPLOYMENT_CHECKLIST.md` |
| Planificar | `PROJECT_PLAN.md` |
| Decisión técnica | `DESIGN_DECISIONS.md` |

## Etapa 3 — Solo si hay ambigüedad
- `ARCHITECTURE.md` — flujo completo
- `PROTOCOLOS/PSAI_v1.3.md` — protocolo canónico completo (evitar en sesiones cortas)

## Prohibiciones
- NO leer `SECURITY.md` y `PSAI_v1.3.md` en la misma sesión salvo auditoría formal.
- NO leer `openapi.yaml` si la tarea no toca endpoints.
- NO crear archivos sin validar contra `SPEC_MATRIX.md`.
- NUNCA exponer API keys en código o frontend.
<!-- END:project-reading-order -->

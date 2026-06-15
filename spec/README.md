# Spec Driven Development (SDD) — Integra Mutual

## Archivos en este directorio
- `SPEC_MATRIX.md` — matriz de elementos SDD y su etapa.
- `USER_STORIES.md` — historias de usuario.
- `USE_CASES.md` — casos de uso detallados.
- `API_CONTRACTS.md` — contratos de endpoints.
- `openapi.yaml` — contrato OpenAPI canónico.
- `DATA_MODEL.md` — esquema de datos.
- `ACCEPTANCE_CRITERIA.md` — criterios de validación.
- `DESIGN_DECISIONS.md` — decisiones clave.
- `PROJECT_PLAN.md` — plan maestro por fases.
- `DEPLOYMENT.md` — guía de despliegue.
- `DEPLOYMENT_CHECKLIST.md` — checklist pre-producción.
- `TEST_PLAN.md` — estrategia de pruebas.
- `UX_FLOW.md` — flujos de usuario.
- `DATA_PRIVACY.md` — privacidad y retención.

## Cómo usarlo
1. Completar cada archivo cuando se define la fase.
2. `openapi.yaml` es la fuente canónica de contratos.
3. Mantener sincronizado con `CHANGELOG.md` y `logs/`.
4. Evitar duplicar información entre archivos.

## Orden de lectura para IA
1. `SPEC_MATRIX.md` → qué leer según la tarea
2. `DATA_MODEL.md` → estructura de datos
3. `openapi.yaml` → contratos de API (solo si se tocan endpoints)
4. Archivo específico según la fase

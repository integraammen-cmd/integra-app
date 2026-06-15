# Contratos de API — Integra

## Principios
- Fuente canónica: `openapi.yaml`.
- Autenticación: `Authorization: Bearer <token>` (Google OAuth).
- Validación estricta de schemas en todos los endpoints.
- API keys NUNCA en respuestas.

## Endpoints principales

### `POST /api/auth/callback`
Google OAuth callback. Intercambia código por sesión de Supabase.

### `GET /api/services`
Lista servicios agrupados por `service_groups`.

### `POST /api/services`
Crea o actualiza un servicio y su precio base.

### `GET /api/matrix`
Retorna la matriz de costos con los 5 tipos de socios calculados.

### `POST /api/price-update`
Aumento porcentual masivo (Prompt 6). Requiere autenticación biométrica.

### `POST /api/events`
CRUD de eventos de la agenda.

### `GET /api/briefings`
Reportes matutinos del Coordinador.

### `POST /api/reports/pdf`
Genera PDF de la matriz de costos (Prompt 7).

## API contract checklist
- [ ] Todos los campos con tipo y descripción en `openapi.yaml`.
- [ ] Validar y rechazar campos extra.
- [ ] Errores con `code` y `message` claros.
- [ ] Auth header en todos los endpoints protegidos.

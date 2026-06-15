# Plan de Pruebas — Integra

## Tipos de pruebas
- **Unitarias**: validators, cálculos de precios.
- **Integración**: API endpoints + Supabase.
- **E2E**: flujo completo de matriz de costos.
- **Seguridad**: rate limiting, auth, biometría, inyecciones.
- **Contrato**: validación contra `openapi.yaml`.

## Cobertura mínima
- Cálculo de descuentos para los 5 tipos de socios.
- CRUD de eventos y servicios.
- Aumentos porcentuales con redondeo.
- Generación de PDF.
- Autenticación biométrica.
- Rate limiting en endpoints de escritura.

## Flujo
1. Unit tests → cada commit.
2. Integración → antes de merge.
3. E2E → en staging.
4. Seguridad → antes de producción.
5. Contrato → cada cambio de API.

# Privacidad de Datos — Integra

## Clasificación de datos
- **Público**: nombres de servicios y categorías.
- **Interno**: eventos de agenda, briefings.
- **Sensible**: precios base, descuentos, matriz de costos.
- **Regulado**: datos de usuarios (Google OAuth).

## Retención
- `morning_briefings`: 90 días.
- `audit_logs`: 1 año (cifrados).
- `events`: según necesidad del Coordinador.
- Datos de usuario: mientras la cuenta esté activa.

## Consentimiento
- Google OAuth: consentimiento en primer login.
- Aviso de privacidad en pantalla de inicio.

## Logs y auditoría
- `audit_logs` con AES-256 (PSAI B3).
- Registro de toda modificación de precios y descuentos.

## Acceso
- Solo el Coordinador General tiene acceso.
- RLS en Supabase: cada usuario ve solo sus datos.
- Biometría requerida para editar información sensible.

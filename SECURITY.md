# Seguridad PSAI — Integra Mutual

## Versión 1.3 — Aplicado a Integra

*Protocolo base:* `PROTOCOLOS/PSAI_v1.3.md`
*Fecha:* Junio 2026

## Principios
- Security by design — seguridad antes del primer endpoint.
- Zero trust — todo input es sospechoso.
- Defense in depth — cada bloque es independiente.
- API keys NUNCA en frontend.

## Gateway PSAI aplicado a Integra

### Bloque 1 — Validación de inputs
- **B1A**: Normalización de texto en todo input de usuario (formularios, eventos, precios).
- **B1B**: Clasificador de patrones maliciosos (prompt injection en precios/descripciones).
- Validación de schema estricta en todos los endpoints.

### Bloque 2 — Protección de llamadas externas
- **B2**: SSRF protection en llamadas a Google Calendar API y OpenAI/DeepSeek.
- DNS resolution + IP fijada + header Host original.

### Bloque 3 — Auditoría
- **B3**: `audit_logs` registra todo cambio de precios, descuentos y configuraciones.
- AES-256 para logs forenses.

### Bloque 4 — Sanitización de outputs
- **B4**: Respuesta del LLM sanitizada antes de insertar en `morning_briefings`.
- PDF generado sin metadata sensible.

## Rate limiting
- Endpoints de precios: 30 req/min por sesión.
- Endpoints de lectura: 120 req/min por sesión.
- Redis aislado para rate limiter.

## Secretos
- `.env.local` NUNCA commiteado.
- Variables en Vercel: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `GOOGLE_CALENDAR_SERVICE_ACCOUNT`.
- Única key pública: `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Checklist pre-producción
- [ ] Gateway PSAI activo en todos los endpoints
- [ ] Rate limiting configurado
- [ ] `audit_logs` funcional en cambios de precios
- [ ] API keys solo en entorno de Vercel
- [ ] `.env*` en `.gitignore`
- [ ] RLS activo en todas las tablas de Supabase
- [ ] Biometría funcional en panel de edición
- [ ] Sanitización de output del LLM

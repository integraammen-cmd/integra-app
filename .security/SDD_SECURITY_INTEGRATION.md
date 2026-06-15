# Integración PSAI v1.3 — Integra Mutual

## Aplicación del protocolo

### B1A — Normalización de inputs
- Todo formulario (servicios, eventos, precios) pasa por normalización.
- Espaciado intencional, caracteres especiales, codificaciones anidadas.

### B1B — Clasificador de patrones
- Prompt injection en descripciones de servicios o eventos.
- Patrones de jailbreak en texto libre.

### B2 — SSRF protection
- Llamadas a Google Calendar API.
- Llamadas a OpenAI/DeepSeek API.

### B3 — Auditoría cifrada
- `audit_logs` con AES-256.
- Todo cambio de precios, descuentos y configuraciones.

### B4 — Sanitización de outputs
- Respuesta del LLM antes de `morning_briefings`.
- PDF generado sin metadata sensible.

## Rate limiting
- Precios (POST/PUT): 30 req/min.
- Lectura (GET): 120 req/min.
- PDF: 5 req/min.

## API keys
- NUNCA en frontend.
- `.env.local` en `.gitignore`.
- Solo `NEXT_PUBLIC_SUPABASE_ANON_KEY` visible al cliente.

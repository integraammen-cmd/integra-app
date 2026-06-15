# PSAI v1.3 — Compliance Checklist — Integra

## Infraestructura
- [ ] Gateway PSAI activo en todos los endpoints
- [ ] Rate limiting con Redis aislado
- [ ] Health check configurado
- [ ] Timeout 3 segundos en llamadas externas

## Bloque 1 — Validación
- [ ] B1A: normalización de inputs
- [ ] B1B: clasificador de patrones
- [ ] Schema validation en todos los endpoints

## Bloque 2 — SSRF
- [ ] DNS resolution + IP fijada en Google Calendar
- [ ] DNS resolution + IP fijada en OpenAI/DeepSeek

## Bloque 3 — Auditoría
- [ ] `audit_logs` funcional
- [ ] AES-256 en logs forenses
- [ ] Registro de cambios de precios

## Bloque 4 — Output
- [ ] Sanitización de respuesta LLM
- [ ] PDF sin metadata sensible

## Secretos
- [ ] `.env*` en `.gitignore`
- [ ] API keys solo en Vercel env vars
- [ ] Ningún `NEXT_PUBLIC_*` con keys sensibles

## Aprobación
- [ ] Revisado por Matute (Project Owner)
- [ ] Fecha: ____

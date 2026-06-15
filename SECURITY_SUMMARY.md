# Resumen de Seguridad — Integra

## Principios
- Security by design
- Zero trust
- Defense in depth
- API keys NUNCA en frontend

## Checklist rápido
- [ ] `.env*` en `.gitignore`
- [ ] Solo `NEXT_PUBLIC_SUPABASE_ANON_KEY` expuesta al cliente
- [ ] OpenAI/Google keys solo en Vercel env vars
- [ ] Rate limiting activo en endpoints de escritura
- [ ] `audit_logs` registrando cambios de precios
- [ ] RLS en todas las tablas
- [ ] Biometría en edición de precios
- [ ] Output del LLM sanitizado

## Referencias
- `SECURITY.md` — protocolo completo
- `../PROTOCOLOS/PSAI_v1.3.md` — protocolo canónico
- `ARCHITECTURE.md` — flujos y componentes
- `logs/BUGS.md` — bugs de seguridad

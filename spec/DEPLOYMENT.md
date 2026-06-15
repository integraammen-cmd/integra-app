# Despliegue — Integra

## Entornos
- **Staging**: `staging.integra.example.com`
- **Producción**: `integra.example.com`

## Pipeline
1. Push a `main` → build + lint + type-check.
2. Deploy automático a staging.
3. Ejecutar tests de contrato y acceptance.
4. Aprobación del Coordinador General.
5. Promoción manual a producción.

## Infraestructura
- Frontend + Backend: Vercel (Next.js)
- Base de datos: Supabase
- Cron jobs: Vercel Cron (alarmWorker, morningBriefing)
- PDF: PDFKit en API route

## Secretos (Vercel env vars)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALENDAR_SERVICE_ACCOUNT`

## Checklist pre-deploy
- [ ] `.env*` en `.gitignore`
- [ ] RLS activo en Supabase
- [ ] Rate limiting configurado
- [ ] `audit_logs` funcional
- [ ] Biometría funcional
- [ ] PDF generado correctamente

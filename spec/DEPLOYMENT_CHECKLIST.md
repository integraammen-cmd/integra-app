# Deployment Checklist — Integra

## Pre-despliegue (CI)
- [ ] Merge en `main` tras revisión
- [ ] Lint, type-check, build OK

## Staging (obligatorio)
- [ ] Deploy en staging
- [ ] Pruebas e2e + contract tests
- [ ] Validar matriz de costos con datos reales
- [ ] Validar generación de PDF
- [ ] Validar alarmWorker y morningBriefing
- [ ] Aprobación del Coordinador

## Promoción a producción
- [ ] Tag de versión
- [ ] Rollback plan listo
- [ ] Deploy en Vercel
- [ ] Smoke tests post-deploy
- [ ] Monitoreo 1-2 horas

## Rollback
- [ ] Revertir a tag anterior en Vercel
- [ ] Verificar integridad de datos
- [ ] Registrar en `CHANGELOG.md`

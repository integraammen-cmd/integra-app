# Registro de Desarrollo — Integra

## Reglas de registro
- **Cada acción de desarrollo se documenta.** Sin excepciones.
- Si algo falla, se registra ANTES de arreglarlo (no después).
- Los commits de Git referencian entradas de este changelog.

## Formato de entrada
```
### [YYYY-MM-DD] — Título resumen

**Acción**: qué se hizo, con qué herramienta.
**Resultado**: qué pasó (éxito, error, warning).
**Archivos tocados**: lista de paths.
**Commit**: hash o mensaje.
**Próximo paso**: qué sigue.
```

## Historial

### [2026-06-14] — Inicio del proyecto Integra
**Acción**: Creación de estructura base desde templates del ecosistema.
**Resultado**: Éxito. Carpetas y archivos base creados.
**Archivos tocados**: Todos los iniciales.
**Commit**: —
**Próximo paso**: Paso 2 — PRIMORDIAL.md + ARCHITECTURE.md + BACKLOG.md

### [2026-06-14] — Paso 2: Documentos raíz y spec
**Acción**: Creación de PRIMORDIAL.md, ARCHITECTURE.md, SECURITY.md, SECURITY_SUMMARY.md, BACKLOG.md, README.md, CHANGELOG.md, AGENTS.md, .gitignore, package.json, y 15 artefactos en spec/.
**Resultado**: Éxito. 27 archivos de documentación creados.
**Archivos tocados**: Todos los .md, .yaml, .json raíz y spec/.
**Commit**: —
**Próximo paso**: Paso 3 — Script SQL para Supabase.

### [2026-06-14] — Paso 3: Script SQL generado
**Acción**: Creación de `spec/init_schema.sql` con 8 tablas, índices, RLS, seed data y triggers.
**Resultado**: Éxito. Script listo para ejecución manual en SQL Editor de Supabase.
**Archivos tocados**: `spec/init_schema.sql`.
**Commit**: —
**Próximo paso**: Ejecutar script en Supabase → confirmar → Paso 4 (Google OAuth).

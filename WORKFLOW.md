# WORKFLOW — Integra Mutual

> **Basado en**: `tutor-universitario/templates/WORKFLOW_TEMPLATE.md`
> **Versión**: 1.0 — 2026-06-20

---

## Regla de oro

**ANTES de ejecutar cualquier prompt de desarrollo, se genera el registro. NUNCA después.**

Esto garantiza trazabilidad completa, commits con referencias cruzadas, y un historial de desarrollo auditable.

---

## Ciclo diario (6 pasos)

### Paso 1 — REGISTRAR en CHANGELOG_DEV.md
Abrir `logs/CHANGELOG_DEV.md` y agregar entrada **antes de empezar**:
```markdown
### [YYYY-MM-DD] — Título resumen de la sesión

**Prompt**: descripción de lo que se le pide al ingeniero.
**Acción esperada**: qué se va a hacer.
**Archivos previstos**: lista de paths que se espera modificar/crear.
**Resultado**: (COMPLETAR al finalizar)
**Archivos tocados**: (COMPLETAR al finalizar)
**Commit**: (COMPLETAR al finalizar)
**Próximo paso**: (COMPLETAR al finalizar)
```

### Paso 2 — CREAR LOG diario
Crear `logs/YYYY-MM-DD-tipo-version.md` con:
- **CONTEXTO**: prompt completo.
- **PLAN**: archivos y orden de ejecución.
- **EJECUCIÓN**: tabla de archivos con estado.
- **PROBLEMAS**: bugs o bloqueos.
- **DECISIONES**: cambios de rumbo.
- **QA**: checklist de verificación.

### Paso 3 — EJECUTAR el prompt
Implementar según lo planificado. Respetar:
- `AGENTS.md` → orden de lectura.
- `spec/SPEC_MATRIX.md` → validación de artefactos.
- `SECURITY_SUMMARY.md` → reglas de seguridad.
- `WORKFLOW.md` → este archivo.

### Paso 4 — COMPLETAR los registros
- Completar campos pendientes en `CHANGELOG_DEV.md`.
- Completar tablas de ejecución, problemas y QA en el LOG diario.
- Si hay bugs, registrarlos en `logs/BUGS.md`.

### Paso 5 — COMMIT
```bash
git add -A
git commit -m "tipo: descripción breve (ref: logs/YYYY-MM-DD-...)"
```
Tipos: `feat` | `fix` | `refactor` | `docs` | `chore` | `security`

### Paso 6 — PUSH
```bash
git push
```

---

## Estructura de logs

```
logs/
├── README.md              — reglas de la carpeta
├── CHANGELOG_DEV.md       — bitácora cronológica
├── BUGS.md                — bugs con causa raíz y solución
└── YYYY-MM-DD-tipo-version.md  — log detallado de sesión
```

---

## Convenciones de este proyecto

| Elemento | Convención |
|---|---|
| Idioma | Español (logs, commits, docs) |
| Encoding | UTF-8 |
| Formato fechas | YYYY-MM-DD (ISO 8601) |
| Severidad bugs | baja / media / alta / crítica |
| Seguridad | `[SEGURIDAD]` en título de bug/commit |

---

## Referencias

- `PRIMORDIAL.md` — visión general de la app.
- `AGENTS.md` — reglas para el ingeniero.
- `BACKLOG.md` — tareas y sprints.
- `spec/SPEC_MATRIX.md` — matriz de artefactos.
- `SECURITY_SUMMARY.md` — seguridad rápida.
- `PROTOCOLOS/PSAI_v1.3.md` — protocolo de seguridad canónico.

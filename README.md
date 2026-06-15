# Integra — Mutual de Salud y Servicios Sociales

Plataforma de gestión para la Mutual Integra: administración de servicios, cálculo de tarifas por tipo de socio, agenda diaria, reportes matutinos con IA y exportación de matriz de costos.

## Documentación
- `PRIMORDIAL.md` — contexto esencial del proyecto.
- `ARCHITECTURE.md` — arquitectura y flujos técnicos.
- `SECURITY.md` — protocolo de seguridad PSAI aplicado a Integra.
- `SECURITY_SUMMARY.md` — referencia rápida de seguridad.
- `BACKLOG.md` — backlog de desarrollo y guía de colaboración.
- `logs/` — registro de desarrollo, bugs y soluciones.
- `spec/` — especificación SDD completa (15 artefactos).

## Stack
- Next.js + React + Tailwind CSS
- Supabase PostgreSQL + pgvector
- Google OAuth
- OpenAI / DeepSeek

## Tipos de socios
| Socio | Descuento |
|---|---|
| Activo | 60% |
| Integra 90 | 0% |
| Integra 180 | 30% |
| Integra 360 | 40% |
| Integra 360 Plus | A confirmar |

## Inicio rápido
```bash
npm install
npm run dev
```

## Seguridad
Ver `SECURITY.md`. Las API keys NUNCA se exponen en el frontend.

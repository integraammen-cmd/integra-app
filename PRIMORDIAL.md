# Contexto Primordial — Integra Mutual

## Propósito
Definir en menos de 200 líneas el contexto esencial de Integra: qué es, por qué existe, para quién es y cómo debe funcionar.

## Visión general
Integra es una plataforma de gestión para una Mutual de Salud y Servicios Sociales. Su objetivo es:
- Administrar servicios de salud, odontología, enfermería, cosmetología y prestaciones sociales.
- Calcular tarifas para 5 tipos de socios (Activo, Integra 90, 180, 360, 360 Plus).
- Proveer una agenda diaria con alertas para el Coordinador General.
- Generar reportes matutinos ejecutivos con IA.
- Exportar y compartir la matriz de costos en PDF.

## Usuario principal
- **Coordinador General de la Mutual**: gestiona servicios, precios, eventos y recibe el informe matutino diario.

## Qué hace la app
- Carga de servicios agrupados por categorías y sus precios base (Integra 90).
- Cálculo automático de tarifas para los 5 tipos de socios según descuentos.
- Agenda diaria con eventos categorizados y alertas configurables.
- Agente matutino que genera un informe ejecutivo a las 6AM usando IA.
- Protección biométrica para edición de precios sensibles.
- Exportación de matriz de costos a PDF con compartición nativa.

## Stack tecnológico
- Frontend: Next.js + React + Tailwind CSS
- Backend: Next.js API routes
- Base de datos: Supabase PostgreSQL + pgvector
- Autenticación: Google OAuth
- IA: OpenAI / DeepSeek para reportes matutinos
- Seguridad: Protocolo PSAI v1.3

## Tipos de socios y descuentos
| Socio | Descuento sobre base |
|---|---|
| Activo | 60% |
| Integra 90 | 0% (precio base) |
| Integra 180 | 30% |
| Integra 360 | 40% |
| Integra 360 Plus | A confirmar |

## Aspectos críticos
- Las API keys NUNCA se exponen al frontend.
- La edición de precios está protegida por biometría.
- El Gateway PSAI valida todo input antes de procesarlo.
- Los logs de desarrollo y bugs se registran en `logs/`.

## Entregables inmediatos
- `ARCHITECTURE.md`: flujo técnico de la app.
- `SECURITY.md`: PSAI aplicado a Integra.
- `spec/`: documentación SDD completa (15 artefactos).
- `logs/`: registro de desarrollo y bugs.

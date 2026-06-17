## [0.2.0] — 2026-06-17

### Tipo: REFACTOR
### Autor: Coordinador General (asistido por Claude — Anthropic)
### Estado: EJECUTADO — Pendiente verificación QA
### Prompt ejecutado en: DeepSeek V3 Pro vía GitHub Copilot Free (VS Code)

---

### Motivación
La versión 0.1.0 fue generada con DeepSeek V3 Pro vía GitHub Copilot Free.
El resultado fue funcional pero con problemas críticos: inconsistencia de tema
visual entre pantallas (mezcla dark/light), ausencia total de configuración PWA,
botón "Salir" rojo que rompía la identidad visual en todas las pantallas, valores
$0.00 destacados incorrectamente en verde/azul, eventos no renderizados como
bloques en la grilla horaria del Calendario, y pantalla negra vacía en IA Chat
sin orientación al usuario.
Esta versión corrige todos esos problemas y aplica la identidad visual oficial
de la mutual como design system de la app, sin reescribir la lógica de negocio.

---

### Design system aplicado
Fuente de verdad: folleto oficial de Integra Mutual de Salud y Servicios Sociales.
- Fondo: #1E35CC (azul royal — reemplaza negro anterior)
- Cards: #2A44D6
- Acento primario: #00D47A (verde Integra)
- Tipografía: Poppins 400/500/600/700 (reemplaza fuente anterior)
- Bordes: rgba(255,255,255,0.12)
- Radius cards: 14px / Radius botones: 10px
- Gráficos: SVG y divs puros (sin librerías externas)

---

### Cambios ejecutados

#### 🔧 Correcciones
- [x] Tema visual inconsistente: Matriz de Costos y Ajustes migradas a tema azul
- [x] Botón rojo "Salir" eliminado de todas las pantallas
      → Reemplazado por ícono logout discreto en header
- [x] Valores $0.00 corregidos a --text-muted (gris apagado)
      → Verde reservado exclusivamente para valores reales y acciones primarias
- [x] Eventos del Calendario renderizados como bloques en grilla horaria
- [x] Validación de horario laboral en formulario de creación de eventos (7:00–21:00)
- [x] Pantalla IA Chat: reemplazada pantalla negra vacía por empty state con chips

#### ✨ Features nuevas
- [x] PWA instalable en Android: manifest.json + Service Worker
- [x] Pantalla Inicio reestructurada con 3 secciones:
  - [x] 4 KPI cards (servicios cargados, sin precio, eventos hoy, urgentes)
  - [x] Bloque "Resumen operativo" con 5 estadísticas:
    - [x] Cobertura de precios (progress bar)
    - [x] Distribución por grupo de servicio (barras horizontales SVG)
    - [x] Costo promedio por tipo de socio (barras verticales SVG)
    - [x] Servicio más caro con desglose por plan
    - [x] Últimos servicios con precio cargado
  - [x] Agenda del día con empty state y formato 24hs
- [x] IA Chat: 5 chips de preguntas sugeridas clickeables en empty state
- [x] Matriz de Costos: jerarquía visual de botones + scroll horizontal en mobile
- [x] Ajustes: toast de feedback al guardar/eliminar servicio
- [x] Ajustes: buscador/filtro en lista de servicios cargados
- [x] Navbar: label visible solo en ítem activo, highlight en verde Integra

#### 🧩 Componentes nuevos creados
- [x] `KPICard.tsx`
- [x] `StatBar.tsx`
- [x] `EmptyState.tsx`
- [x] `Toast.tsx`
- [x] `SectionLabel.tsx`

---

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| /public/manifest.json | NUEVO |
| /public/sw.js | NUEVO |
| /app/globals.css | MODIFICADO — paleta completa + variables CSS |
| /app/layout.tsx | MODIFICADO — Poppins + meta tags PWA |
| /app/components/KPICard.tsx | NUEVO |
| /app/components/StatBar.tsx | NUEVO |
| /app/components/EmptyState.tsx | NUEVO |
| /app/components/Toast.tsx | NUEVO |
| /app/components/SectionLabel.tsx | NUEVO |
| /app/components/Navbar.tsx | MODIFICADO — label activo + highlight |
| /app/(dashboard)/page.tsx | MODIFICADO — KPIs + estadísticas + agenda |
| /app/(dashboard)/calendario/page.tsx | MODIFICADO — bloques grilla + validación |
| /app/(dashboard)/ia-chat/page.tsx | MODIFICADO — empty state + chips |
| /app/(dashboard)/informes/page.tsx | MODIFICADO — tema + jerarquía botones |
| /app/(dashboard)/ajustes/page.tsx | MODIFICADO — tema + toast + buscador |

---

### QA pendiente de verificar en Chrome Android

- [ ] App instalable (banner "Agregar a pantalla de inicio" aparece)
- [ ] Tema azul royal consistente en todas las pantallas
- [ ] KPIs cargan con datos reales de Supabase sin error
- [ ] Gráficos de estadísticas renderizan correctamente
- [ ] Chips del IA Chat envían mensaje al clickear
- [ ] Toast aparece al guardar y al eliminar servicio
- [ ] Eventos se pintan como bloques en grilla horaria del Calendario
- [ ] Validación de horario rechaza horas fuera de 7:00–21:00
- [ ] Scroll horizontal funciona en tabla de Matriz de Costos
- [ ] Botón rojo "Salir" ausente en todas las pantallas
- [ ] Sin errores en consola al navegar entre los 5 tabs
- [ ] Poppins carga correctamente en todas las pantallas

---

### Bugs conocidos pre-refactor (referencia histórica)
- Evento cargado con hora "12:31 a.m." sin validación de rango
- 41 de 42 servicios con precio $0.00 (datos pendientes de carga,
  no es bug del sistema)
- Viewport/zoom en Android vertical: pendiente de resolución (BACKLOG)

---

### Notas técnicas
Prompt maestro elaborado con análisis visual del folleto oficial de Integra Mutual
y revisión del repositorio GitHub. Design system extraído directamente del material
de marca de la organización. Arquitectura respetada según ARCHITECTURE.md.
PSAI v1.3 no requiere cambios en este ciclo.
Próxima versión planificada: v0.3.0 — Importador de datos, estadísticas de uso,
comparador de servicios y evolución de precios.
# Registro de Cambios — Integra

## [0.1.0] — 2026-06-14
### Inicio del proyecto
- Estructura base creada desde templates.
- `PRIMORDIAL.md`, `ARCHITECTURE.md`, `SECURITY.md` iniciales.
- `logs/` configurado para registro de desarrollo y bugs.
- `spec/` poblado con 14 artefactos SDD.
- Stack definido: Next.js + Supabase + Google OAuth.

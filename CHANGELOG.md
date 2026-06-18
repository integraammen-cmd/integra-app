## [0.3.0] — 2026-06-17

### Tipo: FEATURE
### Autor: Coordinador General (asistido por Claude — Anthropic)
### Estado: EN PROGRESO
### Prompt ejecutado en: DeepSeek V3 Pro vía GitHub Copilot Free (VS Code)

---

### Motivación
La v0.2.0 resolvió el diseño y la identidad visual. Esta versión agrega
capacidad analítica real a la app: importación de datos desde el sistema
propietario de la mutual, motor de estadísticas de uso por socio y servicio,
comparador de servicios con historial de evolución de precios, y configuración
de parámetros estadísticos. Convierte la app de asistente visual a herramienta
de toma de decisiones gerenciales.

---

### Tablas nuevas en Supabase
- [ ] `service_price_history` — historial de precios por servicio + trigger
- [ ] `imports` — registro de archivos importados
- [ ] `usage_records` — registros de uso socio/servicio desde CSV/PDF
- [ ] `app_settings` — configuración global de la app

---

### Cambios planificados

#### ✨ Módulo 1 — Importador de datos
- [ ] Nueva ruta `/importar`
- [ ] Drop zone para CSV y PDF
- [ ] Preview con validación fila por fila antes de confirmar
- [ ] Matching automático con servicios existentes en Supabase
- [ ] Historial de imports anteriores con opción de eliminar
- [ ] Registro en audit_logs por cada importación

#### ✨ Módulo 2 — Estadísticas de uso
- [ ] Tab nuevo dentro de Informes
- [ ] Panel de filtros: período, tipo de socio, grupo de servicio
- [ ] 4 KPI cards del período
- [ ] Gráfico 1: servicios más utilizados (barras horizontales SVG)
- [ ] Gráfico 2: uso por tipo de socio (barras verticales SVG)
- [ ] Gráfico 3: evolución mensual (línea SVG)
- [ ] Estadística: socios que NO usaron servicios en el período
- [ ] Estadística: top 5 socios por uso
- [ ] Matriz cruzada: tipo de socio × servicio más usado
- [ ] Exportar reporte PDF con jspdf

#### ✨ Módulo 3 — Comparador de servicios
- [ ] Tab "Comparador" dentro de Informes
- [ ] Selector con autocomplete hasta 4 servicios simultáneos
- [ ] Tabla comparativa por tipo de socio
- [ ] Historial de precios desde service_price_history
- [ ] Variación acumulada desde primer precio registrado

#### ✨ Módulo 4 — Ajustes extendidos
- [ ] Campo: total de socios del padrón
- [ ] Campo: días para considerar socio inactivo (default 90)
- [ ] Guardado en tabla app_settings

#### 🧩 Componentes nuevos
- [ ] `StatLineChart.tsx` — línea temporal SVG puro
- [ ] `CrossTable.tsx` — matriz cruzada con destacado de máximo
- [ ] `FileDropzone.tsx` — drop zone con estados y animación
- [ ] `FilterPanel.tsx` — filtros colapsables con persistencia
- [ ] `PriceHistoryList.tsx` — historial cronológico de precios

---

### Archivos a crear/modificar

| Archivo | Tipo de cambio |
|---|---|
| Supabase — SQL tablas nuevas | NUEVO |
| /app/(dashboard)/importar/page.tsx | NUEVO |
| /app/(dashboard)/informes/page.tsx | MODIFICADO — tabs |
| /app/(dashboard)/ajustes/page.tsx | MODIFICADO — sección settings |
| /app/components/StatLineChart.tsx | NUEVO |
| /app/components/CrossTable.tsx | NUEVO |
| /app/components/FileDropzone.tsx | NUEVO |
| /app/components/FilterPanel.tsx | NUEVO |
| /app/components/PriceHistoryList.tsx | NUEVO |
| /app/components/Navbar.tsx | MODIFICADO — 6to ítem |

---

### QA pendiente de verificar

- [ ] Tablas creadas correctamente en Supabase
- [ ] Trigger de historial de precios funciona al editar un servicio
- [ ] CSV con columnas estándar se importa sin error
- [ ] Preview muestra filas válidas, con advertencia y con error
- [ ] Matching automático vincula servicios existentes
- [ ] Historial de imports lista correctamente
- [ ] Filtros de estadísticas responden correctamente
- [ ] Gráfico de línea renderiza con datos reales
- [ ] Matriz cruzada destaca el máximo por fila
- [ ] Comparador muestra hasta 4 servicios simultáneos
- [ ] Historial de precios muestra variación con flechas y colores
- [ ] app_settings guarda y recupera correctamente
- [ ] Exportar PDF genera archivo legible
- [ ] Navbar muestra 6 ítems sin romperse en mobile
- [ ] Sin errores en consola

---

### Formato CSV esperado del sistema propietario
Columnas fijas en este orden:
`socio_codigo | socio_nombre | tipo_socio | servicio_nombre | monto_cobrado | fecha_uso`
Fechas: DD/MM/YYYY o YYYY-MM-DD (ambos aceptados)

---

### Notas técnicas
Prompt elaborado con Claude (Anthropic) el 2026-06-17.
Arquitectura respetada según ARCHITECTURE.md.
PSAI v1.3 no requiere cambios en este ciclo.
Gráficos implementados con SVG y divs puros — sin recharts ni chart.js.

## [0.2.3] — 2026-06-17

### Tipo: FIX + FEATURE
### Autor: Coordinador General (asistido por Claude — Anthropic)
### Estado: EN PROGRESO
### Prompt ejecutado en: DeepSeek V3 Pro vía GitHub Copilot Free (VS Code)

---

### Motivación
Pantalla de Inicio sobrecargada visualmente — se simplifica
dejando solo los 4 KPI cards y la agenda del día seleccionado.
Bug crítico de timezone: eventos se mostraban un día antes por
diferencia UTC vs UTC-3 Argentina. Calendario sin bloques visuales
en la grilla horaria. Se agrega botón de Estadísticas en el navbar
como placeholder para la v0.3.0.

---

### Cambios

#### 🔧 Fixes
- [ ] Inicio: eliminadas estadísticas y resumen operativo
- [ ] Inicio: selector de días + lista de eventos del día
- [ ] Bug timezone: eventos aparecían un día antes (UTC sin convertir a UTC-3)
- [ ] Calendario: eventos pintados como bloques en grilla horaria
- [ ] Calendario: fix timezone igual que en Inicio

#### ✨ Features
- [ ] Calendario: vista diaria con flechas ← → para navegar
- [ ] Calendario: toggle Semana / Día en el header
- [ ] Navbar: 6to ítem "Estadísticas" con ícono BarChart2
- [ ] Nueva pantalla /estadisticas — placeholder para v0.3.0

---

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| /app/(dashboard)/page.tsx | MODIFICADO — simplificado + timezone |
| /app/(dashboard)/calendario/page.tsx | MODIFICADO — bloques + toggle + timezone |
| /app/components/Navbar.tsx | MODIFICADO — 6 ítems |
| /app/(dashboard)/estadisticas/page.tsx | NUEVO |

---

### QA pendiente

- [ ] Inicio muestra solo KPIs + selector días + lista eventos
- [ ] Al tocar un día aparecen sus eventos en orden cronológico
- [ ] Evento cargado el viernes aparece el viernes (no el jueves)
- [ ] Eventos aparecen como bloques en la grilla del calendario
- [ ] Toggle Semana/Día funciona correctamente
- [ ] Vista diaria navega con flechas ← →
- [ ] Navbar muestra 6 ítems sin romperse en mobile
- [ ] Pantalla Estadísticas abre sin error
- [ ] Sin errores en consola

---

### Notas
Las estadísticas del Inicio se mueven a la pantalla de
Estadísticas que se implementará completamente en v0.3.0.

## [0.2.1] — 2026-06-17

### Tipo: FIX
### Autor: Coordinador General (asistido por Claude — Anthropic)
### Estado: EN PROGRESO
### Prompt ejecutado en: DeepSeek V3 Pro vía GitHub Copilot Free (VS Code)

---

### Motivación
Post-deploy de v0.2.0 se detectaron 5 problemas críticos:
fondo azul saturado agotador para uso diario, contenido pegado
a los bordes sin padding, input del chat tapado por la navbar,
exportación PDF con campos "undefined", y WhatsApp enviando
texto en lugar del archivo PDF real.
Se cambia la paleta de fondo de azul royal #1E35CC a azul noche
#0A0F2E, manteniendo el verde #00D47A como acento de marca.

---

### Cambios

#### 🎨 Paleta actualizada
- [ ] Fondo: #1E35CC → #0A0F2E (azul noche, elegido por el usuario)
- [ ] Cards: #2A44D6 → #111835
- [ ] Card hover: #3050E0 → #1A2445
- [ ] Agregado: --accent-blue: #3B82F6

#### 🔧 Fixes
- [ ] Padding lateral 16px en todas las pantallas
- [ ] Padding-bottom 80px en todas las páginas (espacio para navbar)
- [ ] IA Chat: input fijo a bottom: 65px, no tapado por navbar
- [ ] PDF: campos undefined corregidos con operador ??
- [ ] WhatsApp: comparte el PDF real usando Web Share API
      con fallback a wa.me para browsers sin soporte

---

### Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| /app/globals.css | MODIFICADO — paleta + page-container |
| /app/(dashboard)/page.tsx | MODIFICADO — padding |
| /app/(dashboard)/calendario/page.tsx | MODIFICADO — padding |
| /app/(dashboard)/ia-chat/page.tsx | MODIFICADO — padding + fix input |
| /app/(dashboard)/informes/page.tsx | MODIFICADO — padding + PDF + WhatsApp |
| /app/(dashboard)/ajustes/page.tsx | MODIFICADO — padding |

---

### QA pendiente

- [ ] Fondo azul noche en todas las pantallas
- [ ] Contenido con margen lateral visible en mobile
- [ ] Input del chat visible sobre la navbar
- [ ] PDF exporta nombres y grupos correctamente
- [ ] WhatsApp abre selector de compartir con el PDF adjunto
- [ ] Sin errores en consola

---

### Notas
Paleta elegida por el Coordinador General a partir de
comparador visual interactivo generado con Claude.  

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

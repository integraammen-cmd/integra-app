# UX Flows — Integra

## Usuario único
- **Coordinador General**: gestiona servicios, precios, agenda, recibe briefing matutino.

## Flujo 1: Gestión de matriz de costos
1. Login con Google OAuth.
2. Pantalla principal: matriz de costos (`CostMatrixView.jsx`).
3. Botón "Cargar Servicio" → `CostMatrixForm.jsx`.
4. Ingresa nombre, grupo, precio base (Integra 90).
5. Guarda → vuelve a la matriz actualizada.
6. Para editar precios: botón biométrico → desbloquea campos → edita → guarda.

## Flujo 2: Agenda diaria
1. Sidebar o pestaña "Agenda".
2. `DailyAgenda.jsx` muestra eventos del día.
3. Crear evento: título, categoría, hora, alarma.
4. Evento aparece en tiempo real (Supabase WebSockets).
5. Alarmas suenan según `notification_offset`.

## Flujo 3: Reporte matutino
1. Cada mañana a las 6AM se genera automáticamente.
2. Coordinador abre la app → ve el briefing del día.
3. Secciones: Enfoque del Día, Alertas Críticas, Hoja de Ruta.

## Flujo 4: Exportación PDF
1. En `CostMatrixView.jsx`, botón "Exportar PDF".
2. Sistema genera PDF en A4 horizontal.
3. Web Share API: compartir directo por WhatsApp/email.
4. Fallback: descarga automática.

## Principios de diseño
- Colores: Azul #1e3c72 (institucional), Verde #2ecc71 (servicios sociales).
- Campos de precios siempre disabled hasta autenticación biométrica.
- Errores visibles con mensajes claros.

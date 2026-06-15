# Casos de Uso — Integra

## UC-001: Calcular matriz de costos
- **Actor**: Coordinador General
- **Disparador**: Abre la pantalla de matriz
- **Precondiciones**: Autenticado, servicios cargados
- **Flujo principal**:
  1. El sistema carga servicios desde Supabase agrupados por `service_groups`.
  2. Para cada servicio, obtiene `base_price` (Integra 90).
  3. Calcula en memoria: Activo (base - 60%), In180 (base - 30%), In360 (base - 40%).
  4. Renderiza la grilla con las 5 columnas.
  5. In360 Plus muestra "A confirmar".
- **Flujos alternativos**: Si no hay servicios, muestra mensaje "Sin servicios cargados".
- **Postcondiciones**: Matriz visible y actualizada.

## UC-002: Aumento porcentual masivo
- **Actor**: Coordinador General (con biometría)
- **Disparador**: Ejecuta aumento desde el panel
- **Precondiciones**: Biometría confirmada, grupo seleccionado
- **Flujo principal**:
  1. Ingresa `percentage_increase` y `rounding_rule`.
  2. Sistema ejecuta UPDATE SQL con CASE + ROUND/CEIL.
  3. Retorna cantidad de filas modificadas.
  4. Registra en `audit_logs`.
- **Flujos alternativos**: Si `group_id` es null, afecta a todos los servicios.

## UC-003: Generar briefing matutino
- **Actor**: Sistema (cron 6AM)
- **Disparador**: Vercel Cron activa `morningBriefing.js`
- **Precondiciones**: Google Calendar y Supabase accesibles
- **Flujo principal**:
  1. Consulta Google Calendar para eventos del día.
  2. Consulta Supabase para alertas pendientes.
  3. Arma payload JSON y llama a OpenAI/DeepSeek.
  4. Sanitiza respuesta.
  5. Inserta en `morning_briefings`.
- **Postcondiciones**: Briefing disponible para el Coordinador.

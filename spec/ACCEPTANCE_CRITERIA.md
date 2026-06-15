# Criterios de Aceptación — Integra

## Formato
- `Dado` (contexto) → `Cuando` (acción) → `Entonces` (resultado)

## Matriz de costos
- Dado que el Coordinador está autenticado,
- Cuando abre `CostMatrixView.jsx`,
- Entonces ve los 5 tipos de socios como columnas y los servicios agrupados por categoría,
  con los precios calculados según los descuentos configurados.

## Carga de servicios
- Dado que el Coordinador está en `CostMatrixForm.jsx`,
- Cuando ingresa nombre, grupo y precio base de un servicio,
- Entonces el servicio se guarda en Supabase y aparece en la matriz.

## Agenda diaria
- Dado que el Coordinador está en `DailyAgenda.jsx`,
- Cuando crea un evento con categoría y hora,
- Entonces el evento aparece en la agenda y, si tiene alarma, muestra el ícono de campana.

## Reporte matutino
- Dado que son las 6:00 AM,
- Cuando `morningBriefing.js` se ejecuta,
- Entonces consulta Google Calendar + Supabase, llama al LLM y guarda el briefing en `morning_briefings`.

## Seguridad
- Dado que un usuario no autenticado intenta acceder a un endpoint,
- Cuando el middleware verifica el token,
- Entonces retorna `401`.

- Dado que el Coordinador intenta editar precios sin autenticación biométrica,
- Cuando presiona el botón de edición,
- Entonces los campos permanecen `disabled` hasta que la biometría confirme.

## Reglas
- Medibles y comprobables.
- Sin detalles de implementación.
- Alineadas con `openapi.yaml`.

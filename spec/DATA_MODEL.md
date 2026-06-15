# Modelo de Datos — Integra

## Entidades

### service_groups
- `id`: UUID (PK)
- `name`: text (UNIQUE) — ej: 'Farmacia', 'Odontología'

### services
- `id`: UUID (PK)
- `group_id`: UUID (FK → service_groups ON DELETE CASCADE)
- `name`: text (UNIQUE)

### service_base_prices
- `id`: UUID (PK)
- `service_id`: UUID (FK → services ON DELETE CASCADE, UNIQUE)
- `base_price`: numeric(10,2) — precio Integra 90

### partner_discounts
- `id`: UUID (PK)
- `partner_type`: text CHECK ('Activo','Integra 90','Integra 180','Integra 360','Integra 360 Plus')
- `discount_percentage`: numeric(5,2)

### events
- `id`: UUID (PK)
- `user_id`: UUID (FK → auth.users)
- `title`: text
- `description`: text
- `start_time`: timestamptz
- `end_time`: timestamptz
- `category`: text CHECK ('salud','sociales','gremial','admin','urgente')
- `alarm_enabled`: boolean
- `notification_offset`: interval (DEFAULT '15 minutes')

### morning_briefings
- `id`: UUID (PK)
- `user_id`: UUID (FK → auth.users)
- `date`: date (UNIQUE)
- `summary`: text (markdown)
- `critical_alerts`: jsonb

### mutual_context
- `id`: UUID (PK)
- `title`: text
- `content`: text
- `embedding`: vector(1536)
- `category`: text

### audit_logs
- `id`: UUID (PK)
- `event_type`: text
- `usuario_id`: text
- `descripcion`: text
- `severity`: text
- `contexto`: jsonb
- `created_at`: timestamptz

## Relaciones
- `service_groups` 1:N `services`
- `services` 1:1 `service_base_prices`
- `auth.users` 1:N `events`
- `auth.users` 1:N `morning_briefings`

## Notas
- `pgvector` habilitado para `mutual_context.embedding`.
- RLS en todas las tablas.
- `audit_logs` registra cambios de precios y configuraciones.

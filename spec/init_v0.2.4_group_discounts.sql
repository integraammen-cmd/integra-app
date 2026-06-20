-- ============================================================
-- [FIX v0.2.4]: Descuentos personalizados por grupo de servicio
-- Reemplaza los porcentajes hardcodeados (60%, 30%, 40%)
-- por valores editables por grupo en tabla group_discounts.
-- Ejecutar en: SQL Editor de Supabase
-- ============================================================

-- 1. Crear tabla group_discounts
CREATE TABLE IF NOT EXISTS group_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES service_groups(id) ON DELETE CASCADE,
  tipo_socio TEXT NOT NULL CHECK (
    tipo_socio IN ('Activo','Integra 90','Integra 180','Integra 360','Integra 360 Plus')
  ),
  descuento_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0
    CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, tipo_socio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_gd_group ON group_discounts(group_id);
CREATE INDEX IF NOT EXISTS idx_gd_tipo ON group_discounts(tipo_socio);

-- 2. Insertar valores por defecto para todos los grupos existentes
-- Activo: 60%
INSERT INTO group_discounts (group_id, tipo_socio, descuento_porcentaje)
SELECT id, 'Activo', 60 FROM service_groups
ON CONFLICT (group_id, tipo_socio) DO NOTHING;

-- Integra 90: 0% (precio base, sin descuento)
INSERT INTO group_discounts (group_id, tipo_socio, descuento_porcentaje)
SELECT id, 'Integra 90', 0 FROM service_groups
ON CONFLICT (group_id, tipo_socio) DO NOTHING;

-- Integra 180: 30%
INSERT INTO group_discounts (group_id, tipo_socio, descuento_porcentaje)
SELECT id, 'Integra 180', 30 FROM service_groups
ON CONFLICT (group_id, tipo_socio) DO NOTHING;

-- Integra 360: 40%
INSERT INTO group_discounts (group_id, tipo_socio, descuento_porcentaje)
SELECT id, 'Integra 360', 40 FROM service_groups
ON CONFLICT (group_id, tipo_socio) DO NOTHING;

-- Integra 360 Plus: 0% (a confirmar)
INSERT INTO group_discounts (group_id, tipo_socio, descuento_porcentaje)
SELECT id, 'Integra 360 Plus', 0 FROM service_groups
ON CONFLICT (group_id, tipo_socio) DO NOTHING;

-- 3. Habilitar RLS
ALTER TABLE group_discounts ENABLE ROW LEVEL SECURITY;

-- Política: lectura para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer group_discounts"
  ON group_discounts FOR SELECT
  TO authenticated
  USING (true);

-- Política: escritura para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden modificar group_discounts"
  ON group_discounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Verificación
SELECT
  sg.name AS grupo,
  gd.tipo_socio,
  gd.descuento_porcentaje
FROM group_discounts gd
JOIN service_groups sg ON sg.id = gd.group_id
ORDER BY sg.name, gd.tipo_socio;

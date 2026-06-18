-- ================================================================
-- [FEATURE v0.3.0]: Nuevas tablas para importador, estadísticas y configuración
-- Ejecutar en Supabase SQL Editor
-- ================================================================

-- 1. Historial de precios de servicios
CREATE TABLE IF NOT EXISTS service_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  precio_base DECIMAL(12,2) NOT NULL,
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sph_service ON service_price_history(service_id);
CREATE INDEX IF NOT EXISTS idx_sph_vigente ON service_price_history(vigente_desde);

-- Trigger: al actualizar service_base_prices, registrar en historial
CREATE OR REPLACE FUNCTION fn_price_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Cerrar el registro anterior (si existe)
  UPDATE service_price_history
  SET vigente_hasta = CURRENT_DATE
  WHERE service_id = NEW.service_id
    AND vigente_hasta IS NULL
    AND precio_base <> NEW.base_price;

  -- Insertar nuevo registro
  INSERT INTO service_price_history (service_id, precio_base, vigente_desde)
  VALUES (NEW.service_id, NEW.base_price, CURRENT_DATE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_price_history ON service_base_prices;
CREATE TRIGGER trg_price_history
  AFTER INSERT OR UPDATE OF base_price ON service_base_prices
  FOR EACH ROW
  EXECUTE FUNCTION fn_price_history();

-- Insertar precios actuales en el historial (datos existentes)
INSERT INTO service_price_history (service_id, precio_base, vigente_desde)
SELECT service_id, base_price, CURRENT_DATE
FROM service_base_prices
WHERE NOT EXISTS (
  SELECT 1 FROM service_price_history sph
  WHERE sph.service_id = service_base_prices.service_id
);


-- 2. Registro de importaciones
CREATE TABLE IF NOT EXISTS imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  archivo_nombre TEXT NOT NULL,
  fecha_import TIMESTAMPTZ DEFAULT NOW(),
  total_registros INTEGER NOT NULL,
  registros_validos INTEGER NOT NULL,
  registros_error INTEGER DEFAULT 0,
  estado TEXT CHECK (estado IN ('completo','parcial','error')) DEFAULT 'completo',
  notas TEXT
);

-- 3. Registros de uso importados
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_id UUID REFERENCES imports(id) ON DELETE CASCADE,
  socio_codigo TEXT,
  socio_nombre TEXT NOT NULL,
  tipo_socio TEXT NOT NULL,
  servicio_nombre TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  monto_cobrado DECIMAL(12,2),
  fecha_uso DATE NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_fecha ON usage_records(fecha_uso);
CREATE INDEX IF NOT EXISTS idx_usage_tipo_socio ON usage_records(tipo_socio);
CREATE INDEX IF NOT EXISTS idx_usage_servicio ON usage_records(servicio_nombre);
CREATE INDEX IF NOT EXISTS idx_usage_import ON usage_records(import_id);


-- 4. Configuración de la app
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (key, value)
VALUES ('total_socios_padron', '0')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value)
VALUES ('dias_inactividad', '90')
ON CONFLICT (key) DO NOTHING;


-- 5. RLS — acceso solo para usuario autenticado
ALTER TABLE service_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['service_price_history','imports','usage_records','app_settings'])
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Acceso autenticado" ON %I;
      CREATE POLICY "Acceso autenticado" ON %I
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    ', tbl, tbl);
  END LOOP;
END;
$$;

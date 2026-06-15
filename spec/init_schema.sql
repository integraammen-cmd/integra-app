-- ============================================================
-- INTEGRA MUTUAL — Script SQL de Inicialización
-- Basado en Prompt 1 + DATA_MODEL.md
-- Ejecutar en: SQL Editor de Supabase
-- ============================================================

-- 0. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLAS DE DOMINIO (catálogos, sin RLS o RLS lectura)
-- ============================================================

-- 1.1 Grupos de servicios
CREATE TABLE service_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2 Servicios individuales
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES service_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.3 Precios base (Integra 90)
CREATE TABLE service_base_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL UNIQUE REFERENCES services(id) ON DELETE CASCADE,
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 Descuentos por tipo de socio
CREATE TABLE partner_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_type TEXT NOT NULL UNIQUE CHECK (
    partner_type IN ('Activo','Integra 90','Integra 180','Integra 360','Integra 360 Plus')
  ),
  discount_percentage NUMERIC(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. TABLAS DE USUARIO (con RLS por user_id)
-- ============================================================

-- 2.1 Eventos de la agenda
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  category TEXT NOT NULL CHECK (category IN ('salud','sociales','gremial','admin','urgente')),
  alarm_enabled BOOLEAN DEFAULT false,
  notification_offset INTERVAL DEFAULT '15 minutes',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 Reportes matutinos
CREATE TABLE morning_briefings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary TEXT DEFAULT '',
  critical_alerts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 2.3 Contexto de la mutual (documentos con embeddings)
CREATE TABLE mutual_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. TABLA DE AUDITORÍA
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  usuario_id TEXT,
  descripcion TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  contexto JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. ÍNDICES
-- ============================================================

CREATE INDEX idx_services_group_id ON services(group_id);
CREATE INDEX idx_base_prices_service_id ON service_base_prices(service_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_alarm ON events(alarm_enabled, start_time) WHERE alarm_enabled = true;
CREATE INDEX idx_briefings_user_date ON morning_briefings(user_id, date);
CREATE INDEX idx_mutual_context_user ON mutual_context(user_id);
CREATE INDEX idx_mutual_context_embedding ON mutual_context USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_type ON audit_logs(event_type);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- 5.1 Catálogos: lectura para todo autenticado, escritura solo autenticado
ALTER TABLE service_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_base_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de grupos para autenticados" ON service_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura de grupos para autenticados" ON service_groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Actualización de grupos para autenticados" ON service_groups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Eliminación de grupos para autenticados" ON service_groups FOR DELETE TO authenticated USING (true);

CREATE POLICY "Lectura de servicios para autenticados" ON services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura de servicios para autenticados" ON services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Actualización de servicios para autenticados" ON services FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Eliminación de servicios para autenticados" ON services FOR DELETE TO authenticated USING (true);

CREATE POLICY "Lectura de precios para autenticados" ON service_base_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura de precios para autenticados" ON service_base_prices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Actualización de precios para autenticados" ON service_base_prices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Eliminación de precios para autenticados" ON service_base_prices FOR DELETE TO authenticated USING (true);

CREATE POLICY "Lectura de descuentos para autenticados" ON partner_discounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura de descuentos para autenticados" ON partner_discounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Actualización de descuentos para autenticados" ON partner_discounts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Eliminación de descuentos para autenticados" ON partner_discounts FOR DELETE TO authenticated USING (true);

-- 5.2 Tablas de usuario: aislamiento por user_id
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutual_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos: CRUD del propio usuario" ON events FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Briefings: CRUD del propio usuario" ON morning_briefings FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Contexto: CRUD del propio usuario" ON mutual_context FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5.3 Auditoría: solo inserción para autenticados, lectura solo autenticados
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de auditoría para autenticados" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inserción de auditoría para autenticados" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- 6. SEED DATA — Descuentos por tipo de socio
-- ============================================================

INSERT INTO partner_discounts (partner_type, discount_percentage) VALUES
  ('Activo', 60.00),
  ('Integra 90', 0.00),
  ('Integra 180', 30.00),
  ('Integra 360', 40.00),
  ('Integra 360 Plus', NULL);

-- ============================================================
-- 7. FUNCIÓN: trigger para actualizar updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_base_prices_updated_at
  BEFORE UPDATE ON service_base_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

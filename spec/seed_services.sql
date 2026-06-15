-- ============================================================
-- INTEGRA MUTUAL — Seed de Grupos y Servicios
-- Ejecutar en SQL Editor de Supabase DESPUÉS de init_schema.sql
-- ============================================================

-- Grupos de servicios
INSERT INTO service_groups (name) VALUES
  ('Cuotas'),
  ('Bono Solidario'),
  ('Bonos de Consulta'),
  ('Odontológicas'),
  ('Enfermería'),
  ('Cosmetología'),
  ('Podología'),
  ('Peluquería'),
  ('Masajes'),
  ('Salones'),
  ('Escuela de Música'),
  ('Mecánicos Dentales'),
  ('Cromo'),
  ('Fijas'),
  ('Prótesis Flexibles'),
  ('Ecografías'),
  ('Convenios'),
  ('Comed'),
  ('Famyl'),
  ('Petraslia')
ON CONFLICT (name) DO NOTHING;

-- Servicios con sus precios base (Integra 90)
-- Agrupados por categoría

-- Cuotas
INSERT INTO services (group_id, name) SELECT id, 'SEPELIO FAMILIAR' FROM service_groups WHERE name = 'Cuotas';
INSERT INTO services (group_id, name) SELECT id, 'CUOTA FIJAR' FROM service_groups WHERE name = 'Cuotas';
INSERT INTO services (group_id, name) SELECT id, 'CUOTA MENSUAL' FROM service_groups WHERE name = 'Cuotas';

-- Bono Solidario
INSERT INTO services (group_id, name) SELECT id, 'ELECTROCARDIOGRAMA' FROM service_groups WHERE name = 'Bono Solidario';
INSERT INTO services (group_id, name) SELECT id, 'AMMEN / CONVENIO NUTRICION' FROM service_groups WHERE name = 'Bono Solidario';

-- Bonos de Consulta
INSERT INTO services (group_id, name) SELECT id, 'BONOS DE CONSULTA KINESIOLOGIA' FROM service_groups WHERE name = 'Bonos de Consulta';
INSERT INTO services (group_id, name) SELECT id, 'BONOS DE CONSULTA GENERAL' FROM service_groups WHERE name = 'Bonos de Consulta';

-- Odontológicas
INSERT INTO services (group_id, name) SELECT id, 'CIRUGIAS ODONTOLOGICAS' FROM service_groups WHERE name = 'Odontológicas';
INSERT INTO services (group_id, name) SELECT id, 'CONSULTA ODONTOLOGICA GENERAL' FROM service_groups WHERE name = 'Odontológicas';
INSERT INTO services (group_id, name) SELECT id, 'ORTODONCIA' FROM service_groups WHERE name = 'Odontológicas';

-- Enfermería
INSERT INTO services (group_id, name) SELECT id, 'ATENCION DOMICILIARIA ENFERMERIA' FROM service_groups WHERE name = 'Enfermería';
INSERT INTO services (group_id, name) SELECT id, 'CURACIONES' FROM service_groups WHERE name = 'Enfermería';
INSERT INTO services (group_id, name) SELECT id, 'INYECTABLES' FROM service_groups WHERE name = 'Enfermería';

-- Cosmetología
INSERT INTO services (group_id, name) SELECT id, 'DRENAJE MEDIO CUERPO' FROM service_groups WHERE name = 'Cosmetología';
INSERT INTO services (group_id, name) SELECT id, 'DRENAJE CORPORAL COMPLETO' FROM service_groups WHERE name = 'Cosmetología';
INSERT INTO services (group_id, name) SELECT id, 'TRATAMIENTO FACIAL' FROM service_groups WHERE name = 'Cosmetología';

-- Podología
INSERT INTO services (group_id, name) SELECT id, 'CONSULTA PODOLOGICA' FROM service_groups WHERE name = 'Podología';
INSERT INTO services (group_id, name) SELECT id, 'TRATAMIENTO UÑAS' FROM service_groups WHERE name = 'Podología';

-- Peluquería
INSERT INTO services (group_id, name) SELECT id, 'CORTE DE PELO' FROM service_groups WHERE name = 'Peluquería';
INSERT INTO services (group_id, name) SELECT id, 'PEINADO' FROM service_groups WHERE name = 'Peluquería';
INSERT INTO services (group_id, name) SELECT id, 'COLORACION' FROM service_groups WHERE name = 'Peluquería';

-- Masajes
INSERT INTO services (group_id, name) SELECT id, 'MASAJE DESCONTRACTURANTE' FROM service_groups WHERE name = 'Masajes';
INSERT INTO services (group_id, name) SELECT id, 'MASAJE TERAPEUTICO' FROM service_groups WHERE name = 'Masajes';
INSERT INTO services (group_id, name) SELECT id, 'DRENAJE LINFATICO' FROM service_groups WHERE name = 'Masajes';

-- Salones
INSERT INTO services (group_id, name) SELECT id, 'SALON CHICO' FROM service_groups WHERE name = 'Salones';
INSERT INTO services (group_id, name) SELECT id, 'SALON GRANDE' FROM service_groups WHERE name = 'Salones';

-- Escuela de Música
INSERT INTO services (group_id, name) SELECT id, 'CUOTA MENSUAL ESCUELA' FROM service_groups WHERE name = 'Escuela de Música';
INSERT INTO services (group_id, name) SELECT id, 'INSCRIPCION' FROM service_groups WHERE name = 'Escuela de Música';

-- Mecánicos Dentales
INSERT INTO services (group_id, name) SELECT id, 'REPARACION SIMPLE' FROM service_groups WHERE name = 'Mecánicos Dentales';
INSERT INTO services (group_id, name) SELECT id, 'REPARACION COMPLEJA' FROM service_groups WHERE name = 'Mecánicos Dentales';

-- Cromo
INSERT INTO services (group_id, name) SELECT id, 'CROMO SIMPLE' FROM service_groups WHERE name = 'Cromo';
INSERT INTO services (group_id, name) SELECT id, 'CROMO DOBLE' FROM service_groups WHERE name = 'Cromo';

-- Fijas
INSERT INTO services (group_id, name) SELECT id, 'PROTESIS FIJA' FROM service_groups WHERE name = 'Fijas';
INSERT INTO services (group_id, name) SELECT id, 'CORONA' FROM service_groups WHERE name = 'Fijas';

-- Prótesis Flexibles
INSERT INTO services (group_id, name) SELECT id, 'PROTESIS FLEXIBLE PARCIAL' FROM service_groups WHERE name = 'Prótesis Flexibles';
INSERT INTO services (group_id, name) SELECT id, 'PROTESIS FLEXIBLE TOTAL' FROM service_groups WHERE name = 'Prótesis Flexibles';

-- Ecografías
INSERT INTO services (group_id, name) SELECT id, 'ECOGRAFIA MAMARIA' FROM service_groups WHERE name = 'Ecografías';
INSERT INTO services (group_id, name) SELECT id, 'ECOGRAFIA ABDOMINAL' FROM service_groups WHERE name = 'Ecografías';
INSERT INTO services (group_id, name) SELECT id, 'RX VARIAS' FROM service_groups WHERE name = 'Ecografías';

-- Convenios
INSERT INTO services (group_id, name) SELECT id, 'CONVENIO FARMACIA' FROM service_groups WHERE name = 'Convenios';
INSERT INTO services (group_id, name) SELECT id, 'CONVENIO OPTICA' FROM service_groups WHERE name = 'Convenios';
INSERT INTO services (group_id, name) SELECT id, 'CONVENIO ORTOPEDIA' FROM service_groups WHERE name = 'Convenios';

-- Precios base iniciales (todos en 0 para que el Coordinador los cargue)
INSERT INTO service_base_prices (service_id, base_price)
SELECT id, 0.00 FROM services
ON CONFLICT (service_id) DO NOTHING;

-- Verificación
SELECT
  sg.name AS grupo,
  COUNT(s.id) AS servicios
FROM service_groups sg
LEFT JOIN services s ON s.group_id = sg.id
GROUP BY sg.name
ORDER BY sg.name;

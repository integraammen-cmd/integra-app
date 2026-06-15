-- Función SQL para aumentos porcentuales con redondeo
-- Ejecutar en SQL Editor de Supabase

CREATE OR REPLACE FUNCTION apply_price_increase(
  p_group_id UUID DEFAULT NULL,
  p_factor NUMERIC DEFAULT 1.0,
  p_rounding_rule TEXT DEFAULT 'none'
) RETURNS TABLE(updated_count INT) AS $$
DECLARE
  v_count INT;
BEGIN
  IF p_rounding_rule = 'nearest_10' THEN
    UPDATE service_base_prices bp
    SET base_price = ROUND((bp.base_price * p_factor) / 10) * 10
    FROM services s
    WHERE bp.service_id = s.id
      AND (p_group_id IS NULL OR s.group_id = p_group_id);
  ELSIF p_rounding_rule = 'nearest_100' THEN
    UPDATE service_base_prices bp
    SET base_price = ROUND((bp.base_price * p_factor) / 100) * 100
    FROM services s
    WHERE bp.service_id = s.id
      AND (p_group_id IS NULL OR s.group_id = p_group_id);
  ELSE
    UPDATE service_base_prices bp
    SET base_price = ROUND((bp.base_price * p_factor)::numeric, 2)
    FROM services s
    WHERE bp.service_id = s.id
      AND (p_group_id IS NULL OR s.group_id = p_group_id);
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

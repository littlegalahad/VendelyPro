/*
# Agregar columnas de personalización a la tabla stores

Añade columnas para:
- catalog_layout: tipo de vista del catálogo (grid2, grid3, lista, magazine)
- custom_bg_color: color de fondo personalizado (hex, anula el tema)
- custom_text_color: color de texto personalizado (hex, anula el tema)
- custom_accent_color: color de acento personalizado (hex, anula el tema)
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='catalog_layout') THEN
    ALTER TABLE stores ADD COLUMN catalog_layout text NOT NULL DEFAULT 'grid2';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='custom_bg_color') THEN
    ALTER TABLE stores ADD COLUMN custom_bg_color text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='custom_text_color') THEN
    ALTER TABLE stores ADD COLUMN custom_text_color text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='custom_accent_color') THEN
    ALTER TABLE stores ADD COLUMN custom_accent_color text;
  END IF;
END $$;

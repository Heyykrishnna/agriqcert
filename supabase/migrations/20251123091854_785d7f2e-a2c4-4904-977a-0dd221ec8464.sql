-- Fix infinite recursion in RLS policies by restructuring them
-- The issue is circular dependencies between batches and inspections policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "QA agencies can view assigned batches" ON batches;
DROP POLICY IF EXISTS "Exporters can view inspections for their batches" ON inspections;

-- Add exporter_id to inspections table to avoid circular dependency
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS exporter_id UUID REFERENCES profiles(id);

-- Create trigger to automatically set exporter_id on inspections
CREATE OR REPLACE FUNCTION set_inspection_exporter_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.exporter_id := (SELECT exporter_id FROM batches WHERE id = NEW.batch_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_exporter_id_on_inspection ON inspections;
CREATE TRIGGER set_exporter_id_on_inspection
  BEFORE INSERT OR UPDATE OF batch_id ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION set_inspection_exporter_id();

-- Update existing inspections with exporter_id
UPDATE inspections 
SET exporter_id = (SELECT exporter_id FROM batches WHERE batches.id = inspections.batch_id)
WHERE exporter_id IS NULL;

-- Recreate policies without circular dependencies
-- QA agencies can view batches they have inspections for
CREATE POLICY "QA agencies can view assigned batches"
  ON batches
  FOR SELECT
  USING (
    id IN (
      SELECT batch_id 
      FROM inspections 
      WHERE qa_agency_id = auth.uid()
    )
  );

-- Exporters can view inspections for their batches using the new exporter_id column
CREATE POLICY "Exporters can view inspections for their batches"
  ON inspections
  FOR SELECT
  USING (auth.uid() = exporter_id);
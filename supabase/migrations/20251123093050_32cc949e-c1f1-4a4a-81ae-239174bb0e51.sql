-- Add tracking_token column to batches table
ALTER TABLE batches ADD COLUMN tracking_token TEXT UNIQUE;

-- Create function to generate tracking tokens
CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'TRK-';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate tracking token on batch insert
CREATE OR REPLACE FUNCTION set_batch_tracking_token()
RETURNS TRIGGER AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  -- Generate unique token
  LOOP
    new_token := generate_tracking_token();
    SELECT EXISTS(SELECT 1 FROM batches WHERE tracking_token = new_token) INTO token_exists;
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  NEW.tracking_token := new_token;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_batch_tracking_token
BEFORE INSERT ON batches
FOR EACH ROW
EXECUTE FUNCTION set_batch_tracking_token();

-- Update existing batches with tracking tokens
DO $$
DECLARE
  batch_record RECORD;
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  FOR batch_record IN SELECT id FROM batches WHERE tracking_token IS NULL LOOP
    LOOP
      new_token := generate_tracking_token();
      SELECT EXISTS(SELECT 1 FROM batches WHERE tracking_token = new_token) INTO token_exists;
      EXIT WHEN NOT token_exists;
    END LOOP;
    
    UPDATE batches SET tracking_token = new_token WHERE id = batch_record.id;
  END LOOP;
END $$;

-- Make tracking_token NOT NULL after backfilling
ALTER TABLE batches ALTER COLUMN tracking_token SET NOT NULL;

-- Add RLS policy for QA agencies to view all submitted batches
CREATE POLICY "QA agencies can view submitted batches"
ON batches
FOR SELECT
TO authenticated
USING (
  status = 'Submitted' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'qa_agency'
  )
);
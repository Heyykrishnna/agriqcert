-- Fix search_path for new functions
CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION set_batch_tracking_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
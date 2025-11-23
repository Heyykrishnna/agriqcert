-- Add expiry date and sharing functionality to profile documents
ALTER TABLE public.profile_documents 
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS shared_link_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS shared_with_email TEXT,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS share_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- Create index for expiry notifications
CREATE INDEX IF NOT EXISTS idx_profile_documents_expiry 
ON public.profile_documents(expiry_date, notification_sent) 
WHERE expiry_date IS NOT NULL;

-- Create index for shared links
CREATE INDEX IF NOT EXISTS idx_profile_documents_shared_token 
ON public.profile_documents(shared_link_token) 
WHERE shared_link_token IS NOT NULL;

-- Create shared documents view table for tracking access
CREATE TABLE IF NOT EXISTS public.document_share_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES profile_documents(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accessed_by_email TEXT,
  access_ip TEXT,
  user_agent TEXT
);

-- Enable RLS on share access table
ALTER TABLE public.document_share_access ENABLE ROW LEVEL SECURITY;

-- Policy for document owners to view access logs
CREATE POLICY "Document owners can view access logs"
  ON public.document_share_access
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile_documents 
      WHERE profile_documents.id = document_share_access.document_id 
      AND profile_documents.user_id = auth.uid()
    )
  );

-- Policy for inserting access logs (public for shared links)
CREATE POLICY "Anyone can log document access"
  ON public.document_share_access
  FOR INSERT
  WITH CHECK (true);

-- Function to check and send expiry notifications
CREATE OR REPLACE FUNCTION check_document_expiry_notifications()
RETURNS TABLE (
  document_id UUID,
  user_email TEXT,
  document_name TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pd.id,
    p.email,
    pd.document_name,
    pd.expiry_date,
    (pd.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM profile_documents pd
  JOIN profiles p ON p.id = pd.user_id
  WHERE pd.expiry_date IS NOT NULL
    AND pd.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND pd.notification_sent = false
  ORDER BY pd.expiry_date ASC;
END;
$$;
-- Create storage bucket for batch attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'batch-attachments',
  'batch-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv']
);

-- RLS policies for batch-attachments bucket
CREATE POLICY "Exporters can upload batch attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'batch-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  has_role(auth.uid(), 'exporter'::app_role)
);

CREATE POLICY "Exporters can view their own batch attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'batch-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "QA agencies can view batch attachments for assigned batches"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'batch-attachments' AND
  has_role(auth.uid(), 'qa_agency'::app_role)
);

CREATE POLICY "Admins can view all batch attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'batch-attachments' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Exporters can delete their own batch attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'batch-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  has_role(auth.uid(), 'exporter'::app_role)
);
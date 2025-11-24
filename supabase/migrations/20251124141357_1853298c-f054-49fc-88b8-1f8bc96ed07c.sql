-- Add UPDATE policy for exporters to update their own batches
CREATE POLICY "Exporters can update their own batches"
ON batches
FOR UPDATE
TO authenticated
USING (
  auth.uid() = exporter_id
  AND has_role(auth.uid(), 'exporter'::app_role)
  AND status = 'Submitted'
)
WITH CHECK (
  auth.uid() = exporter_id
  AND status = 'Submitted'
);
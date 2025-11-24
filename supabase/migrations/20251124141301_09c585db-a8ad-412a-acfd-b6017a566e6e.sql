-- Add DELETE policy for exporters to delete their own batches
CREATE POLICY "Exporters can delete their own batches"
ON batches
FOR DELETE
TO authenticated
USING (
  auth.uid() = exporter_id
  AND has_role(auth.uid(), 'exporter'::app_role)
);
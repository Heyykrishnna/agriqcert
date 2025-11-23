-- Update RLS policy to allow public read access to active verifiable credentials
DROP POLICY IF EXISTS "Anyone can view active VCs (public verification)" ON public.verifiable_credentials;

CREATE POLICY "Public can view active VCs for verification"
ON public.verifiable_credentials
FOR SELECT
USING (revocation_status = 'active');

-- Allow public read access to batches referenced by active VCs
CREATE POLICY "Public can view batches with active VCs"
ON public.batches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.verifiable_credentials
    WHERE verifiable_credentials.batch_id = batches.id
    AND verifiable_credentials.revocation_status = 'active'
  )
);

-- Allow public read access to inspections referenced by active VCs
CREATE POLICY "Public can view inspections with active VCs"
ON public.inspections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.verifiable_credentials
    WHERE verifiable_credentials.inspection_id = inspections.id
    AND verifiable_credentials.revocation_status = 'active'
  )
);
-- Create soil_tests table for tracking soil analysis results
CREATE TABLE public.soil_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  ph_level NUMERIC(3,1),
  nitrogen_ppm NUMERIC(10,2),
  phosphorus_ppm NUMERIC(10,2),
  potassium_ppm NUMERIC(10,2),
  organic_matter_percent NUMERIC(5,2),
  moisture_percent NUMERIC(5,2),
  salinity_ds_m NUMERIC(5,2),
  texture TEXT,
  notes TEXT,
  lab_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farm_certifications table for organic and sustainability certifications
CREATE TABLE public.farm_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  certification_name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  certificate_number TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  scope TEXT,
  standards TEXT[],
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sustainable_practices table for farming practices
CREATE TABLE public.sustainable_practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  practice_type TEXT NOT NULL,
  practice_name TEXT NOT NULL,
  description TEXT,
  implementation_date DATE,
  impact_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather_data table for climate tracking
CREATE TABLE public.weather_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL,
  temperature_celsius NUMERIC(5,2),
  humidity_percent NUMERIC(5,2),
  rainfall_mm NUMERIC(8,2),
  wind_speed_kmh NUMERIC(6,2),
  conditions TEXT,
  data_source TEXT DEFAULT 'manual',
  location_lat NUMERIC(10,8),
  location_lon NUMERIC(11,8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_tags table for better organization
CREATE TABLE public.document_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.profile_documents(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, tag_name)
);

-- Create document_versions table for version history
CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.profile_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.soil_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainable_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for soil_tests
CREATE POLICY "Exporters can manage soil tests for their batches"
  ON public.soil_tests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.batches 
    WHERE batches.id = soil_tests.batch_id 
    AND batches.exporter_id = auth.uid()
  ));

CREATE POLICY "QA agencies can view soil tests for assigned batches"
  ON public.soil_tests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.batch_id = soil_tests.batch_id 
    AND inspections.qa_agency_id = auth.uid()
  ));

CREATE POLICY "Public can view soil tests for batches with active VCs"
  ON public.soil_tests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.verifiable_credentials 
    WHERE verifiable_credentials.batch_id = soil_tests.batch_id 
    AND verifiable_credentials.revocation_status = 'active'
  ));

-- RLS Policies for farm_certifications
CREATE POLICY "Exporters can manage certifications for their batches"
  ON public.farm_certifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.batches 
    WHERE batches.id = farm_certifications.batch_id 
    AND batches.exporter_id = auth.uid()
  ));

CREATE POLICY "QA agencies can view certifications for assigned batches"
  ON public.farm_certifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.batch_id = farm_certifications.batch_id 
    AND inspections.qa_agency_id = auth.uid()
  ));

CREATE POLICY "Public can view certifications for batches with active VCs"
  ON public.farm_certifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.verifiable_credentials 
    WHERE verifiable_credentials.batch_id = farm_certifications.batch_id 
    AND verifiable_credentials.revocation_status = 'active'
  ));

-- RLS Policies for sustainable_practices
CREATE POLICY "Exporters can manage practices for their batches"
  ON public.sustainable_practices FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.batches 
    WHERE batches.id = sustainable_practices.batch_id 
    AND batches.exporter_id = auth.uid()
  ));

CREATE POLICY "QA agencies can view practices for assigned batches"
  ON public.sustainable_practices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.batch_id = sustainable_practices.batch_id 
    AND inspections.qa_agency_id = auth.uid()
  ));

CREATE POLICY "Public can view practices for batches with active VCs"
  ON public.sustainable_practices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.verifiable_credentials 
    WHERE verifiable_credentials.batch_id = sustainable_practices.batch_id 
    AND verifiable_credentials.revocation_status = 'active'
  ));

-- RLS Policies for weather_data
CREATE POLICY "Exporters can manage weather data for their batches"
  ON public.weather_data FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.batches 
    WHERE batches.id = weather_data.batch_id 
    AND batches.exporter_id = auth.uid()
  ));

CREATE POLICY "QA agencies can view weather data for assigned batches"
  ON public.weather_data FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.batch_id = weather_data.batch_id 
    AND inspections.qa_agency_id = auth.uid()
  ));

CREATE POLICY "Public can view weather data for batches with active VCs"
  ON public.weather_data FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.verifiable_credentials 
    WHERE verifiable_credentials.batch_id = weather_data.batch_id 
    AND verifiable_credentials.revocation_status = 'active'
  ));

-- RLS Policies for document_tags
CREATE POLICY "Users can manage tags for their documents"
  ON public.document_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profile_documents 
    WHERE profile_documents.id = document_tags.document_id 
    AND profile_documents.user_id = auth.uid()
  ));

-- RLS Policies for document_versions
CREATE POLICY "Users can manage versions for their documents"
  ON public.document_versions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profile_documents 
    WHERE profile_documents.id = document_versions.document_id 
    AND profile_documents.user_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_soil_tests_updated_at
  BEFORE UPDATE ON public.soil_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farm_certifications_updated_at
  BEFORE UPDATE ON public.farm_certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sustainable_practices_updated_at
  BEFORE UPDATE ON public.sustainable_practices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weather_data_updated_at
  BEFORE UPDATE ON public.weather_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
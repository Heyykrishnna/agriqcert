-- Add market data and pricing tables for importers/customers

-- Create market_prices table for price comparison
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  price_per_unit NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  minimum_order_quantity NUMERIC,
  availability_status TEXT NOT NULL DEFAULT 'available',
  msp NUMERIC,
  market_rate NUMERIC,
  negotiable BOOLEAN DEFAULT true,
  valid_until DATE,
  discount_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_prices
CREATE POLICY "Exporters can manage prices for their batches"
ON public.market_prices
FOR ALL
USING (EXISTS (
  SELECT 1 FROM batches 
  WHERE batches.id = market_prices.batch_id 
  AND batches.exporter_id = auth.uid()
));

CREATE POLICY "Importers and public can view available prices"
ON public.market_prices
FOR SELECT
USING (availability_status = 'available' OR auth.uid() IS NOT NULL);

-- Create batch_inquiries table for customer requests
CREATE TABLE public.batch_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  importer_id UUID NOT NULL,
  inquiry_type TEXT NOT NULL,
  quantity_requested NUMERIC,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batch_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batch_inquiries
CREATE POLICY "Importers can create and view their inquiries"
ON public.batch_inquiries
FOR ALL
USING (auth.uid() = importer_id);

CREATE POLICY "Exporters can view inquiries for their batches"
ON public.batch_inquiries
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM batches 
  WHERE batches.id = batch_inquiries.batch_id 
  AND batches.exporter_id = auth.uid()
));

CREATE POLICY "Exporters can respond to inquiries"
ON public.batch_inquiries
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM batches 
  WHERE batches.id = batch_inquiries.batch_id 
  AND batches.exporter_id = auth.uid()
));

-- Create market_analytics table for aggregated data
CREATE TABLE public.market_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type TEXT NOT NULL,
  region TEXT NOT NULL,
  average_price NUMERIC,
  min_price NUMERIC,
  max_price NUMERIC,
  total_volume NUMERIC,
  demand_trend TEXT,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_analytics
CREATE POLICY "Public can view market analytics"
ON public.market_analytics
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_market_prices_updated_at
BEFORE UPDATE ON public.market_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_batch_inquiries_updated_at
BEFORE UPDATE ON public.batch_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
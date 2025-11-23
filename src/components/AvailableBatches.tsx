import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Package, MapPin, Calendar, DollarSign, TrendingUp, TrendingDown, Minus, CloudRain, Thermometer } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface BatchWithPrice {
  id: string;
  product_type: string;
  variety: string | null;
  quantity: number;
  weight_unit: string;
  origin_country: string;
  origin_state: string | null;
  harvest_date: string;
  status: string;
  tracking_token: string;
  price: {
    id: string;
    price_per_unit: number;
    currency: string;
    msp: number | null;
    market_rate: number | null;
    minimum_order_quantity: number | null;
    negotiable: boolean;
    discount_percentage: number;
    valid_until: string | null;
  } | null;
  weather: {
    temperature_celsius: number | null;
    humidity_percent: number | null;
    rainfall_mm: number | null;
    conditions: string | null;
    recorded_date: string;
  } | null;
}

interface AvailableBatchesProps {
  onInquirySubmit?: () => void;
}

export const AvailableBatches = ({ onInquirySubmit }: AvailableBatchesProps) => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<BatchWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<BatchWithPrice | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    inquiry_type: "price_inquiry",
    quantity_requested: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);

      // First, get all certified batches
      const { data: certifiedBatches, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("status", "Certified")
        .order("created_at", { ascending: false });

      if (batchError) throw batchError;

      if (!certifiedBatches || certifiedBatches.length === 0) {
        setBatches([]);
        setLoading(false);
        return;
      }

      // Get prices for these batches
      const batchIds = certifiedBatches.map(b => b.id);
      const { data: prices } = await supabase
        .from("market_prices")
        .select("*")
        .in("batch_id", batchIds)
        .eq("availability_status", "available");

      // Get weather data for these batches
      const { data: weatherData } = await supabase
        .from("weather_data")
        .select("*")
        .in("batch_id", batchIds)
        .order("recorded_date", { ascending: false });

      // Map prices to batches
      const priceMap = new Map(prices?.map(p => [p.batch_id, p]) || []);
      
      // Map latest weather to batches
      const weatherMap = new Map();
      weatherData?.forEach(w => {
        if (!weatherMap.has(w.batch_id)) {
          weatherMap.set(w.batch_id, w);
        }
      });

      const formatted = certifiedBatches.map((batch: any) => ({
        ...batch,
        price: priceMap.get(batch.id) ? {
          id: priceMap.get(batch.id).id,
          price_per_unit: priceMap.get(batch.id).price_per_unit,
          currency: priceMap.get(batch.id).currency || "INR",
          msp: priceMap.get(batch.id).msp,
          market_rate: priceMap.get(batch.id).market_rate,
          minimum_order_quantity: priceMap.get(batch.id).minimum_order_quantity,
          negotiable: priceMap.get(batch.id).negotiable,
          discount_percentage: priceMap.get(batch.id).discount_percentage,
          valid_until: priceMap.get(batch.id).valid_until
        } : null,
        weather: weatherMap.get(batch.id) || null
      }));

      setBatches(formatted);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast.error("Failed to load available batches");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInquiry = async () => {
    if (!selectedBatch || !user) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("batch_inquiries")
        .insert({
          batch_id: selectedBatch.id,
          importer_id: user.id,
          inquiry_type: inquiryForm.inquiry_type,
          quantity_requested: inquiryForm.quantity_requested ? parseFloat(inquiryForm.quantity_requested) : null,
          message: inquiryForm.message,
          status: "pending"
        });

      if (error) throw error;

      toast.success("Inquiry submitted successfully!");
      setSelectedBatch(null);
      setInquiryForm({
        inquiry_type: "price_inquiry",
        quantity_requested: "",
        message: ""
      });
      
      onInquirySubmit?.();
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to submit inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const getPriceComparison = (price: BatchWithPrice["price"]) => {
    if (!price || !price.msp || !price.market_rate) return null;

    const currentPrice = price.price_per_unit;
    const mspDiff = ((currentPrice - price.msp) / price.msp) * 100;
    const marketDiff = ((currentPrice - price.market_rate) / price.market_rate) * 100;

    return { mspDiff, marketDiff };
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.product_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.origin_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.variety && batch.variety.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === "all" || batch.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading available batches...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by product, origin, variety..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Certified">Certified</SelectItem>
                  <SelectItem value="Under Inspection">Under Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => {
          const priceComp = batch.price ? getPriceComparison(batch.price) : null;

          return (
            <Card key={batch.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{batch.product_type}</CardTitle>
                    {batch.variety && (
                      <CardDescription>{batch.variety}</CardDescription>
                    )}
                  </div>
                  <Badge variant={batch.status === "Certified" ? "default" : "secondary"}>
                    {batch.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{batch.quantity} {batch.weight_unit}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {batch.origin_state ? `${batch.origin_state}, ` : ""}
                    {batch.origin_country}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(batch.harvest_date), "PP")}</span>
                </div>

                {/* Weather Information */}
                {batch.weather && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Latest Weather</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {batch.weather.temperature_celsius && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3 text-orange-500" />
                          <span>{batch.weather.temperature_celsius}°C</span>
                        </div>
                      )}
                      {batch.weather.humidity_percent && (
                        <div className="flex items-center gap-1">
                          <CloudRain className="h-3 w-3 text-blue-500" />
                          <span>{batch.weather.humidity_percent}% humidity</span>
                        </div>
                      )}
                      {batch.weather.conditions && (
                        <div className="col-span-2 text-muted-foreground capitalize">
                          {batch.weather.conditions}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {batch.price ? (
                  <>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Price per unit</span>
                        <span className="text-lg font-bold text-primary">
                          ₹{batch.price.price_per_unit.toFixed(2)}
                        </span>
                      </div>

                      {batch.price.discount_percentage > 0 && (
                        <Badge variant="secondary" className="w-full justify-center">
                          {batch.price.discount_percentage}% Discount
                        </Badge>
                      )}

                      {priceComp && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {batch.price.msp && (
                            <div className="flex items-center gap-1">
                              {priceComp.mspDiff > 0 ? (
                                <TrendingUp className="h-3 w-3 text-red-500" />
                              ) : priceComp.mspDiff < 0 ? (
                                <TrendingDown className="h-3 w-3 text-green-500" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              <span className="text-muted-foreground">vs MSP: </span>
                              <span className={priceComp.mspDiff > 0 ? "text-red-500" : "text-green-500"}>
                                {Math.abs(priceComp.mspDiff).toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {batch.price.market_rate && (
                            <div className="flex items-center gap-1">
                              {priceComp.marketDiff > 0 ? (
                                <TrendingUp className="h-3 w-3 text-red-500" />
                              ) : priceComp.marketDiff < 0 ? (
                                <TrendingDown className="h-3 w-3 text-green-500" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              <span className="text-muted-foreground">vs Market: </span>
                              <span className={priceComp.marketDiff > 0 ? "text-red-500" : "text-green-500"}>
                                {Math.abs(priceComp.marketDiff).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {batch.price.negotiable && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>Price negotiable</span>
                        </div>
                      )}
                    </div>

                    {user && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            onClick={() => {
                              setSelectedBatch(batch);
                              setInquiryForm({
                                inquiry_type: "price_inquiry",
                                quantity_requested: "",
                                message: ""
                              });
                            }}
                          >
                            Send Inquiry
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Inquiry</DialogTitle>
                            <DialogDescription>
                              Send an inquiry to the exporter about this batch
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Inquiry Type</Label>
                              <Select 
                                value={inquiryForm.inquiry_type}
                                onValueChange={(value) => setInquiryForm(prev => ({ ...prev, inquiry_type: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="price_inquiry">Price Inquiry</SelectItem>
                                  <SelectItem value="sample_request">Sample Request</SelectItem>
                                  <SelectItem value="bulk_order">Bulk Order</SelectItem>
                                  <SelectItem value="general">General Question</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Quantity Requested ({batch.weight_unit})</Label>
                              <Input
                                type="number"
                                placeholder="Enter quantity"
                                value={inquiryForm.quantity_requested}
                                onChange={(e) => setInquiryForm(prev => ({ ...prev, quantity_requested: e.target.value }))}
                              />
                              {batch.price?.minimum_order_quantity && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Minimum order: {batch.price.minimum_order_quantity} {batch.weight_unit}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label>Message</Label>
                              <Textarea
                                placeholder="Your message to the exporter..."
                                value={inquiryForm.message}
                                onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                                rows={4}
                              />
                            </div>

                            <Button 
                              onClick={handleSubmitInquiry} 
                              disabled={submitting}
                              className="w-full"
                            >
                              {submitting ? "Submitting..." : "Submit Inquiry"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                ) : (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Contact exporter for pricing
                    </p>
                    {user && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            className="w-full mt-2" 
                            onClick={() => {
                              setSelectedBatch(batch);
                              setInquiryForm({
                                inquiry_type: "price_inquiry",
                                quantity_requested: "",
                                message: ""
                              });
                            }}
                          >
                            Request Quote
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Price Quote</DialogTitle>
                            <DialogDescription>
                              Send a price inquiry to the exporter
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Inquiry Type</Label>
                              <Select 
                                value={inquiryForm.inquiry_type}
                                onValueChange={(value) => setInquiryForm(prev => ({ ...prev, inquiry_type: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="price_inquiry">Price Inquiry</SelectItem>
                                  <SelectItem value="sample_request">Sample Request</SelectItem>
                                  <SelectItem value="bulk_order">Bulk Order</SelectItem>
                                  <SelectItem value="general">General Question</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Quantity Requested ({batch.weight_unit})</Label>
                              <Input
                                type="number"
                                placeholder="Enter quantity"
                                value={inquiryForm.quantity_requested}
                                onChange={(e) => setInquiryForm(prev => ({ ...prev, quantity_requested: e.target.value }))}
                              />
                            </div>

                            <div>
                              <Label>Message</Label>
                              <Textarea
                                placeholder="Your message to the exporter..."
                                value={inquiryForm.message}
                                onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                                rows={4}
                              />
                            </div>

                            <Button 
                              onClick={handleSubmitInquiry} 
                              disabled={submitting}
                              className="w-full"
                            >
                              {submitting ? "Submitting..." : "Submit Inquiry"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBatches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No batches available at the moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

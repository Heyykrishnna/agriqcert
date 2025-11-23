import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface PriceData {
  id: string;
  batch_id: string;
  price_per_unit: number;
  currency: string;
  msp: number | null;
  market_rate: number | null;
  discount_percentage: number;
  batch: {
    product_type: string;
    variety: string | null;
    origin_country: string;
    quantity: number;
    weight_unit: string;
  };
}

export const MarketPriceComparison = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [productTypes, setProductTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("market_prices")
        .select(`
          *,
          batch:batch_id (
            product_type,
            variety,
            origin_country,
            quantity,
            weight_unit
          )
        `)
        .eq("availability_status", "available")
        .order("price_per_unit", { ascending: true });

      if (error) throw error;

      setPrices(data || []);

      // Extract unique product types
      const types = [...new Set(data?.map((p: any) => p.batch.product_type) || [])];
      setProductTypes(types);
    } catch (error) {
      console.error("Error fetching prices:", error);
      toast.error("Failed to load price data");
    } finally {
      setLoading(false);
    }
  };

  const getPriceTrend = (currentPrice: number, referencePrice: number | null) => {
    if (!referencePrice) return null;
    
    const diff = ((currentPrice - referencePrice) / referencePrice) * 100;
    
    if (diff > 5) return { icon: TrendingUp, color: "text-red-500", text: `+${diff.toFixed(1)}%` };
    if (diff < -5) return { icon: TrendingDown, color: "text-green-500", text: `${diff.toFixed(1)}%` };
    return { icon: Minus, color: "text-gray-500", text: `${diff.toFixed(1)}%` };
  };

  const filteredPrices = filterProduct === "all" 
    ? prices 
    : prices.filter(p => p.batch.product_type === filterProduct);

  // Calculate average, min, max for filtered data
  const stats = filteredPrices.reduce((acc, p) => {
    acc.total += p.price_per_unit;
    acc.min = Math.min(acc.min, p.price_per_unit);
    acc.max = Math.max(acc.max, p.price_per_unit);
    acc.count++;
    return acc;
  }, { total: 0, min: Infinity, max: 0, count: 0 });

  const avgPrice = stats.count > 0 ? stats.total / stats.count : 0;
  
  // Default currency to INR
  const defaultCurrency = "INR";

  if (loading) {
    return <div className="text-center py-8">Loading price comparison...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{avgPrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Lowest Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.min !== Infinity ? stats.min.toFixed(2) : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Highest Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{stats.max > 0 ? stats.max.toFixed(2) : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price Comparison Table</CardTitle>
              <CardDescription>Compare prices across different batches and suppliers</CardDescription>
            </div>
            <div className="w-64">
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {productTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">MSP</TableHead>
                  <TableHead className="text-right">Market Rate</TableHead>
                  <TableHead className="text-right">vs MSP</TableHead>
                  <TableHead className="text-right">vs Market</TableHead>
                  <TableHead>Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrices.map((price) => {
                  const mspTrend = getPriceTrend(price.price_per_unit, price.msp);
                  const marketTrend = getPriceTrend(price.price_per_unit, price.market_rate);

                  return (
                    <TableRow key={price.id}>
                      <TableCell className="font-medium">
                        {price.batch.product_type}
                        {price.batch.variety && (
                          <div className="text-xs text-muted-foreground">{price.batch.variety}</div>
                        )}
                      </TableCell>
                      <TableCell>{price.batch.origin_country}</TableCell>
                      <TableCell>
                        {price.batch.quantity} {price.batch.weight_unit}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{price.price_per_unit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {price.msp ? `₹${price.msp.toFixed(2)}` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {price.market_rate ? `₹${price.market_rate.toFixed(2)}` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {mspTrend ? (
                          <div className={`flex items-center justify-end gap-1 ${mspTrend.color}`}>
                            <mspTrend.icon className="h-4 w-4" />
                            <span>{mspTrend.text}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {marketTrend ? (
                          <div className={`flex items-center justify-end gap-1 ${marketTrend.color}`}>
                            <marketTrend.icon className="h-4 w-4" />
                            <span>{marketTrend.text}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {price.discount_percentage > 0 ? (
                          <Badge variant="secondary">
                            {price.discount_percentage}% OFF
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredPrices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No price data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

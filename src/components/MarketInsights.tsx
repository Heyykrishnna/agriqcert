import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface MarketData {
  product_type: string;
  region: string;
  average_price: number | null;
  min_price: number | null;
  max_price: number | null;
  total_volume: number | null;
  demand_trend: string | null;
  recorded_date: string;
}

export const MarketInsights = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [productTypes, setProductTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("market_analytics")
        .select("*")
        .order("recorded_date", { ascending: false })
        .limit(30);

      if (error) throw error;

      setMarketData(data || []);

      // Extract unique product types
      const types = [...new Set(data?.map(d => d.product_type) || [])];
      setProductTypes(types);
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast.error("Failed to load market insights");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = selectedProduct === "all"
    ? marketData
    : marketData.filter(d => d.product_type === selectedProduct);

  // Prepare chart data
  const chartData = filteredData
    .sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime())
    .map(d => ({
      date: new Date(d.recorded_date).toLocaleDateString(),
      avgPrice: d.average_price,
      volume: d.total_volume,
      minPrice: d.min_price,
      maxPrice: d.max_price
    }));

  // Calculate trend
  const latestData = filteredData[0];
  const previousData = filteredData[1];
  const priceTrend = latestData && previousData && latestData.average_price && previousData.average_price
    ? ((latestData.average_price - previousData.average_price) / previousData.average_price) * 100
    : null;

  if (loading) {
    return <div className="text-center py-8">Loading market insights...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>Track price trends and market demand</CardDescription>
            </div>
            <div className="w-64">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
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
      </Card>

      {/* Summary Cards */}
      {latestData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Current Avg Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${latestData.average_price?.toFixed(2) || "N/A"}
              </div>
              {priceTrend !== null && (
                <div className={`flex items-center gap-1 text-sm mt-1 ${priceTrend > 0 ? "text-red-500" : "text-green-500"}`}>
                  {priceTrend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(priceTrend).toFixed(1)}% from last period</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                ${latestData.min_price?.toFixed(2)} - ${latestData.max_price?.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Min - Max</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestData.total_volume?.toLocaleString() || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Units available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Demand Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold capitalize">
                {latestData.demand_trend || "Stable"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Market sentiment</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Price Trend</CardTitle>
            <CardDescription>Historical price movements</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgPrice" 
                  stroke="hsl(var(--primary))" 
                  name="Average Price"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="minPrice" 
                  stroke="hsl(var(--secondary))" 
                  name="Min Price"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="maxPrice" 
                  stroke="hsl(var(--accent))" 
                  name="Max Price"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Volume Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Market Volume</CardTitle>
            <CardDescription>Available supply over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="volume" 
                  fill="hsl(var(--primary))" 
                  name="Total Volume"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {chartData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No market analytics data available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

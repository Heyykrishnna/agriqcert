import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Cloud, Droplets, Wind, Thermometer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AutoWeatherFetch } from "./AutoWeatherFetch";

interface WeatherData {
  id: string;
  recorded_date: string;
  temperature_celsius: number | null;
  humidity_percent: number | null;
  rainfall_mm: number | null;
  wind_speed_kmh: number | null;
  conditions: string | null;
  data_source: string;
}

interface WeatherTrackingProps {
  batchId: string;
  isEditable?: boolean;
  batchLatitude?: number | null;
  batchLongitude?: number | null;
}

export const WeatherTracking = ({ batchId, isEditable = false, batchLatitude = null, batchLongitude = null }: WeatherTrackingProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    recorded_date: "",
    temperature_celsius: "",
    humidity_percent: "",
    rainfall_mm: "",
    wind_speed_kmh: "",
    conditions: "",
  });

  const fetchWeatherData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("weather_data")
      .select("*")
      .eq("batch_id", batchId)
      .order("recorded_date", { ascending: false });

    if (error) {
      toast.error("Failed to load weather data");
      console.error(error);
    } else {
      setWeatherData(data || []);
    }
    setLoading(false);
  };

  useState(() => {
    fetchWeatherData();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("weather_data").insert({
      batch_id: batchId,
      recorded_date: formData.recorded_date,
      temperature_celsius: formData.temperature_celsius ? parseFloat(formData.temperature_celsius) : null,
      humidity_percent: formData.humidity_percent ? parseFloat(formData.humidity_percent) : null,
      rainfall_mm: formData.rainfall_mm ? parseFloat(formData.rainfall_mm) : null,
      wind_speed_kmh: formData.wind_speed_kmh ? parseFloat(formData.wind_speed_kmh) : null,
      conditions: formData.conditions || null,
      data_source: "manual",
    });

    if (error) {
      toast.error("Failed to add weather data");
      console.error(error);
    } else {
      toast.success("Weather data added successfully");
      setShowForm(false);
      setFormData({
        recorded_date: "",
        temperature_celsius: "",
        humidity_percent: "",
        rainfall_mm: "",
        wind_speed_kmh: "",
        conditions: "",
      });
      fetchWeatherData();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this weather record?")) return;

    const { error } = await supabase.from("weather_data").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete weather data");
      console.error(error);
    } else {
      toast.success("Weather data deleted");
      fetchWeatherData();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Weather & Climate Data
            </CardTitle>
            <CardDescription>Track environmental conditions during harvest and storage</CardDescription>
          </div>
          {isEditable && (
            <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditable && (
          <div className="mb-4">
            <AutoWeatherFetch 
              batchId={batchId} 
              latitude={batchLatitude} 
              longitude={batchLongitude}
              onWeatherFetched={fetchWeatherData}
            />
          </div>
        )}

        {showForm && isEditable && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recorded_date">Date *</Label>
                <Input
                  id="recorded_date"
                  type="date"
                  required
                  value={formData.recorded_date}
                  onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="conditions">Weather Conditions</Label>
                <Select
                  value={formData.conditions}
                  onValueChange={(value) => setFormData({ ...formData, conditions: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="stormy">Stormy</SelectItem>
                    <SelectItem value="windy">Windy</SelectItem>
                    <SelectItem value="foggy">Foggy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="temperature_celsius">Temperature (°C)</Label>
                <Input
                  id="temperature_celsius"
                  type="number"
                  step="0.1"
                  value={formData.temperature_celsius}
                  onChange={(e) => setFormData({ ...formData, temperature_celsius: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="humidity_percent">Humidity (%)</Label>
                <Input
                  id="humidity_percent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.humidity_percent}
                  onChange={(e) => setFormData({ ...formData, humidity_percent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="rainfall_mm">Rainfall (mm)</Label>
                <Input
                  id="rainfall_mm"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.rainfall_mm}
                  onChange={(e) => setFormData({ ...formData, rainfall_mm: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="wind_speed_kmh">Wind Speed (km/h)</Label>
                <Input
                  id="wind_speed_kmh"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.wind_speed_kmh}
                  onChange={(e) => setFormData({ ...formData, wind_speed_kmh: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Record"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {loading && weatherData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Loading weather data...</p>
          ) : weatherData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No weather data recorded yet</p>
          ) : (
            weatherData.map((data) => (
              <div key={data.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">
                        {new Date(data.recorded_date).toLocaleDateString()}
                      </p>
                      {data.conditions && (
                        <Badge variant="outline">{data.conditions}</Badge>
                      )}
                    </div>
                  </div>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(data.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.temperature_celsius !== null && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{data.temperature_celsius}°C</span>
                    </div>
                  )}
                  {data.humidity_percent !== null && (
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{data.humidity_percent}%</span>
                    </div>
                  )}
                  {data.rainfall_mm !== null && (
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{data.rainfall_mm} mm</span>
                    </div>
                  )}
                  {data.wind_speed_kmh !== null && (
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{data.wind_speed_kmh} km/h</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

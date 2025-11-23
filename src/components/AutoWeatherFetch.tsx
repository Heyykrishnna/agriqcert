import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Cloud, Loader2 } from "lucide-react";

interface AutoWeatherFetchProps {
  batchId: string;
  latitude: number | null;
  longitude: number | null;
  onWeatherFetched?: () => void;
}

export const AutoWeatherFetch = ({ batchId, latitude, longitude, onWeatherFetched }: AutoWeatherFetchProps) => {
  const [loading, setLoading] = useState(false);

  const fetchWeatherData = async () => {
    if (!latitude || !longitude) {
      toast.error("Batch location coordinates are required to fetch weather data");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-weather", {
        body: { latitude, longitude, batchId },
      });

      if (error) {
        console.error("Error fetching weather:", error);
        toast.error("Failed to fetch weather data");
        return;
      }

      if (data?.success) {
        toast.success("Weather data fetched and saved successfully!");
        onWeatherFetched?.();
      } else {
        toast.error(data?.error || "Failed to fetch weather data");
      }
    } catch (error: any) {
      console.error("Weather fetch error:", error);
      toast.error("An error occurred while fetching weather data");
    } finally {
      setLoading(false);
    }
  };

  if (!latitude || !longitude) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50">
        <p>Add batch location coordinates to enable automated weather tracking</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={fetchWeatherData}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching Weather...
          </>
        ) : (
          <>
            <Cloud className="h-4 w-4" />
            Fetch Current Weather
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </p>
    </div>
  );
};

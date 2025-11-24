import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, batchId } = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const VISUAL_CROSSING_API_KEY = Deno.env.get("VISUAL_CROSSING_API_KEY");
    
    if (!VISUAL_CROSSING_API_KEY) {
      console.error("Visual Crossing API key not configured");
      return new Response(
        JSON.stringify({ error: "Weather service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current weather data from Visual Crossing
    const weatherUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?key=${VISUAL_CROSSING_API_KEY}&unitGroup=metric&include=current&contentType=json`;
    
    console.log("Fetching weather data for coordinates:", { latitude, longitude });
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error("Visual Crossing API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch weather data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const weatherData = await weatherResponse.json();
    
    console.log("Weather data received:", weatherData);

    // Extract relevant weather information from Visual Crossing response
    const currentConditions = weatherData.currentConditions;
    const weatherRecord = {
      temperature_celsius: currentConditions?.temp || null,
      humidity_percent: currentConditions?.humidity || null,
      rainfall_mm: currentConditions?.precip || 0,
      wind_speed_kmh: currentConditions?.windspeed || null,
      conditions: currentConditions?.conditions || null,
      location_lat: latitude,
      location_lon: longitude,
      data_source: "visualcrossing",
    };

    // If batchId is provided, save the weather data to the database
    if (batchId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: insertError } = await supabase
        .from("weather_data")
        .insert({
          batch_id: batchId,
          recorded_date: new Date().toISOString().split('T')[0],
          ...weatherRecord,
        });

      if (insertError) {
        console.error("Error saving weather data:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save weather data", details: insertError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Weather data saved successfully for batch:", batchId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: weatherRecord,
        saved: !!batchId 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in fetch-weather function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
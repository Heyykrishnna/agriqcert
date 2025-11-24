import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, ClipboardCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Batch {
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
  created_at: string;
  exporter_id: string;
}

export const BatchInspectionQueue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('qa-inspection-queue')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'batches'
        },
        () => {
          fetchBatches();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'batches'
        },
        () => {
          fetchBatches();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'batches'
        },
        () => {
          fetchBatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);

      // Fetch batches that are submitted and waiting for inspection
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("status", "Submitted")
        .order("created_at", { ascending: true }); // Oldest first

      if (error) throw error;

      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast.error("Failed to load inspection queue");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimInspection = async (batchId: string, exporterId: string) => {
    if (!user) return;

    try {
      setClaiming(batchId);

      // Create an inspection record
      const { data: inspection, error: inspectionError } = await supabase
        .from("inspections")
        .insert({
          batch_id: batchId,
          qa_agency_id: user.id,
          exporter_id: exporterId,
          status: "Pending",
          scheduled_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // Update batch status to Under Inspection
      const { error: updateError } = await supabase
        .from("batches")
        .update({ status: "Under Inspection" })
        .eq("id", batchId);

      if (updateError) throw updateError;

      toast.success("Inspection claimed successfully!");
      fetchBatches();
      
      // Navigate to the inspection form
      navigate(`/batch/${batchId}`);
    } catch (error) {
      console.error("Error claiming inspection:", error);
      toast.error("Failed to claim inspection");
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No batches waiting for inspection at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Inspection Queue</h3>
          <p className="text-sm text-muted-foreground">
            {batches.length} batch{batches.length !== 1 ? 'es' : ''} waiting for inspection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => (
          <Card key={batch.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{batch.product_type}</CardTitle>
                  {batch.variety && (
                    <CardDescription>{batch.variety}</CardDescription>
                  )}
                </div>
                <Badge variant="outline">{batch.status}</Badge>
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
                <span>Harvest: {format(new Date(batch.harvest_date), "PP")}</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono font-semibold text-primary">
                  {batch.tracking_token}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                Submitted {format(new Date(batch.created_at), "PPp")}
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleClaimInspection(batch.id, batch.exporter_id)}
                disabled={claiming === batch.id}
              >
                {claiming === batch.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Claim for Inspection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BatchInspectionQueue;
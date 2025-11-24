import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, MapPin, Calendar, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BatchEditDialog } from "./BatchEditDialog";

import { format } from "date-fns";

interface Batch {
  id: string;
  product_type: string;
  variety: string | null;
  quantity: number;
  weight_unit: string;
  status: string;
  origin_country: string;
  origin_state: string | null;
  origin_address: string | null;
  destination_country: string;
  harvest_date: string;
  packaging_type: string | null;
  expected_ship_date: string | null;
  created_at: string;
  tracking_token: string;
}

export const BatchList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, [user]);

  const fetchBatches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("exporter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from("batches")
        .delete()
        .eq("id", batchId);

      if (error) throw error;
      
      toast.success("Batch deleted successfully");
      fetchBatches();
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch");
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Certified":
        return "default";
      case "In Progress":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
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
            No batches submitted yet. Submit your first batch to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {batches.map((batch) => (
        <Card key={batch.id} className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <CardTitle className="text-lg">{batch.product_type}</CardTitle>
              </div>
              <Badge variant={getStatusColor(batch.status)}>{batch.status}</Badge>
            </div>
            {batch.variety && (
              <p className="text-sm text-muted-foreground">{batch.variety}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {batch.origin_country} → {batch.destination_country}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Quantity: </span>
                {batch.quantity} {batch.weight_unit}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Harvest: {format(new Date(batch.harvest_date), "PP")}
                </span>
              </div>
              {batch.expected_ship_date && (
                <div>
                  <span className="text-muted-foreground">Ship: </span>
                  {format(new Date(batch.expected_ship_date), "PP")}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono font-semibold text-primary">
                {batch.tracking_token}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Submitted {format(new Date(batch.created_at), "PPP")}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/batch/${batch.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <BatchEditDialog batch={batch} onSuccess={fetchBatches} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this batch? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(batch.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

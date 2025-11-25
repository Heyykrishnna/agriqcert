import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Calendar, MapPin, Package, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { InspectorSelector } from "./InspectorSelector";

interface Batch {
  id: string;
  product_type: string;
  quantity: number;
  weight_unit: string;
  origin_country: string;
  origin_state: string | null;
  origin_address: string | null;
  destination_country: string;
  variety: string | null;
  packaging_type: string | null;
  harvest_date: string;
  expected_ship_date: string | null;
  status: string;
  tracking_token: string;
  created_at: string;
  exporter_id: string;
  profiles: {
    organization_name: string | null;
    email: string;
  } | null;
}

export const BatchInspectionQueue = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [inspectionType, setInspectionType] = useState<"physical" | "virtual">("physical");
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedInspector, setSelectedInspector] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();

    const channel = supabase
      .channel('batch-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
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
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          profiles:exporter_id (
            organization_name,
            email
          )
        `)
        .eq("status", "Submitted")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast.error("Failed to load inspection queue");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimInspection = (batch: Batch) => {
    setSelectedBatch(batch);
    setSchedulingOpen(true);
  };

  const handleScheduleInspection = async () => {
    if (!selectedBatch || !scheduledDate) {
      toast.error("Please select a date for the inspection");
      return;
    }

    setClaiming(selectedBatch.id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to claim inspections");
        return;
      }

      const { error: inspectionError } = await supabase
        .from("inspections")
        .insert({
          batch_id: selectedBatch.id,
          qa_agency_id: user.id,
          inspector_id: selectedInspector && selectedInspector !== "unassigned" ? selectedInspector : null,
          status: "Pending",
          scheduled_date: scheduledDate,
          comments: `${inspectionType === "physical" ? "Physical" : "Virtual"} inspection scheduled`,
        });

      if (inspectionError) throw inspectionError;

      const { error: updateError } = await supabase
        .from("batches")
        .update({ status: "Under Inspection" })
        .eq("id", selectedBatch.id);

      if (updateError) throw updateError;

      toast.success(`${inspectionType === "physical" ? "Physical" : "Virtual"} inspection scheduled successfully`);
      setSchedulingOpen(false);
      setSelectedBatch(null);
      setScheduledDate("");
      setInspectionType("physical");
      setSelectedInspector("");
      fetchBatches();
    } catch (error) {
      console.error("Error claiming inspection:", error);
      toast.error("Failed to schedule inspection");
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
        <CardHeader>
          <CardTitle>Inspection Requests</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No inspection requests at the moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Inspection Requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              {batches.length} pending inspection request{batches.length !== 1 ? 's' : ''}
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{batch.product_type}</CardTitle>
                    {batch.variety && (
                      <p className="text-sm text-muted-foreground">{batch.variety}</p>
                    )}
                  </div>
                  <Badge variant="outline">New Request</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Exporter Info */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{batch.profiles?.organization_name || "Unknown Exporter"}</p>
                    <p className="text-xs text-muted-foreground">{batch.profiles?.email}</p>
                  </div>
                </div>

                {/* Location Info */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{batch.origin_country}</p>
                    {batch.origin_state && <p className="text-xs text-muted-foreground">{batch.origin_state}</p>}
                    {batch.origin_address && <p className="text-xs text-muted-foreground">{batch.origin_address}</p>}
                  </div>
                </div>

                {/* Batch Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {batch.quantity} {batch.weight_unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Packaging</p>
                    <p className="font-medium">{batch.packaging_type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harvest Date</p>
                    <p className="font-medium">
                      {new Date(batch.harvest_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ship Date</p>
                    <p className="font-medium">
                      {batch.expected_ship_date ? new Date(batch.expected_ship_date).toLocaleDateString() : "TBD"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Destination</p>
                    <p className="font-medium">{batch.destination_country}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Tracking Token</p>
                    <p className="font-medium font-mono text-xs">{batch.tracking_token}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Requested On</p>
                    <p className="font-medium text-xs">
                      {new Date(batch.created_at).toLocaleDateString()} at {new Date(batch.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => handleClaimInspection(batch)}
                  disabled={claiming === batch.id}
                >
                  {claiming === batch.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Inspection
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Scheduling Dialog */}
      <Dialog open={schedulingOpen} onOpenChange={setSchedulingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Inspection</DialogTitle>
            <DialogDescription>
              Schedule an inspection for {selectedBatch?.product_type} batch
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Inspection Type</Label>
              <RadioGroup value={inspectionType} onValueChange={(value) => setInspectionType(value as "physical" | "virtual")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="physical" id="physical" />
                  <Label htmlFor="physical" className="font-normal cursor-pointer">
                    Physical Inspection (On-site)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="virtual" id="virtual" />
                  <Label htmlFor="virtual" className="font-normal cursor-pointer">
                    Virtual Inspection (Remote)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Scheduled Date & Time</Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <InspectorSelector 
              value={selectedInspector} 
              onChange={setSelectedInspector}
            />

            {selectedBatch && (
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <p><strong>Batch:</strong> {selectedBatch.tracking_token}</p>
                <p><strong>Product:</strong> {selectedBatch.product_type}</p>
                <p><strong>Exporter:</strong> {selectedBatch.profiles?.organization_name}</p>
                <p><strong>Location:</strong> {selectedBatch.origin_country}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedulingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleInspection} disabled={!scheduledDate || claiming !== null}>
              {claiming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Confirm Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BatchInspectionQueue;
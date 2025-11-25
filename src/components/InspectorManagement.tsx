import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPlus, Users, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Inspector {
  id: string;
  email: string;
  full_name: string | null;
  organization_name: string | null;
  phone: string | null;
  available: boolean;
  active_inspections: number;
}

export const InspectorManagement = () => {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingInspector, setAddingInspector] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  useEffect(() => {
    fetchInspectors();
  }, []);

  const fetchInspectors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all inspectors assigned to inspections by this QA agency
      const { data: inspections, error: inspError } = await supabase
        .from("inspections")
        .select(`
          inspector_id,
          status,
          profiles:inspector_id (
            id,
            email,
            full_name,
            organization_name,
            phone
          )
        `)
        .eq("qa_agency_id", user.id)
        .not("inspector_id", "is", null);

      if (inspError) throw inspError;

      // Process unique inspectors and count active inspections
      const inspectorMap = new Map<string, Inspector>();
      
      inspections?.forEach((inspection) => {
        if (inspection.profiles) {
          const profile = inspection.profiles as any;
          const inspectorId = profile.id;
          
          if (!inspectorMap.has(inspectorId)) {
            inspectorMap.set(inspectorId, {
              id: inspectorId,
              email: profile.email,
              full_name: profile.full_name,
              organization_name: profile.organization_name,
              phone: profile.phone,
              available: true,
              active_inspections: 0,
            });
          }

          // Count active inspections
          if (inspection.status === "Pending" || inspection.status === "In Progress") {
            const inspector = inspectorMap.get(inspectorId)!;
            inspector.active_inspections += 1;
          }
        }
      });

      setInspectors(Array.from(inspectorMap.values()));
    } catch (error) {
      console.error("Error fetching inspectors:", error);
      toast.error("Failed to load inspectors");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteInspector = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error("Please provide both email and name");
      return;
    }

    setAddingInspector(true);
    try {
      // In a real app, this would send an invitation email
      // For now, we'll just show a success message
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteName("");
    } catch (error) {
      console.error("Error inviting inspector:", error);
      toast.error("Failed to send invitation");
    } finally {
      setAddingInspector(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inspector Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your team of inspectors and track their availability
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Inspector
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Inspector</DialogTitle>
              <DialogDescription>
                Send an invitation to a new inspector to join your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="inspector@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleInviteInspector} disabled={addingInspector}>
                {addingInspector ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {inspectors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No inspectors yet. Invite your first inspector to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inspectors.map((inspector) => (
            <Card key={inspector.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {inspector.full_name || "Unnamed Inspector"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{inspector.email}</p>
                  </div>
                  {inspector.available ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <XCircle className="mr-1 h-3 w-3" />
                      Busy
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {inspector.organization_name && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Organization: </span>
                    <span className="font-medium">{inspector.organization_name}</span>
                  </div>
                )}
                {inspector.phone && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-medium">{inspector.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Active Inspections: </span>
                    <span className="font-bold text-lg">{inspector.active_inspections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
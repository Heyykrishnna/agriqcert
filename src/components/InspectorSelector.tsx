import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Inspector {
  id: string;
  email: string;
  full_name: string | null;
  active_inspections: number;
}

interface InspectorSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const InspectorSelector = ({ value, onChange }: InspectorSelectorProps) => {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspectors();
  }, []);

  const fetchInspectors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all inspectors who have worked with this QA agency
      const { data: inspections, error } = await supabase
        .from("inspections")
        .select(`
          inspector_id,
          status,
          profiles:inspector_id (
            id,
            email,
            full_name
          )
        `)
        .eq("qa_agency_id", user.id)
        .not("inspector_id", "is", null);

      if (error) throw error;

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading inspectors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Assign Inspector (Optional)</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an inspector..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {inspectors.map((inspector) => (
            <SelectItem key={inspector.id} value={inspector.id}>
              <div className="flex items-center justify-between gap-2 w-full">
                <span>{inspector.full_name || inspector.email}</span>
                {inspector.active_inspections > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {inspector.active_inspections} active
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {inspectors.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No inspectors available. Inspectors will appear here after their first assignment.
        </p>
      )}
    </div>
  );
};
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Practice {
  id: string;
  practice_type: string;
  practice_name: string;
  description: string | null;
  implementation_date: string | null;
  impact_metrics: any;
}

interface SustainablePracticesProps {
  batchId: string;
  isEditable?: boolean;
}

export const SustainablePractices = ({ batchId, isEditable = false }: SustainablePracticesProps) => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    practice_type: "",
    practice_name: "",
    description: "",
    implementation_date: "",
  });

  const fetchPractices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sustainable_practices")
      .select("*")
      .eq("batch_id", batchId)
      .order("implementation_date", { ascending: false });

    if (error) {
      toast.error("Failed to load practices");
      console.error(error);
    } else {
      setPractices(data || []);
    }
    setLoading(false);
  };

  useState(() => {
    fetchPractices();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("sustainable_practices").insert({
      batch_id: batchId,
      practice_type: formData.practice_type,
      practice_name: formData.practice_name,
      description: formData.description || null,
      implementation_date: formData.implementation_date || null,
    });

    if (error) {
      toast.error("Failed to add practice");
      console.error(error);
    } else {
      toast.success("Practice added successfully");
      setShowForm(false);
      setFormData({
        practice_type: "",
        practice_name: "",
        description: "",
        implementation_date: "",
      });
      fetchPractices();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this practice?")) return;

    const { error } = await supabase.from("sustainable_practices").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete practice");
      console.error(error);
    } else {
      toast.success("Practice deleted");
      fetchPractices();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Sustainable Farming Practices
            </CardTitle>
            <CardDescription>Environmental and sustainable practices implemented</CardDescription>
          </div>
          {isEditable && (
            <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Practice
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && isEditable && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="practice_type">Practice Type *</Label>
                <Select
                  value={formData.practice_type}
                  onValueChange={(value) => setFormData({ ...formData, practice_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water_conservation">Water Conservation</SelectItem>
                    <SelectItem value="crop_rotation">Crop Rotation</SelectItem>
                    <SelectItem value="integrated_pest">Integrated Pest Management</SelectItem>
                    <SelectItem value="composting">Composting</SelectItem>
                    <SelectItem value="cover_crops">Cover Crops</SelectItem>
                    <SelectItem value="no_till">No-Till Farming</SelectItem>
                    <SelectItem value="renewable_energy">Renewable Energy</SelectItem>
                    <SelectItem value="biodiversity">Biodiversity Conservation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="practice_name">Practice Name *</Label>
                <Input
                  id="practice_name"
                  required
                  value={formData.practice_name}
                  onChange={(e) => setFormData({ ...formData, practice_name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Describe how this practice is implemented..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="implementation_date">Implementation Date</Label>
                <Input
                  id="implementation_date"
                  type="date"
                  value={formData.implementation_date}
                  onChange={(e) => setFormData({ ...formData, implementation_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Practice"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {loading && practices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Loading practices...</p>
          ) : practices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No sustainable practices recorded yet</p>
          ) : (
            practices.map((practice) => (
              <div key={practice.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{practice.practice_name}</h4>
                      <Badge variant="secondary">
                        {practice.practice_type.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    {practice.implementation_date && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Since: {new Date(practice.implementation_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(practice.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {practice.description && (
                  <p className="text-sm text-muted-foreground border-t pt-2">
                    {practice.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

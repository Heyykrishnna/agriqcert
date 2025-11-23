import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Beaker } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SoilTest {
  id: string;
  test_date: string;
  ph_level: number | null;
  nitrogen_ppm: number | null;
  phosphorus_ppm: number | null;
  potassium_ppm: number | null;
  organic_matter_percent: number | null;
  moisture_percent: number | null;
  salinity_ds_m: number | null;
  texture: string | null;
  notes: string | null;
  lab_name: string | null;
}

interface SoilAnalyticsProps {
  batchId: string;
  isEditable?: boolean;
}

export const SoilAnalytics = ({ batchId, isEditable = false }: SoilAnalyticsProps) => {
  const [soilTests, setSoilTests] = useState<SoilTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    test_date: "",
    ph_level: "",
    nitrogen_ppm: "",
    phosphorus_ppm: "",
    potassium_ppm: "",
    organic_matter_percent: "",
    moisture_percent: "",
    salinity_ds_m: "",
    texture: "",
    notes: "",
    lab_name: "",
  });

  const fetchSoilTests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("soil_tests")
      .select("*")
      .eq("batch_id", batchId)
      .order("test_date", { ascending: false });

    if (error) {
      toast.error("Failed to load soil tests");
      console.error(error);
    } else {
      setSoilTests(data || []);
    }
    setLoading(false);
  };

  useState(() => {
    fetchSoilTests();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("soil_tests").insert({
      batch_id: batchId,
      test_date: formData.test_date,
      ph_level: formData.ph_level ? parseFloat(formData.ph_level) : null,
      nitrogen_ppm: formData.nitrogen_ppm ? parseFloat(formData.nitrogen_ppm) : null,
      phosphorus_ppm: formData.phosphorus_ppm ? parseFloat(formData.phosphorus_ppm) : null,
      potassium_ppm: formData.potassium_ppm ? parseFloat(formData.potassium_ppm) : null,
      organic_matter_percent: formData.organic_matter_percent ? parseFloat(formData.organic_matter_percent) : null,
      moisture_percent: formData.moisture_percent ? parseFloat(formData.moisture_percent) : null,
      salinity_ds_m: formData.salinity_ds_m ? parseFloat(formData.salinity_ds_m) : null,
      texture: formData.texture || null,
      notes: formData.notes || null,
      lab_name: formData.lab_name || null,
    });

    if (error) {
      toast.error("Failed to add soil test");
      console.error(error);
    } else {
      toast.success("Soil test added successfully");
      setShowForm(false);
      setFormData({
        test_date: "",
        ph_level: "",
        nitrogen_ppm: "",
        phosphorus_ppm: "",
        potassium_ppm: "",
        organic_matter_percent: "",
        moisture_percent: "",
        salinity_ds_m: "",
        texture: "",
        notes: "",
        lab_name: "",
      });
      fetchSoilTests();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this soil test?")) return;

    const { error } = await supabase.from("soil_tests").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete soil test");
      console.error(error);
    } else {
      toast.success("Soil test deleted");
      fetchSoilTests();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Soil Analysis
            </CardTitle>
            <CardDescription>Track soil test results and quality metrics</CardDescription>
          </div>
          {isEditable && (
            <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && isEditable && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test_date">Test Date *</Label>
                <Input
                  id="test_date"
                  type="date"
                  required
                  value={formData.test_date}
                  onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lab_name">Laboratory Name</Label>
                <Input
                  id="lab_name"
                  value={formData.lab_name}
                  onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ph_level">pH Level</Label>
                <Input
                  id="ph_level"
                  type="number"
                  step="0.1"
                  value={formData.ph_level}
                  onChange={(e) => setFormData({ ...formData, ph_level: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nitrogen_ppm">Nitrogen (ppm)</Label>
                <Input
                  id="nitrogen_ppm"
                  type="number"
                  step="0.01"
                  value={formData.nitrogen_ppm}
                  onChange={(e) => setFormData({ ...formData, nitrogen_ppm: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phosphorus_ppm">Phosphorus (ppm)</Label>
                <Input
                  id="phosphorus_ppm"
                  type="number"
                  step="0.01"
                  value={formData.phosphorus_ppm}
                  onChange={(e) => setFormData({ ...formData, phosphorus_ppm: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="potassium_ppm">Potassium (ppm)</Label>
                <Input
                  id="potassium_ppm"
                  type="number"
                  step="0.01"
                  value={formData.potassium_ppm}
                  onChange={(e) => setFormData({ ...formData, potassium_ppm: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="organic_matter_percent">Organic Matter (%)</Label>
                <Input
                  id="organic_matter_percent"
                  type="number"
                  step="0.01"
                  value={formData.organic_matter_percent}
                  onChange={(e) => setFormData({ ...formData, organic_matter_percent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="moisture_percent">Moisture (%)</Label>
                <Input
                  id="moisture_percent"
                  type="number"
                  step="0.01"
                  value={formData.moisture_percent}
                  onChange={(e) => setFormData({ ...formData, moisture_percent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="salinity_ds_m">Salinity (dS/m)</Label>
                <Input
                  id="salinity_ds_m"
                  type="number"
                  step="0.01"
                  value={formData.salinity_ds_m}
                  onChange={(e) => setFormData({ ...formData, salinity_ds_m: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="texture">Soil Texture</Label>
                <Input
                  id="texture"
                  placeholder="e.g., Sandy loam, Clay"
                  value={formData.texture}
                  onChange={(e) => setFormData({ ...formData, texture: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Test"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {loading && soilTests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Loading soil tests...</p>
          ) : soilTests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No soil tests recorded yet</p>
          ) : (
            soilTests.map((test) => (
              <div key={test.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      Test Date: {new Date(test.test_date).toLocaleDateString()}
                    </p>
                    {test.lab_name && (
                      <p className="text-sm text-muted-foreground">Lab: {test.lab_name}</p>
                    )}
                  </div>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(test.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {test.ph_level && (
                    <Badge variant="outline">pH: {test.ph_level}</Badge>
                  )}
                  {test.nitrogen_ppm && (
                    <Badge variant="outline">N: {test.nitrogen_ppm} ppm</Badge>
                  )}
                  {test.phosphorus_ppm && (
                    <Badge variant="outline">P: {test.phosphorus_ppm} ppm</Badge>
                  )}
                  {test.potassium_ppm && (
                    <Badge variant="outline">K: {test.potassium_ppm} ppm</Badge>
                  )}
                  {test.organic_matter_percent && (
                    <Badge variant="outline">OM: {test.organic_matter_percent}%</Badge>
                  )}
                  {test.moisture_percent && (
                    <Badge variant="outline">Moisture: {test.moisture_percent}%</Badge>
                  )}
                  {test.texture && (
                    <Badge variant="outline">{test.texture}</Badge>
                  )}
                </div>
                {test.notes && (
                  <p className="text-sm text-muted-foreground">{test.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

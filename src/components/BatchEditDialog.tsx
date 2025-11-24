import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";
import { Edit } from "lucide-react";

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
  expected_ship_date: string | null;
  packaging_type: string | null;
}

interface BatchEditDialogProps {
  batch: Batch;
  onSuccess: () => void;
}

const batchEditSchema = z.object({
  product_type: z.string().trim().min(1, "Product type is required").max(100),
  variety: z.string().trim().max(100).optional(),
  quantity: z.number().positive("Quantity must be greater than 0").max(1000000),
  weight_unit: z.enum(["kg", "tons", "lbs", "quintals"]),
  origin_country: z.string().trim().min(1, "Origin country is required").max(100),
  origin_state: z.string().trim().max(100).optional(),
  origin_address: z.string().trim().max(500).optional(),
  destination_country: z.string().trim().min(1, "Destination country is required").max(100),
  harvest_date: z.string().min(1, "Harvest date is required"),
  expected_ship_date: z.string().optional(),
  packaging_type: z.string().trim().max(50).optional(),
});

export const BatchEditDialog = ({ batch, onSuccess }: BatchEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_type: batch.product_type,
    variety: batch.variety || "",
    quantity: batch.quantity.toString(),
    weight_unit: batch.weight_unit,
    origin_country: batch.origin_country,
    origin_state: batch.origin_state || "",
    origin_address: batch.origin_address || "",
    destination_country: batch.destination_country,
    harvest_date: batch.harvest_date,
    expected_ship_date: batch.expected_ship_date || "",
    packaging_type: batch.packaging_type || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      const validatedData = batchEditSchema.parse({
        product_type: formData.product_type,
        variety: formData.variety || undefined,
        quantity: parseFloat(formData.quantity),
        weight_unit: formData.weight_unit,
        origin_country: formData.origin_country,
        origin_state: formData.origin_state || undefined,
        origin_address: formData.origin_address || undefined,
        destination_country: formData.destination_country,
        harvest_date: formData.harvest_date,
        expected_ship_date: formData.expected_ship_date || undefined,
        packaging_type: formData.packaging_type || undefined,
      });

      setLoading(true);

      const { error } = await supabase
        .from("batches")
        .update({
          product_type: validatedData.product_type,
          variety: validatedData.variety || null,
          quantity: validatedData.quantity,
          weight_unit: validatedData.weight_unit,
          origin_country: validatedData.origin_country,
          origin_state: validatedData.origin_state || null,
          origin_address: validatedData.origin_address || null,
          destination_country: validatedData.destination_country,
          harvest_date: validatedData.harvest_date,
          expected_ship_date: validatedData.expected_ship_date || null,
          packaging_type: validatedData.packaging_type || null,
        })
        .eq("id", batch.id);

      if (error) throw error;

      toast.success("Batch updated successfully");
      setOpen(false);
      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please check the form for errors");
      } else {
        console.error("Error updating batch:", error);
        toast.error("Failed to update batch");
      }
    } finally {
      setLoading(false);
    }
  };

  // Only show edit button for submitted batches
  if (batch.status !== "Submitted") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Batch Details</DialogTitle>
          <DialogDescription>
            Update batch information. Changes can only be made before QA inspection begins.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_type">Product Type *</Label>
              <Input
                id="product_type"
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                placeholder="e.g., Rice, Wheat, Coffee"
                maxLength={100}
              />
              {errors.product_type && (
                <p className="text-sm text-destructive">{errors.product_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                placeholder="e.g., Basmati, Arabica"
                maxLength={100}
              />
              {errors.variety && (
                <p className="text-sm text-destructive">{errors.variety}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_unit">Unit *</Label>
              <Select
                value={formData.weight_unit}
                onValueChange={(value) => setFormData({ ...formData, weight_unit: value })}
              >
                <SelectTrigger id="weight_unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="tons">Tons</SelectItem>
                  <SelectItem value="quintals">Quintals</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
              {errors.weight_unit && (
                <p className="text-sm text-destructive">{errors.weight_unit}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin_country">Origin Country *</Label>
              <Input
                id="origin_country"
                value={formData.origin_country}
                onChange={(e) => setFormData({ ...formData, origin_country: e.target.value })}
                placeholder="Country of origin"
                maxLength={100}
              />
              {errors.origin_country && (
                <p className="text-sm text-destructive">{errors.origin_country}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin_state">Origin State/Region</Label>
              <Input
                id="origin_state"
                value={formData.origin_state}
                onChange={(e) => setFormData({ ...formData, origin_state: e.target.value })}
                placeholder="State or region"
                maxLength={100}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="origin_address">Origin Address</Label>
              <Textarea
                id="origin_address"
                value={formData.origin_address}
                onChange={(e) => setFormData({ ...formData, origin_address: e.target.value })}
                placeholder="Full address of origin"
                maxLength={500}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination_country">Destination Country *</Label>
              <Input
                id="destination_country"
                value={formData.destination_country}
                onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                placeholder="Destination country"
                maxLength={100}
              />
              {errors.destination_country && (
                <p className="text-sm text-destructive">{errors.destination_country}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="packaging_type">Packaging Type</Label>
              <Input
                id="packaging_type"
                value={formData.packaging_type}
                onChange={(e) => setFormData({ ...formData, packaging_type: e.target.value })}
                placeholder="e.g., Jute bags, Containers"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvest_date">Harvest Date *</Label>
              <Input
                id="harvest_date"
                type="date"
                value={formData.harvest_date}
                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
              />
              {errors.harvest_date && (
                <p className="text-sm text-destructive">{errors.harvest_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_ship_date">Expected Ship Date</Label>
              <Input
                id="expected_ship_date"
                type="date"
                value={formData.expected_ship_date}
                onChange={(e) => setFormData({ ...formData, expected_ship_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
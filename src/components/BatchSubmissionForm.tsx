import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, X, FileText } from "lucide-react";

const batchSchema = z.object({
  product_type: z.string().min(1, "Product type is required"),
  variety: z.string().min(1, "Product variety is required"),
  quantity: z.string().min(1, "Quantity is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Quantity must be a positive number"),
  weight_unit: z.enum(["kg", "lbs", "tons", "mt"]),
  packaging_type: z.string().optional(),
  harvest_date: z.string().min(1, "Harvest date is required"),
  expected_ship_date: z.string().optional(),
  origin_country: z.string().min(1, "Origin country is required"),
  origin_state: z.string().optional(),
  origin_address: z.string().optional(),
  origin_lat: z.string().optional(),
  origin_lon: z.string().optional(),
  destination_country: z.string().min(1, "Destination country is required"),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface BatchSubmissionFormProps {
  onSuccess?: () => void;
}

export const BatchSubmissionForm = ({ onSuccess }: BatchSubmissionFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      weight_unit: "kg",
    },
  });

  const weightUnit = watch("weight_unit");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: BatchFormData) => {
    if (!user) {
      toast.error("You must be logged in to submit a batch");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from("batches")
        .insert([{
          exporter_id: user.id,
          product_type: data.product_type,
          variety: data.variety || null,
          quantity: Number(data.quantity),
          weight_unit: data.weight_unit,
          packaging_type: data.packaging_type || null,
          harvest_date: data.harvest_date,
          expected_ship_date: data.expected_ship_date || null,
          origin_country: data.origin_country,
          origin_state: data.origin_state || null,
          origin_address: data.origin_address || null,
          origin_lat: data.origin_lat ? Number(data.origin_lat) : null,
          origin_lon: data.origin_lon ? Number(data.origin_lon) : null,
          destination_country: data.destination_country,
          status: "Submitted",
        }] as any)
        .select()
        .single();

      if (batchError) throw batchError;

      // Upload files if any
      if (files.length > 0 && batch) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${batch.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("batch-attachments")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("batch-attachments")
            .getPublicUrl(fileName);

          // Create attachment record
          const { error: attachmentError } = await supabase
            .from("batch_attachments")
            .insert({
              batch_id: batch.id,
              filename: file.name,
              url: publicUrl,
              type: file.type,
            });

          if (attachmentError) throw attachmentError;
        });

        await Promise.all(uploadPromises);
      }

      toast.success(`Batch submitted successfully! Tracking Token: ${batch.tracking_token}`, {
        duration: 8000,
      });
      reset();
      setFiles([]);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting batch:", error);
      toast.error(error.message || "Failed to submit batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Batch</CardTitle>
        <CardDescription>
          Provide detailed information about your agricultural batch for certification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type *</Label>
                <Input
                  id="product_type"
                  {...register("product_type")}
                  placeholder="e.g., Coffee, Cocoa, Rice"
                />
                {errors.product_type && (
                  <p className="text-sm text-destructive">{errors.product_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety">Variety *</Label>
                <Input
                  id="variety"
                  {...register("variety")}
                  placeholder="e.g., Arabica, Robusta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  {...register("quantity")}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight_unit">Weight Unit *</Label>
                <Select
                  value={weightUnit}
                  onValueChange={(value) => setValue("weight_unit", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="mt">Metric Tons (MT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packaging_type">Packaging Type</Label>
                <Input
                  id="packaging_type"
                  {...register("packaging_type")}
                  placeholder="e.g., Jute bags, Containers"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Important Dates</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="harvest_date">Harvest Date *</Label>
                <Input
                  id="harvest_date"
                  type="date"
                  {...register("harvest_date")}
                />
                {errors.harvest_date && (
                  <p className="text-sm text-destructive">{errors.harvest_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_ship_date">Expected Ship Date</Label>
                <Input
                  id="expected_ship_date"
                  type="date"
                  {...register("expected_ship_date")}
                />
              </div>
            </div>
          </div>

          {/* Origin Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Origin Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="origin_country">Origin Country *</Label>
                <Input
                  id="origin_country"
                  {...register("origin_country")}
                  placeholder="e.g., Colombia, Ethiopia"
                />
                {errors.origin_country && (
                  <p className="text-sm text-destructive">{errors.origin_country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin_state">State/Province</Label>
                <Input
                  id="origin_state"
                  {...register("origin_state")}
                  placeholder="e.g., Antioquia, Sidamo"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="origin_address">Full Address</Label>
                <Textarea
                  id="origin_address"
                  {...register("origin_address")}
                  placeholder="Enter complete farm or facility address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin_lat">Latitude (Optional)</Label>
                <Input
                  id="origin_lat"
                  type="number"
                  step="any"
                  {...register("origin_lat")}
                  placeholder="e.g., 6.2476"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin_lon">Longitude (Optional)</Label>
                <Input
                  id="origin_lon"
                  type="number"
                  step="any"
                  {...register("origin_lon")}
                  placeholder="e.g., -75.5658"
                />
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Destination</h3>
            
            <div className="space-y-2">
              <Label htmlFor="destination_country">Destination Country *</Label>
              <Input
                id="destination_country"
                {...register("destination_country")}
                placeholder="e.g., United States, Germany"
              />
              {errors.destination_country && (
                <p className="text-sm text-destructive">{errors.destination_country.message}</p>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supporting Documents</h3>
            <p className="text-sm text-muted-foreground">
              Upload certificates, test reports, or other relevant documents (PDF, JPG, PNG, Excel, CSV - Max 10MB each)
            </p>
            
            <div className="space-y-4">
              <Label
                htmlFor="file-upload"
                className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload files
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </Label>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setFiles([]);
              }}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Batch
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

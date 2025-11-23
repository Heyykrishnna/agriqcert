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
import { Loader2, Upload, X, FileText, Plus, Trash2 } from "lucide-react";

const inspectionSchema = z.object({
  scheduled_date: z.string().optional(),
  inspector_id: z.string().optional(),
  moisture_percent: z.string().optional(),
  organic_status: z.enum(["Organic", "Conventional", "In Transition"]).optional(),
  iso_codes: z.string().optional(),
  comments: z.string().optional(),
  conclusion: z.enum(["Pass", "Fail", "Conditional Pass"]),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

interface PesticideResult {
  name: string;
  ppm: string;
}

interface InspectionFormProps {
  inspectionId: string;
  batchId: string;
  onSuccess?: () => void;
}

export const InspectionForm = ({ inspectionId, batchId, onSuccess }: InspectionFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pesticides, setPesticides] = useState<PesticideResult[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
  });

  const conclusion = watch("conclusion");
  const organicStatus = watch("organic_status");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addPesticide = () => {
    setPesticides((prev) => [...prev, { name: "", ppm: "" }]);
  };

  const removePesticide = (index: number) => {
    setPesticides((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePesticide = (index: number, field: keyof PesticideResult, value: string) => {
    setPesticides((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const onSubmit = async (data: InspectionFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Parse ISO codes
      const isoCodes = data.iso_codes
        ? data.iso_codes.split(",").map((code) => code.trim())
        : null;

      // Update inspection
      const { error: inspectionError } = await supabase
        .from("inspections")
        .update({
          scheduled_date: data.scheduled_date || null,
          inspector_id: data.inspector_id || null,
          moisture_percent: data.moisture_percent ? Number(data.moisture_percent) : null,
          organic_status: data.organic_status || null,
          iso_codes: isoCodes,
          comments: data.comments || null,
          conclusion: data.conclusion,
          status: "Completed",
          completed_date: new Date().toISOString(),
        })
        .eq("id", inspectionId);

      if (inspectionError) throw inspectionError;

      // Update batch status based on conclusion
      const newBatchStatus =
        data.conclusion === "Pass" ? "Approved" : "Rejected";
      
      const { error: batchError } = await supabase
        .from("batches")
        .update({ status: newBatchStatus })
        .eq("id", batchId);

      if (batchError) throw batchError;

      // Insert pesticide results
      if (pesticides.length > 0) {
        const pesticideData = pesticides
          .filter((p) => p.name && p.ppm)
          .map((p) => ({
            inspection_id: inspectionId,
            name: p.name,
            ppm: Number(p.ppm),
          }));

        if (pesticideData.length > 0) {
          const { error: pesticideError } = await supabase
            .from("pesticide_results")
            .insert(pesticideData);

          if (pesticideError) throw pesticideError;
        }
      }

      // Upload files if any
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${inspectionId}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("batch-attachments")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("batch-attachments")
            .getPublicUrl(fileName);

          const { error: attachmentError } = await supabase
            .from("inspection_attachments")
            .insert({
              inspection_id: inspectionId,
              filename: file.name,
              url: publicUrl,
              type: file.type,
            });

          if (attachmentError) throw attachmentError;
        });

        await Promise.all(uploadPromises);
      }

      toast.success("Inspection completed successfully!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      toast.error(error.message || "Failed to complete inspection");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Inspection</CardTitle>
        <CardDescription>
          Fill in all inspection details and test results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Inspection Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Inspection Details</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  {...register("scheduled_date")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector_id">Inspector ID</Label>
                <Input
                  id="inspector_id"
                  {...register("inspector_id")}
                  placeholder="Inspector's user ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moisture_percent">Moisture Content (%)</Label>
                <Input
                  id="moisture_percent"
                  type="number"
                  step="0.1"
                  {...register("moisture_percent")}
                  placeholder="e.g., 12.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organic_status">Organic Status</Label>
                <Select
                  value={organicStatus}
                  onValueChange={(value) => setValue("organic_status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Organic">Organic</SelectItem>
                    <SelectItem value="Conventional">Conventional</SelectItem>
                    <SelectItem value="In Transition">In Transition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="iso_codes">ISO Certifications</Label>
                <Input
                  id="iso_codes"
                  {...register("iso_codes")}
                  placeholder="e.g., ISO 22000, ISO 9001 (comma-separated)"
                />
              </div>
            </div>
          </div>

          {/* Pesticide Testing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pesticide Test Results</h3>
              <Button type="button" variant="outline" size="sm" onClick={addPesticide}>
                <Plus className="h-4 w-4 mr-2" />
                Add Pesticide
              </Button>
            </div>

            {pesticides.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pesticide tests added. Click "Add Pesticide" to add test results.
              </p>
            ) : (
              <div className="space-y-3">
                {pesticides.map((pesticide, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Pesticide Name</Label>
                      <Input
                        value={pesticide.name}
                        onChange={(e) => updatePesticide(index, "name", e.target.value)}
                        placeholder="e.g., Glyphosate"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>PPM Level</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={pesticide.ppm}
                        onChange={(e) => updatePesticide(index, "ppm", e.target.value)}
                        placeholder="e.g., 0.05"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePesticide(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Inspector Comments</Label>
            <Textarea
              id="comments"
              {...register("comments")}
              placeholder="Enter detailed inspection notes and observations"
              rows={4}
            />
          </div>

          {/* Conclusion */}
          <div className="space-y-2">
            <Label htmlFor="conclusion">Inspection Conclusion *</Label>
            <Select
              value={conclusion}
              onValueChange={(value) => setValue("conclusion", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select conclusion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Conditional Pass">Conditional Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
              </SelectContent>
            </Select>
            {errors.conclusion && (
              <p className="text-sm text-destructive">{errors.conclusion.message}</p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supporting Documents</h3>
            <p className="text-sm text-muted-foreground">
              Upload lab reports, photos, or certificates
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
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Inspection
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

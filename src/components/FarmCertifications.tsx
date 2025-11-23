import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Award, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Certification {
  id: string;
  certification_type: string;
  certification_name: string;
  issuer: string;
  certificate_number: string | null;
  issue_date: string;
  expiry_date: string | null;
  scope: string | null;
  attachment_url: string | null;
}

interface FarmCertificationsProps {
  batchId: string;
  isEditable?: boolean;
}

export const FarmCertifications = ({ batchId, isEditable = false }: FarmCertificationsProps) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    certification_type: "",
    certification_name: "",
    issuer: "",
    certificate_number: "",
    issue_date: "",
    expiry_date: "",
    scope: "",
    attachment_url: "",
  });

  const fetchCertifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("farm_certifications")
      .select("*")
      .eq("batch_id", batchId)
      .order("issue_date", { ascending: false });

    if (error) {
      toast.error("Failed to load certifications");
      console.error(error);
    } else {
      setCertifications(data || []);
    }
    setLoading(false);
  };

  useState(() => {
    fetchCertifications();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("farm_certifications").insert({
      batch_id: batchId,
      certification_type: formData.certification_type,
      certification_name: formData.certification_name,
      issuer: formData.issuer,
      certificate_number: formData.certificate_number || null,
      issue_date: formData.issue_date,
      expiry_date: formData.expiry_date || null,
      scope: formData.scope || null,
      attachment_url: formData.attachment_url || null,
    });

    if (error) {
      toast.error("Failed to add certification");
      console.error(error);
    } else {
      toast.success("Certification added successfully");
      setShowForm(false);
      setFormData({
        certification_type: "",
        certification_name: "",
        issuer: "",
        certificate_number: "",
        issue_date: "",
        expiry_date: "",
        scope: "",
        attachment_url: "",
      });
      fetchCertifications();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certification?")) return;

    const { error } = await supabase.from("farm_certifications").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete certification");
      console.error(error);
    } else {
      toast.success("Certification deleted");
      fetchCertifications();
    }
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Farm Certifications
            </CardTitle>
            <CardDescription>Organic and sustainability certifications</CardDescription>
          </div>
          {isEditable && (
            <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && isEditable && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certification_type">Certification Type *</Label>
                <Select
                  value={formData.certification_type}
                  onValueChange={(value) => setFormData({ ...formData, certification_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="fair_trade">Fair Trade</SelectItem>
                    <SelectItem value="gmp">Good Manufacturing Practice (GMP)</SelectItem>
                    <SelectItem value="gap">Good Agricultural Practice (GAP)</SelectItem>
                    <SelectItem value="rainforest">Rainforest Alliance</SelectItem>
                    <SelectItem value="iso">ISO Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="certification_name">Certification Name *</Label>
                <Input
                  id="certification_name"
                  required
                  value={formData.certification_name}
                  onChange={(e) => setFormData({ ...formData, certification_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="issuer">Issuing Body *</Label>
                <Input
                  id="issuer"
                  required
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="certificate_number">Certificate Number</Label>
                <Input
                  id="certificate_number"
                  value={formData.certificate_number}
                  onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input
                  id="issue_date"
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="scope">Scope</Label>
              <Textarea
                id="scope"
                rows={2}
                placeholder="e.g., All products, specific crops, etc."
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="attachment_url">Certificate URL</Label>
              <Input
                id="attachment_url"
                type="url"
                placeholder="https://..."
                value={formData.attachment_url}
                onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Certification"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {loading && certifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Loading certifications...</p>
          ) : certifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No certifications recorded yet</p>
          ) : (
            certifications.map((cert) => (
              <div key={cert.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{cert.certification_name}</h4>
                      <Badge variant={cert.certification_type === "organic" ? "default" : "secondary"}>
                        {cert.certification_type.replace("_", " ").toUpperCase()}
                      </Badge>
                      {cert.expiry_date && (
                        <Badge variant={isExpired(cert.expiry_date) ? "destructive" : "outline"}>
                          {isExpired(cert.expiry_date) ? "Expired" : "Active"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Issued by: {cert.issuer}</p>
                    {cert.certificate_number && (
                      <p className="text-sm text-muted-foreground">Cert #: {cert.certificate_number}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {cert.attachment_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={cert.attachment_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {isEditable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cert.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Issued:</span>{" "}
                    {new Date(cert.issue_date).toLocaleDateString()}
                  </div>
                  {cert.expiry_date && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {new Date(cert.expiry_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {cert.scope && (
                  <p className="text-sm text-muted-foreground border-t pt-2">{cert.scope}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

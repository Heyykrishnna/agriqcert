import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, ClipboardCheck, Package, Award, Anchor } from "lucide-react";
import { InspectionForm } from "./InspectionForm";
import { CertificateView } from "./CertificateView";
import { InjiWalletIntegration } from "./InjiWalletIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

interface Inspection {
  id: string;
  batch_id: string;
  status: string;
  created_at: string;
  batches: {
    product_type: string;
    variety: string | null;
    quantity: number;
    weight_unit: string;
  };
}

export const AssignedInspections = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [certificateData, setCertificateData] = useState<{
    credential: any;
    batch: any;
    inspection: any;
  } | null>(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [anchoringInProgress, setAnchoringInProgress] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, [user]);

  const fetchInspections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("inspections")
        .select(`
          *,
          batches (
            product_type,
            variety,
            quantity,
            weight_unit
          )
        `)
        .eq("qa_agency_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      toast.error("Failed to load inspections");
    } finally {
      setLoading(false);
    }
  };

  const issueVC = async (inspectionId: string, batchId: string) => {
    if (!user) return;

    try {
      // Fetch inspection details
      const { data: inspection, error: inspectionError } = await supabase
        .from("inspections")
        .select("*, batches(*)")
        .eq("id", inspectionId)
        .single();

      if (inspectionError) throw inspectionError;

      // Fetch exporter info
      const { data: batch } = await supabase
        .from("batches")
        .select("exporter_id")
        .eq("id", batchId)
        .single();

      if (!batch) throw new Error("Batch not found");

      // Create W3C compliant VC JSON (Digital Product Passport format)
      const credentialJson = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/security/suites/ed25519-2020/v1"
        ],
        type: ["VerifiableCredential", "DigitalProductPassport", "AgriculturalQualityCertificate"],
        issuer: {
          id: `did:agri:qa:${user.id}`,
          name: "AgroTrace Quality Assurance Agency",
          type: "Organization",
        },
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: `did:agri:exporter:${batch.exporter_id}`,
          type: "ProductBatch",
          batchId: batchId,
          product: {
            type: inspection.batches.product_type,
            variety: inspection.batches.variety,
            quantity: inspection.batches.quantity,
            unit: inspection.batches.weight_unit,
          },
          origin: {
            country: inspection.batches.origin_country,
            state: inspection.batches.origin_state,
            address: inspection.batches.origin_address,
            coordinates: {
              latitude: inspection.batches.origin_lat,
              longitude: inspection.batches.origin_lon,
            },
          },
          destination: {
            country: inspection.batches.destination_country,
          },
          harvestDate: inspection.batches.harvest_date,
          qualityAssessment: {
            conclusion: inspection.conclusion,
            organicStatus: inspection.organic_status,
            moisturePercent: inspection.moisture_percent,
            isoCertifications: inspection.iso_codes,
            inspectionDate: inspection.completed_date,
            inspector: {
              id: inspection.inspector_id,
              agency: `did:agri:qa:${user.id}`,
            },
            comments: inspection.comments,
          },
        },
        proof: {
          type: "Ed25519Signature2020",
          created: new Date().toISOString(),
          verificationMethod: `did:agri:qa:${user.id}#key-1`,
          proofPurpose: "assertionMethod",
        },
      };

      // Generate QR token
      const qrToken = `VC-${batchId.substring(0, 8)}-${Date.now()}`;

      // Insert VC
      const { error: vcError } = await supabase.from("verifiable_credentials").insert({
        batch_id: batchId,
        inspection_id: inspectionId,
        holder_id: batch.exporter_id,
        issuer_did: `did:agri:qa:${user.id}`,
        credential_json: credentialJson,
        qr_token: qrToken,
        revocation_status: "active",
      });

      if (vcError) throw vcError;

      // Fetch the created VC to show certificate
      const { data: vcData, error: vcFetchError } = await supabase
        .from("verifiable_credentials")
        .select("*")
        .eq("qr_token", qrToken)
        .single();

      if (vcFetchError) throw vcFetchError;

      // Anchor to blockchain in background
      setAnchoringInProgress(true);
      toast.info("Anchoring credential to blockchain...");
      
      supabase.functions.invoke('anchor-to-blockchain', {
        body: { credentialId: vcData.id }
      }).then(({ data: anchorData, error: anchorError }) => {
        setAnchoringInProgress(false);
        if (anchorError) {
          console.error('Blockchain anchoring error:', anchorError);
          toast.warning("Certificate issued but blockchain anchoring failed. You can retry later.");
        } else {
          toast.success("Certificate anchored to blockchain!");
          // Refresh the credential data with blockchain info
          supabase
            .from("verifiable_credentials")
            .select("*")
            .eq("id", vcData.id)
            .single()
            .then(({ data: updatedVC }) => {
              if (updatedVC) {
                setCertificateData({
                  credential: updatedVC,
                  batch: inspection.batches,
                  inspection: inspection,
                });
              }
            });
        }
      });

      // Show certificate view
      setCertificateData({
        credential: vcData,
        batch: inspection.batches,
        inspection: inspection,
      });
      setCertificateDialogOpen(true);

      toast.success("Certificate issued successfully!");
      fetchInspections();
    } catch (error: any) {
      console.error("Error issuing VC:", error);
      toast.error(error.message || "Failed to issue certificate");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-secondary text-secondary-foreground";
      case "completed":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No inspections assigned yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inspections.map((inspection) => (
        <Card key={inspection.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {inspection.batches.product_type}
                  {inspection.batches.variety && ` - ${inspection.batches.variety}`}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {inspection.batches.quantity} {inspection.batches.weight_unit}
                </div>
              </div>
              <Badge className={getStatusColor(inspection.status)}>
                {inspection.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex gap-2">
            {inspection.status === "Pending" && (
              <Dialog open={isDialogOpen && selectedInspection?.id === inspection.id} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setSelectedInspection(null);
              }}>
                <DialogTrigger asChild>
                  <Button
                    className="flex-1"
                    onClick={() => setSelectedInspection(inspection)}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Complete Inspection
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Inspection Form</DialogTitle>
                  </DialogHeader>
                  <InspectionForm
                    inspectionId={inspection.id}
                    batchId={inspection.batch_id}
                    onSuccess={() => {
                      setIsDialogOpen(false);
                      setSelectedInspection(null);
                      fetchInspections();
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
            {inspection.status === "Completed" && (
              <Button
                className="flex-1"
                onClick={() => issueVC(inspection.id, inspection.batch_id)}
              >
                <Award className="h-4 w-4 mr-2" />
                Issue Certificate
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Certificate Dialog */}
      <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Digital Product Passport Issued</DialogTitle>
          </DialogHeader>
          {certificateData && (
            <Tabs defaultValue="certificate" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="certificate">Certificate View</TabsTrigger>
                <TabsTrigger value="wallet">Inji Wallet</TabsTrigger>
              </TabsList>
              <TabsContent value="certificate" className="mt-4">
                <CertificateView
                  credential={certificateData.credential}
                  batch={certificateData.batch}
                  inspection={certificateData.inspection}
                />
              </TabsContent>
              <TabsContent value="wallet" className="mt-4">
                <InjiWalletIntegration
                  credential={certificateData.credential}
                  qrToken={certificateData.credential.qr_token}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

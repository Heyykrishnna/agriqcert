import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Truck,
  FileCheck,
  Home,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { CertificateView } from "@/components/CertificateView";
import { BatchJourneyPDF } from "@/components/BatchJourneyPDF";

interface Batch {
  id: string;
  product_type: string;
  variety: string | null;
  quantity: number;
  weight_unit: string;
  status: string;
  origin_country: string;
  origin_state: string | null;
  destination_country: string;
  harvest_date: string;
  expected_ship_date: string | null;
  created_at: string;
  tracking_token: string;
  packaging_type: string | null;
}

interface Inspection {
  id: string;
  status: string;
  conclusion: string | null;
  organic_status: string | null;
  moisture_percent: number | null;
  iso_codes: string[] | null;
  comments: string | null;
  completed_date: string | null;
  created_at: string;
}

interface Certificate {
  id: string;
  qr_token: string;
  issued_at: string;
  revocation_status: string;
  credential_json: any;
  issuer_did: string;
  blockchain_tx_hash: string | null;
}

const PublicBatchTracker = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    if (token) {
      fetchBatchByToken(token);
    }
  }, [token]);

  const fetchBatchByToken = async (trackingToken: string) => {
    try {
      setLoading(true);

      // Fetch batch by tracking token
      const { data: batchData, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("tracking_token", trackingToken)
        .maybeSingle();

      if (batchError) throw batchError;

      if (!batchData) {
        setNotFound(true);
        return;
      }

      setBatch(batchData);

      // Fetch inspections
      const { data: inspectionsData } = await supabase
        .from("inspections")
        .select("*")
        .eq("batch_id", batchData.id)
        .order("created_at", { ascending: false });

      setInspections(inspectionsData || []);

      // Fetch certificates
      const { data: certificatesData } = await supabase
        .from("verifiable_credentials")
        .select("*")
        .eq("batch_id", batchData.id)
        .eq("revocation_status", "active");

      setCertificates(certificatesData || []);
    } catch (error) {
      console.error("Error fetching batch:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Certified":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Under Inspection":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Certified":
        return "default";
      case "Under Inspection":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading batch information...</p>
        </div>
      </div>
    );
  }

  if (notFound || !batch) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <Package className="h-6 w-6" />
              Batch Tracker
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-6 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Batch Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The tracking token you entered could not be found in our system.
              </p>
              <Button asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <Package className="h-6 w-6" />
              Batch Tracker
            </Link>
            <div className="flex items-center gap-2">
              {getStatusIcon(batch.status)}
              <Badge variant={getStatusColor(batch.status)}>{batch.status}</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Tracking Token Display with PDF Download */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-sm text-muted-foreground mb-2">Tracking Token</p>
                <p className="text-2xl font-mono font-bold text-primary">{batch.tracking_token}</p>
              </div>
              <BatchJourneyPDF
                batch={batch}
                inspections={inspections}
                certificates={certificates}
              />
            </div>
          </CardContent>
        </Card>

        {/* Journey Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Batch Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Submitted */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  {(inspections.length > 0 || certificates.length > 0) && (
                    <div className="w-0.5 h-12 bg-green-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <p className="font-semibold">Batch Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(batch.created_at), "PPP 'at' p")}
                  </p>
                </div>
              </div>

              {/* Inspection */}
              {inspections.length > 0 && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-blue-100 p-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    {certificates.length > 0 && (
                      <div className="w-0.5 h-12 bg-blue-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold">Quality Inspection</p>
                    <p className="text-sm text-muted-foreground">
                      {inspections[0].completed_date
                        ? `Completed on ${format(new Date(inspections[0].completed_date), "PPP")}`
                        : `Status: ${inspections[0].status}`}
                    </p>
                    {inspections[0].conclusion && (
                      <p className="text-sm font-medium text-green-600 mt-1">
                        {inspections[0].conclusion}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Certificate */}
              {certificates.length > 0 && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Certificate Issued</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(certificates[0].issued_at), "PPP 'at' p")}
                    </p>
                    <Badge className="mt-2" variant="default">Verified</Badge>
                  </div>
                </div>
              )}

              {/* In Transit */}
              {batch.expected_ship_date && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-gray-100 p-2">
                      <Truck className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Expected Shipment</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(batch.expected_ship_date), "PPP")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Batch Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Batch Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-semibold text-lg">
                  {batch.product_type}
                  {batch.variety && ` - ${batch.variety}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-semibold">
                  {batch.quantity} {batch.weight_unit}
                </p>
              </div>
              {batch.packaging_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Packaging</p>
                  <p className="font-semibold">{batch.packaging_type}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Harvest Date</p>
                <p className="font-semibold">
                  {format(new Date(batch.harvest_date), "PPP")}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Origin</p>
                    <p className="font-semibold">
                      {batch.origin_state ? `${batch.origin_state}, ` : ""}
                      {batch.origin_country}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-semibold">{batch.destination_country}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Results */}
        {inspections.length > 0 && inspections[0].conclusion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Quality Inspection Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Conclusion</p>
                  <p className="font-semibold text-lg text-green-600">
                    {inspections[0].conclusion}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {inspections[0].organic_status && (
                    <div>
                      <p className="text-sm text-muted-foreground">Organic Status</p>
                      <p className="font-semibold">{inspections[0].organic_status}</p>
                    </div>
                  )}
                  {inspections[0].moisture_percent && (
                    <div>
                      <p className="text-sm text-muted-foreground">Moisture Content</p>
                      <p className="font-semibold">{inspections[0].moisture_percent}%</p>
                    </div>
                  )}
                  {inspections[0].iso_codes && inspections[0].iso_codes.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">ISO Standards</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {inspections[0].iso_codes.map((code) => (
                          <Badge key={code} variant="secondary">{code}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {inspections[0].comments && (
                  <div>
                    <p className="text-sm text-muted-foreground">Inspector Comments</p>
                    <p className="text-sm mt-1">{inspections[0].comments}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificate Display */}
        {certificates.length > 0 && inspections.length > 0 && (
          <div className="mb-6">
            <CertificateView
              credential={certificates[0]}
              batch={batch}
              inspection={inspections[0]}
            />
          </div>
        )}

        {/* Footer */}
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              This batch information is publicly verifiable and tamper-proof.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Main Website
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PublicBatchTracker;

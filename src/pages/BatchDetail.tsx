import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, MapPin, Calendar, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { TrackingQRCode } from "@/components/TrackingQRCode";
import { BatchJourneyPDF } from "@/components/BatchJourneyPDF";
import { SoilAnalytics } from "@/components/SoilAnalytics";
import { FarmCertifications } from "@/components/FarmCertifications";
import { SustainablePractices } from "@/components/SustainablePractices";
import { WeatherTracking } from "@/components/WeatherTracking";

const BatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);

  const handleBack = () => {
    // Navigate based on user role
    if (userRole === "exporter") {
      navigate("/exporter");
    } else if (userRole === "qa_agency") {
      navigate("/qa");
    } else if (userRole === "admin") {
      navigate("/admin");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);

      // Fetch batch
      const { data: batchData, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("id", id)
        .single();

      if (batchError) throw batchError;
      setBatch(batchData);

      // Fetch inspections
      const { data: inspectionsData, error: inspError } = await supabase
        .from("inspections")
        .select("*")
        .eq("batch_id", id)
        .order("created_at", { ascending: false });

      if (inspError) throw inspError;
      setInspections(inspectionsData || []);

      // Fetch attachments
      const { data: attachmentsData, error: attachError } = await supabase
        .from("batch_attachments")
        .select("*")
        .eq("batch_id", id)
        .order("created_at", { ascending: false });

      if (attachError) throw attachError;
      setAttachments(attachmentsData || []);

      // Fetch credentials if any inspections are completed
      if (inspectionsData && inspectionsData.length > 0) {
        const { data: credData, error: credError } = await supabase
          .from("verifiable_credentials")
          .select("*")
          .eq("batch_id", id);

        if (!credError) {
          setCredentials(credData || []);
        }
      }
    } catch (error: any) {
      console.error("Error fetching batch details:", error);
      toast.error("Failed to load batch details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Certified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Certified":
        return "default";
      case "In Progress":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <p className="text-lg mb-4">Batch not found</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold">Batch Details</h1>
          </div>
          <div className="flex items-center gap-3">
            <BatchJourneyPDF
              batch={batch}
              inspections={inspections}
              certificates={credentials}
              attachments={attachments}
            />
            <div className="flex items-center gap-2">
              {getStatusIcon(batch.status)}
              <Badge variant={getStatusColor(batch.status)}>{batch.status}</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tracking Token</p>
                      <p className="font-mono font-bold text-lg text-primary">{batch.tracking_token}</p>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Product Type</span>
                    <p className="font-medium">{batch.product_type}</p>
                  </div>
                  {batch.variety && (
                    <div>
                      <span className="text-sm text-muted-foreground">Variety</span>
                      <p className="font-medium">{batch.variety}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <p className="font-medium">
                      {batch.quantity} {batch.weight_unit}
                    </p>
                  </div>
                  {batch.packaging_type && (
                    <div>
                      <span className="text-sm text-muted-foreground">Packaging</span>
                      <p className="font-medium">{batch.packaging_type}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Origin & Destination
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Origin Country</span>
                    <p className="font-medium">{batch.origin_country}</p>
                  </div>
                  {batch.origin_state && (
                    <div>
                      <span className="text-sm text-muted-foreground">Origin State</span>
                      <p className="font-medium">{batch.origin_state}</p>
                    </div>
                  )}
                  {batch.origin_address && (
                    <div className="md:col-span-2">
                      <span className="text-sm text-muted-foreground">Origin Address</span>
                      <p className="font-medium">{batch.origin_address}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Destination Country</span>
                    <p className="font-medium">{batch.destination_country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Harvest Date</span>
                    <p className="font-medium">{format(new Date(batch.harvest_date), "PPP")}</p>
                  </div>
                  {batch.expected_ship_date && (
                    <div>
                      <span className="text-sm text-muted-foreground">Expected Ship Date</span>
                      <p className="font-medium">{format(new Date(batch.expected_ship_date), "PPP")}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Submitted</span>
                    <p className="font-medium">{format(new Date(batch.created_at), "PPP")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(batch.created_at), "PPP")}
                      </p>
                    </div>
                  </div>
                  {inspections.length > 0 ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Inspection Assigned</p>
                        <p className="text-sm text-muted-foreground">
                          {inspections.length} inspection(s)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-muted-foreground">Awaiting Inspection</p>
                        <p className="text-sm text-muted-foreground">Pending QA assignment</p>
                      </div>
                    </div>
                  )}
                  {credentials.length > 0 ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Certificate Issued</p>
                        <p className="text-sm text-muted-foreground">
                          {credentials.length} certificate(s)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-muted-foreground">Certificate Pending</p>
                        <p className="text-sm text-muted-foreground">Awaiting completion</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking QR Code Card */}
            <Card>
              <CardHeader>
                <CardTitle>Batch Label</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg w-full">
                    <p className="text-xs text-muted-foreground text-center mb-1">Tracking Token</p>
                    <p className="font-mono font-bold text-center text-primary">{batch.tracking_token}</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Use this QR code for batch labels and tracking
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Inspections</span>
                  <span className="font-medium">{inspections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Documents</span>
                  <span className="font-medium">{attachments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Certificates</span>
                  <span className="font-medium">{credentials.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6">
          <Tabs defaultValue="inspections" className="w-full">
            <TabsList>
              <TabsTrigger value="inspections">
                Inspections ({inspections.length})
              </TabsTrigger>
              <TabsTrigger value="documents">
                Documents ({attachments.length})
              </TabsTrigger>
              <TabsTrigger value="analytics">
                Farm Analytics
              </TabsTrigger>
              <TabsTrigger value="certificates">
                Certificates ({credentials.length})
              </TabsTrigger>
              <TabsTrigger value="tracking">
                Tracking Label
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inspections" className="mt-6">
              {inspections.length > 0 ? (
                <div className="space-y-4">
                  {inspections.map((inspection) => (
                    <Card key={inspection.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Inspection #{inspection.id.slice(0, 8)}
                          </CardTitle>
                          <Badge variant={inspection.status === "Completed" ? "default" : "secondary"}>
                            {inspection.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        {inspection.conclusion && (
                          <div>
                            <span className="text-sm text-muted-foreground">Conclusion:</span>
                            <p className="font-medium">{inspection.conclusion}</p>
                          </div>
                        )}
                        {inspection.organic_status && (
                          <div>
                            <span className="text-sm text-muted-foreground">Organic Status:</span>
                            <p className="font-medium">{inspection.organic_status}</p>
                          </div>
                        )}
                        {inspection.moisture_percent && (
                          <div>
                            <span className="text-sm text-muted-foreground">Moisture:</span>
                            <p className="font-medium">{inspection.moisture_percent}%</p>
                          </div>
                        )}
                        {inspection.iso_codes && inspection.iso_codes.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">ISO Standards:</span>
                            <p className="font-medium">{inspection.iso_codes.join(", ")}</p>
                          </div>
                        )}
                        {inspection.comments && (
                          <div>
                            <span className="text-sm text-muted-foreground">Comments:</span>
                            <p className="text-sm mt-1">{inspection.comments}</p>
                          </div>
                        )}
                        {inspection.completed_date && (
                          <div>
                            <span className="text-sm text-muted-foreground">Completed:</span>
                            <p className="font-medium">
                              {format(new Date(inspection.completed_date), "PPP")}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No inspections yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              {attachments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {attachments.map((attachment) => (
                    <Card key={attachment.id}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {attachment.filename}
                        </CardTitle>
                        <CardDescription>{attachment.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(attachment.url, "_blank")}
                        >
                          View Document
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Uploaded {format(new Date(attachment.created_at), "PP")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No documents uploaded
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="space-y-6">
                <WeatherTracking 
                  batchId={id || ""} 
                  isEditable={userRole === "exporter"}
                  batchLatitude={batch?.origin_lat}
                  batchLongitude={batch?.origin_lon}
                />
                <SoilAnalytics batchId={id || ""} isEditable={userRole === "exporter"} />
                <FarmCertifications batchId={id || ""} isEditable={userRole === "exporter"} />
                <SustainablePractices batchId={id || ""} isEditable={userRole === "exporter"} />
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="mt-6">
              <div className="max-w-md mx-auto">
                <TrackingQRCode 
                  trackingToken={batch.tracking_token}
                  batchInfo={{
                    product_type: batch.product_type,
                    quantity: batch.quantity,
                    weight_unit: batch.weight_unit
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="certificates" className="mt-6">
              {credentials.length > 0 ? (
                <div className="space-y-4">
                  {credentials.map((credential) => (
                    <Card key={credential.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Certificate #{credential.id.slice(0, 8)}
                          </CardTitle>
                          <Badge variant={credential.revocation_status === "active" ? "default" : "destructive"}>
                            {credential.revocation_status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">QR Token:</span>
                          <p className="font-mono text-sm break-all">{credential.qr_token}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Issued:</span>
                          <p className="font-medium">
                            {format(new Date(credential.issued_at), "PPP")}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Issuer DID:</span>
                          <p className="font-mono text-xs break-all">{credential.issuer_did}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No certificates issued yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BatchDetail;

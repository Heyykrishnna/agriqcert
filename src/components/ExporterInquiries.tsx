import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Inquiry {
  id: string;
  batch_id: string;
  importer_id: string;
  inquiry_type: string;
  message: string | null;
  quantity_requested: number | null;
  response: string | null;
  status: string;
  created_at: string;
  batches: {
    product_type: string;
    variety: string | null;
    tracking_token: string;
  };
}

export const ExporterInquiries = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInquiries();
    }
  }, [user]);

  const fetchInquiries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("batch_inquiries")
        .select(`
          *,
          batches (
            product_type,
            variety,
            tracking_token
          )
        `)
        .eq("batches.exporter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedInquiry || !response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("batch_inquiries")
        .update({
          response: response.trim(),
          status: "responded",
        })
        .eq("id", selectedInquiry.id);

      if (error) throw error;

      toast.success("Response sent successfully");
      setSelectedInquiry(null);
      setResponse("");
      fetchInquiries();
    } catch (error) {
      console.error("Error responding to inquiry:", error);
      toast.error("Failed to send response");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "responded":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      responded: "default",
      rejected: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const formatInquiryType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Inquiries</CardTitle>
      </CardHeader>
      <CardContent>
        {inquiries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No inquiries received yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inquiry.batches.product_type}</p>
                      {inquiry.batches.variety && (
                        <p className="text-sm text-muted-foreground">{inquiry.batches.variety}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{inquiry.batches.tracking_token}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatInquiryType(inquiry.inquiry_type)}</TableCell>
                  <TableCell>{inquiry.quantity_requested || "N/A"}</TableCell>
                  <TableCell>{format(new Date(inquiry.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setResponse(inquiry.response || "");
                          }}
                        >
                          {inquiry.status === "pending" ? "Respond" : "View"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Inquiry Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Product Information</h4>
                            <p className="text-sm">
                              {inquiry.batches.product_type}
                              {inquiry.batches.variety && ` - ${inquiry.batches.variety}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tracking: {inquiry.batches.tracking_token}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Inquiry Type</h4>
                            <p className="text-sm">{formatInquiryType(inquiry.inquiry_type)}</p>
                          </div>

                          {inquiry.quantity_requested && (
                            <div>
                              <h4 className="font-semibold mb-2">Requested Quantity</h4>
                              <p className="text-sm">{inquiry.quantity_requested}</p>
                            </div>
                          )}

                          {inquiry.message && (
                            <div>
                              <h4 className="font-semibold mb-2">Message</h4>
                              <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold mb-2">Your Response</h4>
                            {inquiry.status === "pending" ? (
                              <>
                                <Textarea
                                  value={response}
                                  onChange={(e) => setResponse(e.target.value)}
                                  placeholder="Enter your response to this inquiry..."
                                  rows={4}
                                />
                                <Button
                                  onClick={handleRespond}
                                  disabled={submitting || !response.trim()}
                                  className="mt-2"
                                >
                                  {submitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    "Send Response"
                                  )}
                                </Button>
                              </>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                                {inquiry.response || "No response provided"}
                              </p>
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Status</h4>
                            {getStatusBadge(inquiry.status)}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  inquiry_type: string;
  quantity_requested: number | null;
  message: string;
  status: string;
  response: string | null;
  created_at: string;
  batch: {
    product_type: string;
    variety: string | null;
    origin_country: string;
    tracking_token: string;
  };
}

interface BatchInquiriesProps {
  onStatusChange?: () => void;
}

export const BatchInquiries = ({ onStatusChange }: BatchInquiriesProps) => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    if (user) {
      fetchInquiries();
    }
  }, [user]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("batch_inquiries")
        .select(`
          *,
          batch:batch_id (
            product_type,
            variety,
            origin_country,
            tracking_token
          )
        `)
        .eq("importer_id", user?.id)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatInquiryType = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (loading) {
    return <div className="text-center py-8">Loading inquiries...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Inquiries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">
                    {inquiry.batch.product_type}
                    {inquiry.batch.variety && (
                      <div className="text-xs text-muted-foreground">{inquiry.batch.variety}</div>
                    )}
                    <div className="text-xs text-muted-foreground">{inquiry.batch.origin_country}</div>
                  </TableCell>
                  <TableCell>{formatInquiryType(inquiry.inquiry_type)}</TableCell>
                  <TableCell>
                    {inquiry.quantity_requested ? `${inquiry.quantity_requested} units` : "N/A"}
                  </TableCell>
                  <TableCell>{format(new Date(inquiry.created_at), "PP")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(inquiry.status)}
                      {getStatusBadge(inquiry.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Inquiry Details</DialogTitle>
                        </DialogHeader>
                        {selectedInquiry && (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Product</p>
                              <p className="font-semibold">
                                {selectedInquiry.batch.product_type}
                                {selectedInquiry.batch.variety && ` - ${selectedInquiry.batch.variety}`}
                              </p>
                              <p className="text-sm text-muted-foreground">{selectedInquiry.batch.origin_country}</p>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Tracking Token</p>
                              <p className="font-mono">{selectedInquiry.batch.tracking_token}</p>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Inquiry Type</p>
                              <p>{formatInquiryType(selectedInquiry.inquiry_type)}</p>
                            </div>

                            {selectedInquiry.quantity_requested && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Quantity Requested</p>
                                <p>{selectedInquiry.quantity_requested} units</p>
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Your Message</p>
                              <p className="text-sm">{selectedInquiry.message || "No message provided"}</p>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Status</p>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusIcon(selectedInquiry.status)}
                                {getStatusBadge(selectedInquiry.status)}
                              </div>
                            </div>

                            {selectedInquiry.response && (
                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm font-medium mb-2">Exporter Response</p>
                                <p className="text-sm">{selectedInquiry.response}</p>
                              </div>
                            )}

                            <div>
                              <p className="text-sm text-muted-foreground">
                                Submitted on {format(new Date(selectedInquiry.created_at), "PPP 'at' p")}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {inquiries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No inquiries submitted yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

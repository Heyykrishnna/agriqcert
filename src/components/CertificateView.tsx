import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Download, Printer } from "lucide-react";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { BlockchainAnchor } from "./BlockchainAnchor";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CertificateViewProps {
  credential: any;
  batch: any;
  inspection: any;
}

export const CertificateView = ({ credential, batch, inspection }: CertificateViewProps) => {
  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleExportPDF = async () => {
    const certificateElement = document.getElementById("certificate-content");
    if (!certificateElement) {
      toast.error("Certificate not found");
      return;
    }

    try {
      toast.info("Generating PDF...");
      
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`certificate-${credential.qr_token.substring(0, 8)}.pdf`);
      
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Certificate
        </Button>
        <Button onClick={handleExportPDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
      </div>

      <Card id="certificate-content" className="p-8 bg-background print:shadow-none">
        <div className="space-y-6">
          {/* Blockchain Anchor - Show first if exists */}
          {credential.blockchain_tx_hash && (
            <BlockchainAnchor credential={credential} />
          )}

          {/* Header */}
          <div className="text-center border-b-2 border-primary pb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Quality Assurance Certificate
            </h1>
            <p className="text-muted-foreground">
              Verifiable Credential for Agricultural Products
            </p>
          </div>

          {/* Certificate Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Certificate ID
                </h3>
                <p className="text-sm font-mono">{credential.id.substring(0, 8).toUpperCase()}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Tracking Token
                </h3>
                <p className="text-sm font-mono font-bold text-primary">{batch.tracking_token}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Issued Date
                </h3>
                <p className="text-sm">
                  {format(new Date(credential.issued_at), "PPP")}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Status
                </h3>
                <p className="text-sm font-semibold text-green-600">
                  {credential.revocation_status === "active" ? "Valid" : "Revoked"}
                </p>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <QRCodeGenerator token={credential.qr_token} size={180} />
            </div>
          </div>

          {/* Product Information */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Product Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Product Type
                </h3>
                <p className="text-sm">{batch.product_type}</p>
              </div>

              {batch.variety && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Variety
                  </h3>
                  <p className="text-sm">{batch.variety}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Quantity
                </h3>
                <p className="text-sm">
                  {batch.quantity} {batch.weight_unit}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Harvest Date
                </h3>
                <p className="text-sm">
                  {format(new Date(batch.harvest_date), "PPP")}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Origin Country
                </h3>
                <p className="text-sm">{batch.origin_country}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Destination
                </h3>
                <p className="text-sm">{batch.destination_country}</p>
              </div>
            </div>
          </div>

          {/* Inspection Results */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Inspection Results</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Conclusion
                </h3>
                <p className="text-sm font-semibold text-green-600">
                  {inspection.conclusion}
                </p>
              </div>

              {inspection.organic_status && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Organic Status
                  </h3>
                  <p className="text-sm">{inspection.organic_status}</p>
                </div>
              )}

              {inspection.moisture_percent && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Moisture Content
                  </h3>
                  <p className="text-sm">{inspection.moisture_percent}%</p>
                </div>
              )}

              {inspection.iso_codes && inspection.iso_codes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    ISO Standards
                  </h3>
                  <p className="text-sm">{inspection.iso_codes.join(", ")}</p>
                </div>
              )}
            </div>

            {inspection.comments && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Comments
                </h3>
                <p className="text-sm">{inspection.comments}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            <p>
              This certificate can be verified by scanning the QR code or visiting:
            </p>
            <p className="font-mono mt-1">
              {window.location.origin}/verify?token={credential.qr_token}
            </p>
          </div>
        </div>
      </Card>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-content,
          #certificate-content * {
            visibility: visible;
          }
          #certificate-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

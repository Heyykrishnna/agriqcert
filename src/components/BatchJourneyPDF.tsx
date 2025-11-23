import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface BatchJourneyPDFProps {
  batch: any;
  inspections: any[];
  certificates: any[];
  attachments?: any[];
}

export const BatchJourneyPDF = ({ 
  batch, 
  inspections, 
  certificates,
  attachments = []
}: BatchJourneyPDFProps) => {
  
  const generatePDF = async () => {
    try {
      toast.info("Generating batch journey report...");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let yPos = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number = 20) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper to add text with auto-pagination
      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.5;
        
        lines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          pdf.text(line, margin, yPos);
          yPos += lineHeight;
        });
      };

      // Title
      pdf.setFillColor(16, 185, 129); // Primary green
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Batch Journey Report", pageWidth / 2, 20, { align: "center" });
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: "center" });
      
      yPos = 50;
      pdf.setTextColor(0, 0, 0);

      // Tracking Token - Prominent Display
      checkPageBreak(30);
      pdf.setFillColor(240, 253, 244); // Light green background
      pdf.roundedRect(margin, yPos, maxWidth, 20, 3, 3, 'F');
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Tracking Token", margin + 5, yPos + 8);
      pdf.setFontSize(16);
      pdf.setTextColor(16, 185, 129);
      pdf.text(batch.tracking_token, margin + 5, yPos + 16);
      pdf.setTextColor(0, 0, 0);
      yPos += 30;

      // Batch Information Section
      checkPageBreak(40);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(16, 185, 129);
      pdf.text("Batch Information", margin, yPos);
      yPos += 8;
      
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(16, 185, 129);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      pdf.setTextColor(0, 0, 0);

      const batchInfo = [
        { label: "Product Type", value: batch.product_type + (batch.variety ? ` - ${batch.variety}` : '') },
        { label: "Quantity", value: `${batch.quantity} ${batch.weight_unit}` },
        { label: "Status", value: batch.status },
        { label: "Harvest Date", value: new Date(batch.harvest_date).toLocaleDateString() },
        { label: "Origin", value: `${batch.origin_state ? batch.origin_state + ', ' : ''}${batch.origin_country}` },
        { label: "Destination", value: batch.destination_country },
        { label: "Submitted", value: new Date(batch.created_at).toLocaleDateString() },
      ];

      if (batch.packaging_type) {
        batchInfo.push({ label: "Packaging", value: batch.packaging_type });
      }

      if (batch.expected_ship_date) {
        batchInfo.push({ label: "Expected Shipment", value: new Date(batch.expected_ship_date).toLocaleDateString() });
      }

      batchInfo.forEach(({ label, value }) => {
        checkPageBreak(12);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(`${label}:`, margin, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.text(value, margin + 55, yPos);
        yPos += 7;
      });

      yPos += 5;

      // Journey Timeline Section
      if (inspections.length > 0 || certificates.length > 0) {
        checkPageBreak(40);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(16, 185, 129);
        pdf.text("Batch Journey Timeline", margin, yPos);
        yPos += 8;
        
        pdf.setDrawColor(16, 185, 129);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        pdf.setTextColor(0, 0, 0);

        // Timeline events
        const timelineEvents = [
          {
            title: "Batch Submitted",
            date: new Date(batch.created_at).toLocaleString(),
            status: "Completed"
          }
        ];

        if (inspections.length > 0) {
          inspections.forEach((inspection, idx) => {
            timelineEvents.push({
              title: `Quality Inspection ${idx + 1}`,
              date: inspection.completed_date 
                ? `Completed: ${new Date(inspection.completed_date).toLocaleString()}`
                : `Status: ${inspection.status}`,
              status: inspection.status
            });
          });
        }

        if (certificates.length > 0) {
          certificates.forEach((cert, idx) => {
            timelineEvents.push({
              title: `Certificate Issued ${idx + 1}`,
              date: new Date(cert.issued_at).toLocaleString(),
              status: cert.revocation_status === 'active' ? 'Valid' : 'Revoked'
            });
          });
        }

        timelineEvents.forEach((event, index) => {
          checkPageBreak(20);
          
          // Timeline marker
          pdf.setFillColor(16, 185, 129);
          pdf.circle(margin + 3, yPos + 2, 2, 'F');
          
          if (index < timelineEvents.length - 1) {
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.5);
            pdf.line(margin + 3, yPos + 4, margin + 3, yPos + 18);
          }
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.text(event.title, margin + 10, yPos + 3);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(event.date, margin + 10, yPos + 8);
          
          pdf.setFontSize(10);
          pdf.setTextColor(16, 185, 129);
          pdf.text(`Status: ${event.status}`, margin + 10, yPos + 13);
          pdf.setTextColor(0, 0, 0);
          
          yPos += 20;
        });

        yPos += 5;
      }

      // Inspection Details Section
      if (inspections.length > 0 && inspections[0].conclusion) {
        checkPageBreak(50);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(16, 185, 129);
        pdf.text("Inspection Results", margin, yPos);
        yPos += 8;
        
        pdf.setDrawColor(16, 185, 129);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        pdf.setTextColor(0, 0, 0);

        const inspection = inspections[0];

        if (inspection.conclusion) {
          checkPageBreak(15);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text("Conclusion:", margin, yPos);
          yPos += 6;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          pdf.setTextColor(16, 185, 129);
          const conclusionLines = pdf.splitTextToSize(inspection.conclusion, maxWidth - 10);
          conclusionLines.forEach((line: string) => {
            checkPageBreak(6);
            pdf.text(line, margin + 5, yPos);
            yPos += 6;
          });
          pdf.setTextColor(0, 0, 0);
          yPos += 5;
        }

        const inspectionDetails = [];
        if (inspection.organic_status) {
          inspectionDetails.push({ label: "Organic Status", value: inspection.organic_status });
        }
        if (inspection.moisture_percent) {
          inspectionDetails.push({ label: "Moisture Content", value: `${inspection.moisture_percent}%` });
        }
        if (inspection.iso_codes && inspection.iso_codes.length > 0) {
          inspectionDetails.push({ label: "ISO Standards", value: inspection.iso_codes.join(", ") });
        }

        inspectionDetails.forEach(({ label, value }) => {
          checkPageBreak(12);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.text(`${label}:`, margin, yPos);
          pdf.setFont("helvetica", "normal");
          pdf.text(value, margin + 50, yPos);
          yPos += 7;
        });

        if (inspection.comments) {
          checkPageBreak(20);
          yPos += 3;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.text("Inspector Comments:", margin, yPos);
          yPos += 6;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          const commentLines = pdf.splitTextToSize(inspection.comments, maxWidth - 10);
          commentLines.forEach((line: string) => {
            checkPageBreak(6);
            pdf.text(line, margin + 5, yPos);
            yPos += 6;
          });
        }

        yPos += 5;
      }

      // Certificates Section
      if (certificates.length > 0) {
        checkPageBreak(40);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(16, 185, 129);
        pdf.text("Certificates Issued", margin, yPos);
        yPos += 8;
        
        pdf.setDrawColor(16, 185, 129);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        pdf.setTextColor(0, 0, 0);

        certificates.forEach((cert, index) => {
          checkPageBreak(30);
          
          pdf.setFillColor(245, 245, 245);
          pdf.roundedRect(margin, yPos, maxWidth, 25, 2, 2, 'F');
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.text(`Certificate ${index + 1}`, margin + 3, yPos + 6);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.text(`ID: ${cert.id.substring(0, 8).toUpperCase()}`, margin + 3, yPos + 11);
          pdf.text(`QR Token: ${cert.qr_token}`, margin + 3, yPos + 16);
          pdf.text(`Issued: ${new Date(cert.issued_at).toLocaleDateString()}`, margin + 3, yPos + 21);
          
          pdf.setTextColor(16, 185, 129);
          pdf.text(`Status: ${cert.revocation_status === 'active' ? 'Valid' : 'Revoked'}`, margin + 110, yPos + 16);
          pdf.setTextColor(0, 0, 0);
          
          yPos += 30;
        });
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
        pdf.text(
          "Generated by Agricultural Batch Tracking System",
          pageWidth / 2,
          pageHeight - 5,
          { align: "center" }
        );
      }

      // Save PDF
      const filename = `batch-journey-${batch.tracking_token}.pdf`;
      pdf.save(filename);
      
      toast.success("Batch journey report downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Download Journey Report (PDF)</span>
    </Button>
  );
};

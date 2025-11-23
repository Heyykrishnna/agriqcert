import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "./ui/button";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TrackingQRCodeProps {
  trackingToken: string;
  batchInfo?: {
    product_type: string;
    quantity: number;
    weight_unit: string;
  };
}

export const TrackingQRCode = ({ trackingToken, batchInfo }: TrackingQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current && trackingToken) {
      const trackingUrl = `${window.location.origin}/track/${trackingToken}`;
      
      QRCode.toCanvas(
        canvasRef.current,
        trackingUrl,
        {
          width: 200,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("QR Code generation error:", error);
            toast.error("Failed to generate tracking QR code");
          } else {
            const dataUrl = canvasRef.current?.toDataURL("image/png");
            if (dataUrl) {
              setQrDataUrl(dataUrl);
            }
          }
        }
      );
    }
  }, [trackingToken]);

  const handleDownload = () => {
    if (!qrDataUrl) {
      toast.error("QR code not ready");
      return;
    }

    const link = document.createElement("a");
    link.download = `tracking-${trackingToken}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success("Tracking QR code downloaded");
  };

  const handlePrintLabel = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print labels");
      return;
    }

    const labelHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Label - ${trackingToken}</title>
          <style>
            @page {
              size: 4in 3in;
              margin: 0.25in;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .label {
              text-align: center;
              border: 2px solid #000;
              padding: 15px;
              border-radius: 8px;
              background: white;
            }
            h1 {
              font-size: 18px;
              margin: 0 0 10px 0;
              color: #333;
            }
            .tracking {
              font-size: 16px;
              font-weight: bold;
              font-family: monospace;
              margin: 10px 0;
              color: #000;
            }
            .product-info {
              font-size: 14px;
              margin: 10px 0;
              color: #666;
            }
            img {
              margin: 10px 0;
            }
            .footer {
              font-size: 10px;
              margin-top: 10px;
              color: #888;
            }
            @media print {
              body {
                min-height: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <h1>Agricultural Batch</h1>
            ${batchInfo ? `
              <div class="product-info">
                ${batchInfo.product_type}<br/>
                ${batchInfo.quantity} ${batchInfo.weight_unit}
              </div>
            ` : ''}
            <img src="${qrDataUrl}" alt="Tracking QR Code" width="180" height="180" />
            <div class="tracking">${trackingToken}</div>
            <div class="footer">Scan to track batch status</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(labelHTML);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Batch Tracking Label</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={labelRef} className="flex flex-col items-center p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border">
          <canvas ref={canvasRef} className="rounded-lg" />
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Tracking Token</p>
            <p className="font-mono font-bold text-lg">{trackingToken}</p>
          </div>
          {batchInfo && (
            <div className="mt-2 text-center text-sm text-muted-foreground">
              <p>{batchInfo.product_type}</p>
              <p>{batchInfo.quantity} {batchInfo.weight_unit}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePrintLabel} variant="outline" className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print Label
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Scan this QR code to track the batch journey and verify authenticity
        </p>
      </CardContent>
    </Card>
  );
};

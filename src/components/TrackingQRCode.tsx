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
              size: A5;
              margin: 0.4in;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .label {
              width: 100%;
              max-width: 420px;
              background: #ffffff;
              border: 1px solid #dcdcdc;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              box-shadow: 0px 0px 6px rgba(0,0,0,0.1);
            }
            h1 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #222;
            }
            .product-info {
              font-size: 14px;
              color: #444;
              margin-bottom: 12px;
            }
            .qr-wrapper {
              margin: 12px 0;
              display: flex;
              justify-content: center;
            }
            .tracking {
              margin-top: 10px;
              font-size: 16px;
              font-family: monospace;
              font-weight: bold;
              color: #111;
            }
            .footer {
              margin-top: 14px;
              font-size: 11px;
              color: #666;
            }

            @media print {
              body {
                min-height: auto;
                background: white;
              }
              .label {
                box-shadow: none;
                border: 1px solid #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <h1>Batch Tracking Label</h1>

            ${batchInfo ? `
              <div class="product-info">
                <strong>${batchInfo.product_type}</strong><br/>
                ${batchInfo.quantity} ${batchInfo.weight_unit}
              </div>
            ` : ''}

            <div class="qr-wrapper">
              <img src="${qrDataUrl}" alt="Tracking QR Code" width="200" height="200" />
            </div>

            <div class="tracking">${trackingToken}</div>

            <div class="footer">Scan this code to verify and track the batch lifecycle</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
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

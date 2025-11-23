import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  token: string;
  size?: number;
}

export const QRCodeGenerator = ({ token, size = 256 }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current && token) {
      const verifyUrl = `${window.location.origin}/verify?token=${token}`;
      
      QRCode.toCanvas(
        canvasRef.current,
        verifyUrl,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("QR Code generation error:", error);
            toast.error("Failed to generate QR code");
          } else {
            // Store data URL for download
            const dataUrl = canvasRef.current?.toDataURL("image/png");
            if (dataUrl) {
              setQrDataUrl(dataUrl);
            }
          }
        }
      );
    }
  }, [token, size]);

  const handleDownload = () => {
    if (!qrDataUrl) {
      toast.error("QR code not ready");
      return;
    }

    const link = document.createElement("a");
    link.download = `certificate-qr-${token.substring(0, 8)}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success("QR code downloaded");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="border-2 border-border rounded-lg" />
      <Button onClick={handleDownload} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Download QR Code
      </Button>
    </div>
  );
};

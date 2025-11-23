import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRScanner from "@/components/QRScanner";
import { 
  QrCode, 
  Hash, 
  Zap, 
  Shield, 
  CheckCircle,
  Home,
  History,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ScanHistoryItem {
  token: string;
  type: "qr" | "token";
  timestamp: number;
  productType?: string;
}

const MobileScanner = () => {
  const navigate = useNavigate();
  const [manualToken, setManualToken] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    // Load scan history from localStorage
    const saved = localStorage.getItem("scan-history");
    if (saved) {
      try {
        setScanHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse scan history", e);
      }
    }
  }, []);

  const saveScanHistory = (item: ScanHistoryItem) => {
    const updated = [item, ...scanHistory.slice(0, 9)]; // Keep last 10
    setScanHistory(updated);
    localStorage.setItem("scan-history", JSON.stringify(updated));
  };

  const handleQRScan = async (token: string) => {
    try {
      setIsScanning(true);

      // Check if it's a VC QR token or batch tracking token
      if (token.startsWith("TRK-")) {
        // Batch tracking token
        const { data: batch } = await supabase
          .from("batches")
          .select("product_type")
          .eq("tracking_token", token)
          .single();

        saveScanHistory({
          token,
          type: "qr",
          timestamp: Date.now(),
          productType: batch?.product_type
        });

        navigate(`/track/${token}`);
      } else {
        // VC QR token
        const { data: vc } = await supabase
          .from("verifiable_credentials")
          .select(`
            *,
            batch:batch_id (product_type)
          `)
          .eq("qr_token", token)
          .single();

        saveScanHistory({
          token,
          type: "qr",
          timestamp: Date.now(),
          productType: vc?.batch?.product_type
        });

        navigate(`/batch-verify?token=${token}`);
      }

      toast.success("QR code scanned successfully!");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to verify QR code. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualVerify = () => {
    if (!manualToken.trim()) {
      toast.error("Please enter a token");
      return;
    }

    saveScanHistory({
      token: manualToken,
      type: "token",
      timestamp: Date.now()
    });

    if (manualToken.startsWith("TRK-")) {
      navigate(`/track/${manualToken}`);
    } else {
      navigate(`/batch-verify?token=${manualToken}`);
    }
  };

  const handleHistoryClick = (item: ScanHistoryItem) => {
    if (item.token.startsWith("TRK-")) {
      navigate(`/track/${item.token}`);
    } else {
      navigate(`/batch-verify?token=${item.token}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-safe">
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/10 p-2 rounded-lg">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AgroTrace Scanner</h1>
                <p className="text-xs opacity-90">Product Verification</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Quick Features */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs font-medium">Instant Scan</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs font-medium">Verified</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs font-medium">Authentic</p>
            </CardContent>
          </Card>
        </div>

        {/* Scanner Tabs */}
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scan" className="text-xs">
              <QrCode className="h-4 w-4 mr-1" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs">
              <Hash className="h-4 w-4 mr-1" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scan" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <QrCode className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold text-lg">Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Point your camera at the QR code on the product
                    </p>
                  </div>

                  <div className="rounded-lg overflow-hidden border-2 border-primary/20">
                    <QRScanner 
                      onScan={handleQRScan}
                    />
                  </div>

                  {isScanning && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Verifying...
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Ensure good lighting</p>
                        <p>• Hold steady and center the QR code</p>
                        <p>• Works with batch tracking and VC QR codes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <Hash className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold text-lg">Manual Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter tracking or QR token manually
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="token">Token / Tracking Code</Label>
                      <Input
                        id="token"
                        placeholder="TRK-XXXXXXXXXX or QR token"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                        className="text-center font-mono text-lg"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleManualVerify();
                        }}
                      />
                    </div>

                    <Button 
                      onClick={handleManualVerify} 
                      className="w-full"
                      size="lg"
                    >
                      Verify Product
                    </Button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      <strong>Example formats:</strong><br />
                      Tracking: TRK-ABC1234567<br />
                      QR Token: Various alphanumeric codes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <History className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold text-lg">Scan History</h3>
                    <p className="text-sm text-muted-foreground">
                      Recently verified products
                    </p>
                  </div>

                  {scanHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No scans yet</p>
                      <p className="text-xs">Your scan history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scanHistory.map((item, index) => (
                        <button
                          key={`${item.token}-${index}`}
                          onClick={() => handleHistoryClick(item)}
                          className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {item.type === "qr" ? (
                                  <QrCode className="h-4 w-4 text-primary flex-shrink-0" />
                                ) : (
                                  <Hash className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                                <p className="font-mono text-sm truncate">
                                  {item.token}
                                </p>
                              </div>
                              {item.productType && (
                                <p className="text-xs text-muted-foreground">
                                  {item.productType}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {scanHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setScanHistory([]);
                        localStorage.removeItem("scan-history");
                        toast.success("History cleared");
                      }}
                      className="w-full"
                    >
                      Clear History
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Secure Verification</p>
                <p className="text-xs text-muted-foreground">
                  All scans are verified against blockchain-anchored certificates. 
                  Works offline after initial load.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileScanner;

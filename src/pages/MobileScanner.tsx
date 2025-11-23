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
  Keyboard,
  Camera, 
  Shield, 
  CheckCircle,
  Home,
  History,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface ScanHistoryItem {
  token: string;
  type: string;
  timestamp: string;
}

const MobileScanner = () => {
  const navigate = useNavigate();
  const [manualToken, setManualToken] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('scanHistory');
    if (saved) {
      setScanHistory(JSON.parse(saved));
    }
  }, []);

  const saveScanHistory = (token: string, type: string) => {
    const newScan: ScanHistoryItem = {
      token,
      type,
      timestamp: new Date().toLocaleString()
    };
    const updated = [newScan, ...scanHistory].slice(0, 10);
    setScanHistory(updated);
    localStorage.setItem('scanHistory', JSON.stringify(updated));
  };

  const handleQRScan = async (scannedToken: string) => {
    setIsScanning(true);
    
    try {
      let token = scannedToken;
      
      // Extract token from full URL if needed
      if (scannedToken.includes('/track/')) {
        const matches = scannedToken.match(/\/track\/([^?]+)/);
        if (matches && matches[1]) {
          token = matches[1];
          navigate(`/track/${token}`);
          saveScanHistory(token, 'Batch Tracking');
          setIsScanning(false);
          return;
        }
      }
      
      if (scannedToken.includes('token=')) {
        const url = new URL(scannedToken);
        token = url.searchParams.get('token') || scannedToken;
      }

      // Check if it's a batch tracking token (starts with TRK-)
      if (token.startsWith('TRK-')) {
        navigate(`/track/${token}`);
        saveScanHistory(token, 'Batch Tracking');
        setIsScanning(false);
        return;
      }

      // Verify certificate token exists in the database
      const { data: credential, error } = await supabase
        .from("verifiable_credentials")
        .select("qr_token")
        .eq("qr_token", token)
        .maybeSingle();

      if (error) throw error;

      if (credential) {
        navigate(`/verify?token=${token}`);
        saveScanHistory(token, 'Certificate');
      } else {
        toast.error("Invalid QR code");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to process QR code");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualVerify = () => {
    if (!manualToken.trim()) {
      toast.error("Please enter a token");
      return;
    }

    if (manualToken.startsWith('TRK-')) {
      navigate(`/track/${manualToken}`);
      saveScanHistory(manualToken, 'Batch Tracking');
    } else {
      navigate(`/verify?token=${manualToken}`);
      saveScanHistory(manualToken, 'Certificate');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-safe">
      {/* Header - Mobile optimized */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AgriQCert Scanner
          </h1>
          <Link to="/">
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content - Mobile optimized */}
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-2xl">
        {/* Quick Features - Touch optimized */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 active:scale-95 transition-transform">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="p-2 sm:p-3 rounded-full bg-primary/20">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <p className="text-xs sm:text-sm font-semibold">Instant Scan</p>
            </div>
          </Card>
          
          <Card className="text-center p-3 sm:p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 active:scale-95 transition-transform">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="p-2 sm:p-3 rounded-full bg-secondary/20">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
              </div>
              <p className="text-xs sm:text-sm font-semibold">Verified</p>
            </div>
          </Card>
          
          <Card className="text-center p-3 sm:p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 active:scale-95 transition-transform">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="p-2 sm:p-3 rounded-full bg-accent/20">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <p className="text-xs sm:text-sm font-semibold">Authentic</p>
            </div>
          </Card>
        </div>

        {/* Tabs - Mobile optimized */}
        <Card className="border-2 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="scan" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto">
                <TabsTrigger value="scan" className="text-xs sm:text-sm font-semibold py-2.5 sm:py-2 min-h-[44px]">
                  <QrCode className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Scan</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="text-xs sm:text-sm font-semibold py-2.5 sm:py-2 min-h-[44px]">
                  <Keyboard className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Manual</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm font-semibold py-2.5 sm:py-2 min-h-[44px]">
                  <History className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scan" className="mt-0">
                <QRScanner onScan={handleQRScan} />
              </TabsContent>

              <TabsContent value="manual" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="token" className="text-sm sm:text-base font-semibold mb-2 block">
                      Enter Token
                    </Label>
                    <Input
                      id="token"
                      placeholder="e.g., TRK-ABC123 or VC-XYZ789"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="text-base sm:text-lg min-h-[44px]"
                    />
                  </div>
                  <Button 
                    onClick={handleManualVerify}
                    className="w-full min-h-[48px]"
                    size="lg"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Verify Token
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {scanHistory.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <History className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">No scan history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scanHistory.map((item, index) => (
                      <Card key={index} className="p-3 sm:p-4 bg-muted/30 active:scale-[0.98] transition-transform">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {item.type === 'Certificate' ? (
                                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                              ) : (
                                <Package className="h-4 w-4 text-secondary flex-shrink-0" />
                              )}
                              <span className="text-xs font-semibold text-muted-foreground">
                                {item.type}
                              </span>
                            </div>
                            <p className="font-mono text-xs sm:text-sm font-bold truncate">
                              {item.token}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.timestamp}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-[40px] min-w-[60px]"
                            onClick={() => {
                              if (item.type === 'Certificate') {
                                navigate(`/verify?token=${item.token}`);
                              } else {
                                navigate(`/track/${item.token}`);
                              }
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setScanHistory([]);
                        localStorage.removeItem('scanHistory');
                        toast.success('History cleared');
                      }}
                      className="w-full min-h-[44px]"
                    >
                      Clear History
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Banner - Mobile optimized */}
        <Card className="mt-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold">🔒 Secure Verification</p>
                <p className="text-xs text-muted-foreground">
                  Scans are verified within the app. No external redirects.
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
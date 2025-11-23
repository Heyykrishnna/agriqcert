import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, Upload, FileCheck, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QRScanner from "@/components/QRScanner";
import TokenInput from "@/components/TokenInput";
import VerificationResult from "@/components/VerificationResult";

const VerifyPortal = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [stats, setStats] = useState({
    today: 0,
    valid: 0,
    total: 0,
  });

  const handleVerify = async (token: string) => {
    setLoading(true);
    try {
      // Fetch credential with token
      const { data: credential, error: credError } = await supabase
        .from("verifiable_credentials")
        .select("*")
        .eq("qr_token", token)
        .maybeSingle();

      if (credError) throw credError;

      if (!credential) {
        toast.error("Certificate not found. Invalid token.");
        return;
      }

      // Fetch related batch data
      const { data: batch, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("id", credential.batch_id)
        .single();

      if (batchError) throw batchError;

      // Fetch related inspection data
      const { data: inspection, error: inspError } = await supabase
        .from("inspections")
        .select("*")
        .eq("id", credential.inspection_id)
        .single();

      if (inspError) throw inspError;

      setVerificationData({ credential, batch, inspection });

      // Update stats
      setStats(prev => ({
        today: prev.today + 1,
        valid: credential.revocation_status === "active" ? prev.valid + 1 : prev.valid,
        total: prev.total + 1,
      }));

      toast.success("Certificate verified successfully!");
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error("Failed to verify certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold">Verification Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Certificate Verification</h2>
          <p className="text-muted-foreground">Verify agricultural product certifications instantly</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verifications Today</CardTitle>
              <ScanLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground">Certificates checked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valid Certificates</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.valid}</div>
              <p className="text-xs text-muted-foreground">Active & verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {verificationData ? (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setVerificationData(null)}
              className="mb-4"
            >
              Verify Another Certificate
            </Button>
            <VerificationResult
              credential={verificationData.credential}
              batch={verificationData.batch}
              inspection={verificationData.inspection}
            />
          </div>
        ) : (
          <Tabs defaultValue="scanner" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scanner">
                <ScanLine className="h-4 w-4 mr-2" />
                Scan QR Code
              </TabsTrigger>
              <TabsTrigger value="token">
                <Upload className="h-4 w-4 mr-2" />
                Enter Token
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scanner" className="mt-6">
              <QRScanner onScan={handleVerify} />
            </TabsContent>
            <TabsContent value="token" className="mt-6">
              <TokenInput onVerify={handleVerify} loading={loading} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default VerifyPortal;

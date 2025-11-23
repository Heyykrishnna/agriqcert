import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, Upload, Shield, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QRScanner from "@/components/QRScanner";
import TokenInput from "@/components/TokenInput";
import VerificationResult from "@/components/VerificationResult";
import FloatingParticles from "@/components/FloatingParticles";
import { Link } from "react-router-dom";
import gsap from "gsap";

const PublicVerify = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".hero-section", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out"
      });

      gsap.from(cardRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        ease: "back.out(1.2)"
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      handleVerify(token);
    }
  }, [searchParams]);

  const handleVerify = async (token: string) => {
    setLoading(true);
    try {
      // Fetch credential with token (publicly accessible due to RLS policy)
      const { data: credential, error: credError } = await supabase
        .from("verifiable_credentials")
        .select("*")
        .eq("qr_token", token)
        .maybeSingle();

      if (credError) throw credError;

      if (!credential) {
        toast.error("Certificate not found. Invalid token.");
        setVerificationData(null);
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
      toast.success("Certificate verified successfully!");
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error("Failed to verify certificate");
      setVerificationData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      <FloatingParticles />
      
      <header ref={headerRef} className="border-b-2 bg-card/90 backdrop-blur-xl border-primary/20 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AgroTrace Verification
            </h1>
          </Link>
          <div className="flex gap-3">
            <Link to="/batch-verify">
              <Button variant="outline" size="lg" className="font-semibold border-2 hover:border-secondary transition-all">
                Batch Verify
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="hero-section mb-12 text-center space-y-4">
          <div className="inline-block bg-gradient-to-r from-accent/20 to-primary/20 px-6 py-2 rounded-full border-2 border-primary/30 mb-4">
            <span className="text-base font-bold text-primary">🔍 Certificate Verification</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Verify Agricultural Product Certificate
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Enter a verification token or scan a QR code to verify authenticity instantly
          </p>
        </div>

        {verificationData ? (
          <div className="space-y-6 max-w-5xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setVerificationData(null)}
              size="lg"
              className="mb-6 font-bold border-2 hover:border-primary transition-all"
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
          <Card ref={cardRef} className="max-w-4xl mx-auto border-2 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-3xl font-bold">Verification Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="token" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50">
                  <TabsTrigger value="token" className="text-base font-semibold">
                    <Upload className="h-5 w-5 mr-2" />
                    Enter Token
                  </TabsTrigger>
                  <TabsTrigger value="scanner" className="text-base font-semibold">
                    <ScanLine className="h-5 w-5 mr-2" />
                    Scan QR Code
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="token" className="mt-8">
                  <TokenInput onVerify={handleVerify} loading={loading} />
                </TabsContent>
                <TabsContent value="scanner" className="mt-8">
                  <QRScanner onScan={handleVerify} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <div className="mt-16 text-center">
          <div className="inline-block bg-card/50 backdrop-blur-sm border-2 rounded-2xl px-8 py-4 shadow-xl">
            <p className="text-muted-foreground font-medium text-lg mb-2">
              This is a public verification portal. No login required.
            </p>
            <p className="text-muted-foreground font-medium">
              For businesses: <Link to="/auth" className="text-primary hover:underline font-bold">Sign in to access full platform</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicVerify;

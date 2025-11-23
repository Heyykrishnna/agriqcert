import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Upload, FileText, CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import gsap from "gsap";

interface VerificationResult {
  token: string;
  status: 'success' | 'error' | 'loading';
  credential?: any;
  batch?: any;
  inspection?: any;
  error?: string;
}

const BatchVerify = () => {
  const [tokens, setTokens] = useState("");
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [verifying, setVerifying] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      gsap.from(headerRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      // Animate hero section
      gsap.from(heroRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out"
      });

      // Animate card
      gsap.from(cardRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        ease: "back.out(1.2)"
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      gsap.from(resultsRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      });

      const rows = resultsRef.current.querySelectorAll('tbody tr');
      gsap.from(rows, {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out"
      });
    }
  }, [results]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTokens(content);
      
      gsap.to(e.target, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    };
    reader.readAsText(file);
  };

  const parseTokens = (input: string): string[] => {
    return input
      .split(/[\n,;]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
  };

  const verifyToken = async (token: string): Promise<VerificationResult> => {
    try {
      const { data: credential, error: credError } = await supabase
        .from("verifiable_credentials")
        .select("*")
        .eq("qr_token", token)
        .maybeSingle();

      if (credError) throw credError;

      if (!credential) {
        return {
          token,
          status: 'error',
          error: 'Certificate not found'
        };
      }

      const { data: batch } = await supabase
        .from("batches")
        .select("*")
        .eq("id", credential.batch_id)
        .single();

      const { data: inspection } = await supabase
        .from("inspections")
        .select("*")
        .eq("id", credential.inspection_id)
        .single();

      return {
        token,
        status: 'success',
        credential,
        batch,
        inspection
      };
    } catch (error: any) {
      return {
        token,
        status: 'error',
        error: error.message || 'Verification failed'
      };
    }
  };

  const handleBatchVerify = async () => {
    const tokenList = parseTokens(tokens);
    
    if (tokenList.length === 0) {
      toast.error("Please enter at least one token");
      return;
    }

    if (tokenList.length > 100) {
      toast.error("Maximum 100 tokens allowed per batch");
      return;
    }

    setVerifying(true);
    setResults(tokenList.map(token => ({ token, status: 'loading' as const })));

    const verificationPromises = tokenList.map(token => verifyToken(token));
    const results = await Promise.all(verificationPromises);
    
    setResults(results);
    setVerifying(false);

    const successCount = results.filter(r => r.status === 'success').length;
    toast.success(`Verified ${successCount} of ${tokenList.length} certificates`);
  };

  const exportResults = () => {
    const csv = [
      ['Token', 'Status', 'Product Type', 'Quantity', 'Origin Country', 'Conclusion', 'Error'].join(','),
      ...results.map(r => [
        r.token,
        r.status,
        r.batch?.product_type || '',
        r.batch?.quantity || '',
        r.batch?.origin_country || '',
        r.inspection?.conclusion || '',
        r.error || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-verification-${new Date().toISOString()}.csv`;
    a.click();

    gsap.to('.export-button', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <header ref={headerRef} className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img src="/AGROTRACELOGO.png" className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AgroTrace
            </h1>
          </Link>
          <div className="flex gap-3">
            <Link to="/public-verify">
              <Button variant="outline" size="lg" className="font-semibold border-2 hover:border-primary transition-all">
                Single Verify
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div ref={heroRef} className="mb-12 text-center space-y-4">
          <div className="inline-block">
            <Badge className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-accent/20 to-primary/20 border-primary/30">
              ✨ Batch Verification Portal
            </Badge>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Verify Multiple Certificates
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Process up to 100 verification tokens simultaneously with instant results
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Input Card */}
          <Card ref={cardRef} className="border-2 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <Upload className="h-8 w-8 text-primary" />
                Enter Verification Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Tokens (one per line or comma-separated)
                </label>
                <Textarea
                  placeholder="Enter verification tokens...&#10;&#10;Example:&#10;abc123def456ghi789&#10;jkl012mno345pqr678&#10;&#10;or: token1, token2, token3"
                  value={tokens}
                  onChange={(e) => setTokens(e.target.value)}
                  rows={8}
                  className="font-mono text-base border-2 focus:border-primary transition-all resize-none bg-background/50"
                />
              </div>

              <div className="space-y-4">
                <label className="text-lg font-semibold text-foreground flex items-center gap-6">
                  <Upload className="h-5 w-5 text-secondary" />
                  Or upload a file (.txt, .csv)
                </label>
                <Input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer border-2 hover:border-secondary transition-all file:bg-secondary file:text-secondary-foreground file:font-semibold file:px-4 file:rounded-md file:border-0 file:mr-4"
                />
              </div>

              <Button 
                onClick={handleBatchVerify} 
                disabled={verifying || !tokens.trim()}
                size="lg"
                className="w-full text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-xl h-14 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {verifying ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Verifying Certificates...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6" />
                      Verify Batch
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {results.length > 0 && (
            <Card ref={resultsRef} className="border-2 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-primary to-secondary"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-6 pt-8">
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  Verification Results
                  <Badge className="ml-2 px-4 py-1 text-lg bg-primary/20 text-primary border-primary">
                    {results.length}
                  </Badge>
                </CardTitle>
                <Button 
                  onClick={exportResults} 
                  variant="outline" 
                  size="lg"
                  className="font-bold border-2 hover:border-accent hover:text-accent transition-all export-button shadow-lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border-2 overflow-hidden shadow-inner">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                      <TableRow className="border-b-2">
                        <TableHead className="font-bold text-base">Status</TableHead>
                        <TableHead className="font-bold text-base">Token</TableHead>
                        <TableHead className="font-bold text-base">Product Type</TableHead>
                        <TableHead className="font-bold text-base">Quantity</TableHead>
                        <TableHead className="font-bold text-base">Origin</TableHead>
                        <TableHead className="font-bold text-base">Conclusion</TableHead>
                        <TableHead className="font-bold text-base">Blockchain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, idx) => (
                        <TableRow 
                          key={idx} 
                          className="hover:bg-primary/5 transition-colors border-b"
                        >
                          <TableCell>
                            {result.status === 'loading' && (
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            )}
                            {result.status === 'success' && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                            {result.status === 'error' && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-medium">
                            {result.token.substring(0, 20)}...
                          </TableCell>
                          <TableCell className="font-semibold">{result.batch?.product_type || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {result.batch?.quantity 
                              ? `${result.batch.quantity} ${result.batch.weight_unit}`
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="font-medium">{result.batch?.origin_country || '-'}</TableCell>
                          <TableCell>
                            {result.inspection?.conclusion ? (
                              <Badge 
                                className={`font-bold shadow-sm ${
                                  result.inspection.conclusion === 'approved' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-destructive text-destructive-foreground'
                                }`}
                              >
                                {result.inspection.conclusion}
                              </Badge>
                            ) : result.error ? (
                              <span className="text-sm text-destructive font-semibold">{result.error}</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {result.credential?.blockchain_tx_hash ? (
                              <Badge className="font-semibold bg-secondary/20 text-secondary border-secondary">
                                ✓ Anchored
                              </Badge>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-card/50 backdrop-blur-sm border-2 rounded-2xl px-8 py-4 shadow-xl">
            <p className="text-muted-foreground font-medium text-lg">
              ⚡ Maximum 100 tokens per batch verification
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BatchVerify;

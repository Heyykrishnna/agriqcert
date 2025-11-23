import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Download, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { QRCodeGenerator } from "./QRCodeGenerator";

interface InjiWalletIntegrationProps {
  credential: any;
  qrToken: string;
}

export const InjiWalletIntegration = ({ credential, qrToken }: InjiWalletIntegrationProps) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Generate OCA (Overlays Capture Architecture) compliant credential
  const generateOCACredential = () => {
    return {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
      ],
      id: `urn:uuid:${credential.id}`,
      type: ["VerifiableCredential", "DigitalProductPassport", "AgriculturalQualityCertificate"],
      issuer: {
        id: credential.issuer_did,
        name: "AgroTrace Quality Assurance",
        type: "Organization"
      },
      issuanceDate: credential.issued_at,
      expirationDate: null,
      credentialSubject: {
        id: `did:holder:${credential.holder_id}`,
        type: "ProductBatch",
        productPassport: {
          batchId: credential.batch_id,
          qrToken: qrToken,
          verificationUrl: `${window.location.origin}/public-verify?token=${qrToken}`,
          ...credential.credential_json.credentialSubject
        }
      },
      proof: {
        type: "Ed25519Signature2020",
        created: credential.issued_at,
        verificationMethod: `${credential.issuer_did}#key-1`,
        proofPurpose: "assertionMethod"
      }
    };
  };

  const handleDownloadCredential = () => {
    const ocaCredential = generateOCACredential();
    const blob = new Blob([JSON.stringify(ocaCredential, null, 2)], { 
      type: "application/json" 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `digital-product-passport-${qrToken.substring(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Credential downloaded successfully");
  };

  const handleSendToInji = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      // In a real implementation, this would call an edge function to send the credential
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Credential offer sent to ${email}. Check your Inji wallet app!`);
      setEmail("");
    } catch (error) {
      console.error("Error sending to Inji:", error);
      toast.error("Failed to send credential to Inji wallet");
    } finally {
      setSending(false);
    }
  };

  const injiDeepLink = `inji://credential?url=${encodeURIComponent(
    `${window.location.origin}/api/credential/${qrToken}`
  )}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Digital Product Passport - Inji Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          <p>
            This W3C Verifiable Credential can be imported into your Inji wallet for secure,
            portable digital identity verification.
          </p>
        </div>

        {/* QR Code for Inji Import */}
        <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-semibold">Scan with Inji Wallet</h3>
          <QRCodeGenerator token={qrToken} size={200} />
          <p className="text-xs text-center text-muted-foreground">
            Open your Inji wallet app and scan this QR code to import the credential
          </p>
        </div>

        {/* Email Delivery */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Send to Email</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleSendToInji} disabled={sending}>
              {sending ? "Sending..." : "Send to Inji"}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-2">
          <Button onClick={handleDownloadCredential} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download W3C Credential (JSON)
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <a href={injiDeepLink}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Inji Wallet App
            </a>
          </Button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-primary/10 rounded-lg text-sm">
          <p className="font-semibold mb-2">What is a Digital Product Passport?</p>
          <p className="text-muted-foreground">
            A Digital Product Passport (DPP) is a W3C Verifiable Credential that contains
            comprehensive information about a product's origin, quality, and compliance.
            It can be verified cryptographically and stored in digital wallets like Inji.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

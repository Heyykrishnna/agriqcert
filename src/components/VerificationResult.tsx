import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { BlockchainAnchor } from "./BlockchainAnchor";

interface VerificationResultProps {
  credential: any;
  batch: any;
  inspection: any;
}

const VerificationResult = ({ credential, batch, inspection }: VerificationResultProps) => {
  const isActive = credential.revocation_status === "active";
  const isRevoked = credential.revocation_status === "revoked";

  return (
    <div className="space-y-6">
      {/* Blockchain Verification - Show first if exists */}
      {credential.blockchain_tx_hash && (
        <BlockchainAnchor credential={credential} />
      )}

      {/* Status Card */}
      <Card className={isActive ? "border-green-500" : "border-red-500"}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <CardTitle>
              {isActive ? "Valid Certificate" : "Invalid Certificate"}
            </CardTitle>
          </div>
          <CardDescription>
            {isActive
              ? "This certificate is authentic and currently active"
              : "This certificate has been revoked or is invalid"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={isActive ? "default" : "destructive"} className="ml-2">
                {credential.revocation_status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Issued:</span>
              <span className="ml-2 font-medium">
                {format(new Date(credential.issued_at), "PPP")}
              </span>
            </div>
            {isRevoked && credential.revoked_at && (
              <>
                <div>
                  <span className="text-sm text-muted-foreground">Revoked:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(credential.revoked_at), "PPP")}
                  </span>
                </div>
                {credential.revocation_reason && (
                  <div>
                    <span className="text-sm text-muted-foreground">Reason:</span>
                    <span className="ml-2 font-medium">{credential.revocation_reason}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm text-muted-foreground">Product Type:</span>
              <span className="font-medium">{batch.product_type}</span>
            </div>
            {batch.variety && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm text-muted-foreground">Variety:</span>
                <span className="font-medium">{batch.variety}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <span className="font-medium">
                {batch.quantity} {batch.weight_unit}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm text-muted-foreground">Harvest Date:</span>
              <span className="font-medium">
                {format(new Date(batch.harvest_date), "PP")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm text-muted-foreground">Origin:</span>
              <span className="font-medium">
                {batch.origin_state}, {batch.origin_country}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm text-muted-foreground">Destination:</span>
              <span className="font-medium">{batch.destination_country}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Results */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm text-muted-foreground">Conclusion:</span>
              <Badge variant={inspection.conclusion === "Approved" ? "default" : "secondary"}>
                {inspection.conclusion}
              </Badge>
            </div>
            {inspection.organic_status && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm text-muted-foreground">Organic Status:</span>
                <span className="font-medium">{inspection.organic_status}</span>
              </div>
            )}
            {inspection.moisture_percent && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm text-muted-foreground">Moisture:</span>
                <span className="font-medium">{inspection.moisture_percent}%</span>
              </div>
            )}
            {inspection.iso_codes && inspection.iso_codes.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm text-muted-foreground">ISO Standards:</span>
                <span className="font-medium">{inspection.iso_codes.join(", ")}</span>
              </div>
            )}
            {inspection.completed_date && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm text-muted-foreground">Inspection Date:</span>
                <span className="font-medium">
                  {format(new Date(inspection.completed_date), "PP")}
                </span>
              </div>
            )}
            {inspection.comments && (
              <div>
                <span className="text-sm text-muted-foreground">Comments:</span>
                <p className="mt-1 text-sm">{inspection.comments}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credential JSON */}
      <Card>
        <CardHeader>
          <CardTitle>Verifiable Credential</CardTitle>
          <CardDescription>Full W3C Verifiable Credential (VC) in JSON format</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(credential.credential_json, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationResult;

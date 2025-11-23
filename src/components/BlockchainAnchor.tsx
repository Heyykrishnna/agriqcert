import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, ExternalLink, Shield, Clock } from "lucide-react";
import { format } from "date-fns";

interface BlockchainAnchorProps {
  credential: any;
}

export const BlockchainAnchor = ({ credential }: BlockchainAnchorProps) => {
  if (!credential.blockchain_tx_hash) {
    return null;
  }

  const getBlockchainExplorerUrl = (network: string, txHash: string) => {
    const explorers: { [key: string]: string } = {
      'ethereum': `https://etherscan.io/tx/${txHash}`,
      'ethereum-testnet': `https://sepolia.etherscan.io/tx/${txHash}`,
      'polygon': `https://polygonscan.com/tx/${txHash}`,
      'polygon-testnet': `https://mumbai.polygonscan.com/tx/${txHash}`,
      'bitcoin': `https://blockstream.info/tx/${txHash}`,
    };
    
    return explorers[network] || explorers['polygon-testnet'];
  };

  const explorerUrl = getBlockchainExplorerUrl(
    credential.blockchain_network || 'polygon-testnet',
    credential.blockchain_tx_hash
  );

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Blockchain Verification
          <Badge variant="outline" className="ml-auto">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Anchored
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Network
            </h4>
            <p className="text-sm font-mono capitalize">
              {credential.blockchain_network}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Transaction Hash
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono truncate flex-1">
                {credential.blockchain_tx_hash}
              </p>
              <Button
                size="sm"
                variant="outline"
                asChild
              >
                <a 
                  href={explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View
                </a>
              </Button>
            </div>
          </div>

          {credential.blockchain_block_number && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                Block Number
              </h4>
              <p className="text-sm font-mono">
                {credential.blockchain_block_number.toLocaleString()}
              </p>
            </div>
          )}

          {credential.credential_hash && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                Credential Hash (SHA-256)
              </h4>
              <p className="text-xs font-mono break-all text-muted-foreground">
                {credential.credential_hash}
              </p>
            </div>
          )}

          {credential.blockchain_anchored_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Clock className="h-4 w-4" />
              <span>
                Anchored on {format(new Date(credential.blockchain_anchored_at), "PPpp")}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 bg-background rounded-lg text-sm space-y-2">
          <p className="font-semibold">Blockchain Proof of Existence</p>
          <p className="text-muted-foreground">
            This credential has been permanently anchored to the blockchain, 
            providing cryptographic proof of its existence and integrity. 
            The credential's hash is stored on-chain and can be independently verified.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface TokenInputProps {
  onVerify: (token: string) => void;
  loading?: boolean;
}

const TokenInput = ({ onVerify, loading }: TokenInputProps) => {
  const [token, setToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onVerify(token.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Token</CardTitle>
        <CardDescription>Manually enter the verification token from the certificate</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter verification token..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading || !token.trim()}>
            <Search className="h-5 w-5 mr-2" />
            {loading ? "Verifying..." : "Verify Certificate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TokenInput;

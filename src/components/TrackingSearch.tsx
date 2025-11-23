import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Search, Package, Clock, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const RECENT_SEARCHES_KEY = "recentTrackingSearches";

const trackingTokenSchema = z.string()
  .trim()
  .min(1, "Please enter a tracking token")
  .max(50, "Tracking token is too long")
  .regex(/^TRK-[A-Z0-9]+$/, "Invalid tracking token format. Should be TRK-XXXXXXXXXX");

export const TrackingSearch = () => {
  const [token, setToken] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5)); // Max 5 items
        }
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  const saveToRecentSearches = (searchToken: string) => {
    try {
      // Remove duplicate if exists and add to beginning
      const updated = [
        searchToken,
        ...recentSearches.filter(t => t !== searchToken)
      ].slice(0, 5); // Keep only last 5

      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    toast.success("Recent searches cleared");
  };

  const removeRecentSearch = (searchToken: string) => {
    const updated = recentSearches.filter(t => t !== searchToken);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSearching(true);
      
      // Validate tracking token
      const validatedToken = trackingTokenSchema.parse(token);
      
      // Save to recent searches
      saveToRecentSearches(validatedToken);
      
      // Navigate to tracking page
      navigate(`/track/${validatedToken}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Invalid tracking token");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecentSearchClick = (searchToken: string) => {
    navigate(`/track/${searchToken}`);
  };

  return (
    <section className="py-20 px-6 bg-muted/50">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Track Your Batch</CardTitle>
            <CardDescription className="text-base">
              Enter your tracking token to view real-time status, journey timeline, and certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter tracking token (e.g., TRK-AB12CD34EF)"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  className="h-12 pr-12 text-lg font-mono"
                  maxLength={50}
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isSearching || !token.trim()}
              >
                {isSearching ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Track Batch
                  </>
                )}
              </Button>
            </form>
            
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Recent Searches</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((searchToken) => (
                    <Badge
                      key={searchToken}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 px-3 py-1.5 font-mono text-xs group relative pr-8"
                      onClick={() => handleRecentSearchClick(searchToken)}
                    >
                      {searchToken}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(searchToken);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Where to find your tracking token:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Check your batch submission confirmation email</li>
                <li>• Scan the QR code on your batch label</li>
                <li>• View it in your exporter dashboard under "My Batches"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Search, Package, Clock, X, QrCode, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleSampleTokenClick = (sampleToken: string) => {
    setToken(sampleToken);
    toast.success("Sample token loaded! Click 'Track Batch' to see demo");
  };

  const handleQRScan = () => {
    navigate("/mobile-scanner");
    toast.info("Opening QR scanner...");
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#0f1419] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10b981]/10 rounded-full blur-[150px]"></div>

      <div className="container mx-auto max-w-5xl px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-block bg-white/5 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10">
            <span className="text-sm font-bold bg-gradient-to-r from-[#10b981] to-[#34d399] bg-clip-text text-transparent">Real-Time Tracking</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Track Your Agricultural Batch
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            Monitor your batch's journey from farm to destination with complete transparency. View certifications, quality reports, and real-time location updates.
          </p>
        </div>

        {/* Toggle Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="lg"
            className="gap-3 bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white/50 transition-all duration-300 px-8 py-6 text-lg font-semibold group"
            variant="outline"
          >
            <Package className="h-6 w-6 text-[#10b981] group-hover:scale-110 transition-transform" />
            Track Your Batch
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 ml-2" />
            ) : (
              <ChevronDown className="h-5 w-5 ml-2" />
            )}
          </Button>
        </div>

        {/* Expandable Tracking Section */}
        <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg">
                <Package className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-black text-white mb-3">Track Your Batch</CardTitle>
              <CardDescription className="text-lg text-white/60">
                Enter your tracking token to view real-time status, journey timeline, and certificates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter tracking token (e.g., TRK-AB12CD34EF)"
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    className="h-14 pr-12 text-lg font-mono bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#10b981] transition-all"
                    maxLength={50}
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    type="submit"
                    className="h-14 text-base font-bold bg-white text-black hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg md:col-span-2"
                    disabled={isSearching || !token.trim()}
                  >
                    {isSearching ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Track Batch
                      </>
                    )}
                  </Button>

                  {/* QR Scanner button - Only visible on mobile */}
                  <Button
                    type="button"
                    onClick={handleQRScan}
                    className="h-14 text-base font-bold bg-white/10 backdrop-blur-xl text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 md:hidden"
                    variant="outline"
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    Scan QR Code
                  </Button>
                </div>
              </form>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="rounded-xl bg-white/5 backdrop-blur-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Clock className="h-4 w-4 text-white/60" />
                      <span>Recent Searches</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="h-auto p-1 text-xs text-white/60 hover:text-white hover:bg-white/10"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((searchToken) => (
                      <Badge
                        key={searchToken}
                        variant="secondary"
                        className="cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 font-mono text-xs group relative pr-10 transition-all hover:scale-105"
                        onClick={() => handleRecentSearchClick(searchToken)}
                      >
                        {searchToken}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(searchToken);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                          aria-label="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Section */}
              <div className="rounded-xl bg-gradient-to-br from-[#10b981]/10 to-[#059669]/10 p-5 border border-[#10b981]/20">
                <p className="text-sm font-bold text-white mb-3">
                  Where to find your tracking token:
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">•</span>
                    <span>Check your batch submission confirmation email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">•</span>
                    <span>Scan the QR code on your batch label</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">•</span>
                    <span>View it in your exporter dashboard under "My Batches"</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};


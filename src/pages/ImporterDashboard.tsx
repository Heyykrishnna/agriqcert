import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  DollarSign,
  Search,
  Filter,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { DashboardProfileMenu } from "@/components/DashboardProfileMenu";
import { AvailableBatches } from "@/components/AvailableBatches";
import { MarketPriceComparison } from "@/components/MarketPriceComparison";
import { BatchInquiries } from "@/components/BatchInquiries";
import { MarketInsights } from "@/components/MarketInsights";
import { toast } from "sonner";

interface DashboardStats {
  totalInquiries: number;
  pendingInquiries: number;
  approvedInquiries: number;
  availableBatches: number;
}

const ImporterDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalInquiries: 0,
    pendingInquiries: 0,
    approvedInquiries: 0,
    availableBatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch inquiries stats
      const { data: inquiries } = await supabase
        .from("batch_inquiries")
        .select("status")
        .eq("importer_id", user?.id);

      const totalInquiries = inquiries?.length || 0;
      const pendingInquiries = inquiries?.filter(i => i.status === "pending").length || 0;
      const approvedInquiries = inquiries?.filter(i => i.status === "approved").length || 0;

      // Fetch available batches with prices
      const { data: prices } = await supabase
        .from("market_prices")
        .select("id")
        .eq("availability_status", "available");

      setStats({
        totalInquiries,
        pendingInquiries,
        approvedInquiries,
        availableBatches: prices?.length || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Importer Dashboard</h1>
                <p className="text-sm text-muted-foreground">Source quality products globally</p>
              </div>
            </div>
            <DashboardProfileMenu userEmail={user?.email || ""} onSignOut={handleSignOut} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Batches</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableBatches}</div>
              <p className="text-xs text-muted-foreground">Ready to order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInquiries}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingInquiries}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedInquiries}</div>
              <p className="text-xs text-muted-foreground">Ready to proceed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="price-compare">Price Comparison</TabsTrigger>
            <TabsTrigger value="inquiries">My Inquiries</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace">
            <AvailableBatches onInquirySubmit={fetchStats} />
          </TabsContent>

          <TabsContent value="price-compare">
            <MarketPriceComparison />
          </TabsContent>

          <TabsContent value="inquiries">
            <BatchInquiries onStatusChange={fetchStats} />
          </TabsContent>

          <TabsContent value="insights">
            <MarketInsights />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ImporterDashboard;

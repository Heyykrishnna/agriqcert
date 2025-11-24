import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BatchSubmissionForm } from "@/components/BatchSubmissionForm";
import { BatchList } from "@/components/BatchList";
import { DashboardProfileMenu } from "@/components/DashboardProfileMenu";
import { BatchPricingManagement } from "@/components/BatchPricingManagement";
import { Package, FileCheck, CheckCircle, CircleChevronLeft, Link } from "lucide-react";
import { ExporterInquiries } from "@/components/ExporterInquiries";


const ExporterDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    certified: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: batches } = await supabase
        .from("batches")
        .select("status")
        .eq("exporter_id", user.id);

      if (batches) {
        setStats({
          total: batches.length,
          pending: batches.filter((b) => b.status === "Submitted" || b.status === "Under Inspection").length,
          certified: batches.filter((b) => b.status === "Certified").length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
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
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <a href="/" className="flex ietms-center gap-2">
              <CircleChevronLeft className="h-6 w-6"/>
            </a>
          <h1 className="text-2xl font-bold">Exporter Dashboard</h1>
          <DashboardProfileMenu 
            userEmail={user?.email || ""} 
            onSignOut={handleSignOut}
          />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Inspections</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Certified Batches</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.certified}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Batch Management */}
        <Tabs defaultValue="batches" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="batches">My Batches</TabsTrigger>
            <TabsTrigger value="submit">Submit New Batch</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="batches" className="mt-6">
            <BatchList />
          </TabsContent>

          <TabsContent value="submit" className="mt-6">
            <BatchSubmissionForm onSuccess={fetchStats} />
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
            <BatchPricingManagement />
          </TabsContent>
          <TabsContent value="inquiries" className="mt-6">
            <ExporterInquiries />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ExporterDashboard;

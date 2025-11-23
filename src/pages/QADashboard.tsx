import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Package, Award } from "lucide-react";
import { AvailableBatches } from "@/components/AvailableBatches";
import { AssignedInspections } from "@/components/AssignedInspections";
import { DashboardProfileMenu } from "@/components/DashboardProfileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const QADashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    issued: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: inspections, error } = await supabase
        .from("inspections")
        .select("status, verifiable_credentials(id)")
        .eq("qa_agency_id", user.id);

      if (error) throw error;

      setStats({
        assigned: inspections?.length || 0,
        completed: inspections?.filter((i) => i.status === "Completed").length || 0,
        issued: inspections?.filter((i) => i.verifiable_credentials && i.verifiable_credentials.length > 0).length || 0,
      });
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
          <h1 className="text-2xl font-bold">QA Dashboard</h1>
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
              <CardTitle className="text-sm font-medium">Assigned Inspections</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.issued}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Batch Management */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="available">Available Batches</TabsTrigger>
            <TabsTrigger value="assigned">My Inspections</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <AvailableBatches />
          </TabsContent>

          <TabsContent value="assigned" className="mt-6">
            <AssignedInspections />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default QADashboard;

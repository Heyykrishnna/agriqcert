import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardProfileMenu } from "@/components/DashboardProfileMenu";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { Users, Package, ClipboardCheck, Award, CircleChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserStats {
  totalUsers: number;
  exporters: number;
  qaAgencies: number;
  importers: number;
}

interface BatchStats {
  total: number;
  submitted: number;
  underInspection: number;
  certified: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  organization_name: string | null;
  created_at: string;
  roles: string[];
}

interface Batch {
  id: string;
  product_type: string;
  quantity: number;
  weight_unit: string;
  status: string;
  tracking_token: string;
  created_at: string;
  profiles: {
    email: string;
    organization_name: string | null;
  } | null;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    exporters: 0,
    qaAgencies: 0,
    importers: 0,
  });
  const [batchStats, setBatchStats] = useState<BatchStats>({
    total: 0,
    submitted: 0,
    underInspection: 0,
    certified: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchBatches();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch user statistics
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role");

      if (rolesError) throw rolesError;

      const roleCounts = roles?.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setUserStats({
        totalUsers: profiles?.length || 0,
        exporters: roleCounts.exporter || 0,
        qaAgencies: roleCounts.qa_agency || 0,
        importers: roleCounts.importer || 0,
      });

      // Fetch batch statistics
      const { data: batchData, error: batchError } = await supabase
        .from("batches")
        .select("status");

      if (batchError) throw batchError;

      setBatchStats({
        total: batchData?.length || 0,
        submitted: batchData?.filter(b => b.status === "Submitted").length || 0,
        underInspection: batchData?.filter(b => b.status === "Under Inspection").length || 0,
        certified: batchData?.filter(b => b.status === "Certified").length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, organization_name, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userRoles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          return {
            ...profile,
            roles: userRoles?.map(r => r.role) || [],
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from("batches")
        .select(`
          id,
          product_type,
          quantity,
          weight_unit,
          status,
          tracking_token,
          created_at,
          profiles:exporter_id (
            email,
            organization_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Certified":
        return "default";
      case "Under Inspection":
        return "secondary";
      case "Submitted":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <a href="/" className="flex ietms-center gap-2">
              <CircleChevronLeft className="h-6 w-6"/>
            </a>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <DashboardProfileMenu 
            userEmail={user?.email || ""} 
            onSignOut={handleSignOut}
          />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalUsers}</div>
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <div>Exporters: {userStats.exporters}</div>
                  <div>QA Agencies: {userStats.qaAgencies}</div>
                  <div>Importers: {userStats.importers}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batchStats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">All batches in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Under Inspection</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batchStats.underInspection}</div>
                <p className="text-xs text-muted-foreground mt-1">Active inspections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Certified Batches</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batchStats.certified}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {batchStats.total > 0 
                    ? `${((batchStats.certified / batchStats.total) * 100).toFixed(1)}% of total`
                    : "No batches yet"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Tables */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="batches">Batch Oversight</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.full_name || "-"}</TableCell>
                        <TableCell>{user.organization_name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(user.created_at), "PP")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batches" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Batches</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking Token</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Exporter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono text-xs">
                          {batch.tracking_token}
                        </TableCell>
                        <TableCell className="font-medium">{batch.product_type}</TableCell>
                        <TableCell>
                          {batch.quantity} {batch.weight_unit}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{batch.profiles?.organization_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{batch.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(batch.created_at), "PP")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/batch/${batch.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

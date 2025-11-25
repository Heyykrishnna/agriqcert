import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Filter, Activity } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    fetchAuditLogs();

    // Set up real-time subscription for new audit logs
    const channel = supabase
      .channel('audit-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        () => {
          fetchAuditLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("create") || actionLower.includes("insert")) {
      return "default";
    }
    if (actionLower.includes("update") || actionLower.includes("edit")) {
      return "secondary";
    }
    if (actionLower.includes("delete") || actionLower.includes("remove")) {
      return "destructive";
    }
    return "outline";
  };

  const getResourceTypeIcon = (resourceType: string) => {
    return resourceType.charAt(0).toUpperCase();
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResourceType =
      resourceTypeFilter === "all" || log.resource_type === resourceTypeFilter;

    const matchesAction =
      actionFilter === "all" || log.action.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesResourceType && matchesAction;
  });

  const uniqueResourceTypes = Array.from(new Set(logs.map((log) => log.resource_type)));
  const commonActions = ["create", "update", "delete", "view", "submit", "approve", "reject"];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>System Audit Logs</CardTitle>
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredLogs.length} / {logs.length} events
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">
                <Search className="inline h-4 w-4 mr-2" />
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search by action, resource, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-type">
                <Filter className="inline h-4 w-4 mr-2" />
                Resource Type
              </Label>
              <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                <SelectTrigger id="resource-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueResourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {commonActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>
                          {format(new Date(log.created_at), "PP")}
                        </div>
                        <div className="text-xs">
                          {format(new Date(log.created_at), "p")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {getResourceTypeIcon(log.resource_type)}
                          </div>
                          <div>
                            <div className="font-medium">{log.resource_type}</div>
                            {log.resource_id && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {log.resource_id.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.profiles ? (
                          <div>
                            <div className="font-medium text-sm">
                              {log.profiles.full_name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {log.profiles.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="max-w-xs">
                            <details className="text-xs">
                              <summary className="cursor-pointer text-primary hover:underline">
                                View details
                              </summary>
                              <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {log.ip_address || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
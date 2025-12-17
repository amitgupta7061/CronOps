"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import {
  Activity,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

interface LogWithJob {
  id: string;
  status: string;
  responseCode?: number;
  responseBody?: string;
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  cronJob: {
    id: string;
    name: string;
    user: {
      id: string;
      email: string;
    };
  };
}

export default function AdminLogsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuthStore();
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    if (currentUser?.role === "ADMIN") {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authLoading, router, statusFilter]);

  const fetchLogs = async () => {
    try {
      const response = await adminApi.getAllLogs({
        limit: 100,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setLogs(response.data.data.logs);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "RUNNING":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "TIMEOUT":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "FAILED":
        return "destructive";
      case "RUNNING":
        return "default";
      case "TIMEOUT":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              All Execution Logs
            </h1>
            <p className="text-muted-foreground mt-1">
              {logs.length} total executions across all users
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="RUNNING">Running</SelectItem>
              <SelectItem value="TIMEOUT">Timeout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <div className="grid gap-4">
          {logs.map((log) => (
            <Card key={log.id} className="bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        log.status === "SUCCESS"
                          ? "bg-green-500/10"
                          : log.status === "FAILED"
                          ? "bg-red-500/10"
                          : log.status === "RUNNING"
                          ? "bg-blue-500/10"
                          : "bg-yellow-500/10"
                      }`}
                    >
                      {getStatusIcon(log.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {log.cronJob.name}
                        </h3>
                        <Badge
                          variant={getStatusBadgeVariant(log.status) as "success" | "destructive" | "default" | "secondary" | "outline"}
                        >
                          {log.status}
                        </Badge>
                        {log.responseCode && (
                          <Badge variant="outline">{log.responseCode}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {log.cronJob.user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.startedAt).toLocaleString()}
                        </span>
                        {log.duration && (
                          <span>{log.duration}ms</span>
                        )}
                      </div>
                      {log.errorMessage && (
                        <p className="text-sm text-red-500 mt-2 font-mono">
                          {log.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No execution logs found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

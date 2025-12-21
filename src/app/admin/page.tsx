"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { useAdminStore } from "@/lib/admin-store";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  Briefcase,
  Activity,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { stats, statsLoading, fetchStats } = useAdminStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    if (user?.role === "ADMIN") {
      fetchStats().catch(() => {
        toast({
          title: "Error",
          description: "Failed to load admin stats",
          variant: "destructive",
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  // Show loading if auth is loading, or if we're fetching stats, or if stats haven't been loaded yet
  const isLoadingStats = authLoading || statsLoading || (!stats && user?.role === "ADMIN");

  if (isLoadingStats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load admin data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              System overview and management
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.users.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.users.verified} verified, {stats.users.unverified} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Jobs
              </CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.jobs.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.jobs.active} active, {stats.jobs.paused} paused
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Executions
              </CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.executions.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.executions.successRate}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success / Failed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                <span className="text-green-500">{stats.executions.successful}</span>
                {" / "}
                <span className="text-red-500">{stats.executions.failed}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Successful vs failed executions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/users">
            <Card className="bg-card/50 backdrop-blur hover:bg-card/70 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Manage Users</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage all users
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/jobs">
            <Card className="bg-card/50 backdrop-blur hover:bg-card/70 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">All Jobs</h3>
                    <p className="text-sm text-muted-foreground">
                      View all scheduled jobs
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/logs">
            <Card className="bg-card/50 backdrop-blur hover:bg-card/70 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Activity className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">All Logs</h3>
                    <p className="text-sm text-muted-foreground">
                      View all execution logs
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Users */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.map((recentUser) => (
                  <div
                    key={recentUser.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {recentUser.name || "Unnamed User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {recentUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {recentUser.role === "ADMIN" && (
                        <Badge variant="default" className="text-xs">
                          Admin
                        </Badge>
                      )}
                      <Badge
                        variant={recentUser.isVerified ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {recentUser.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Executions */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          execution.status.toLowerCase() === "success"
                            ? "bg-green-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {execution.status.toLowerCase() === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {execution.cronJob.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {execution.cronJob.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {execution.duration ? `${execution.duration}ms` : "-"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

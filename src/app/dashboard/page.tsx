"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  TrendingUp,
  Activity,
  Calendar,
  Timer,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { statsApi, jobsApi, logsApi } from "@/lib/api";
import type { CronJob, ExecutionLog } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";
import Link from "next/link";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<CronJob[]>([]);
  const [recentLogs, setRecentLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes, logsRes] = await Promise.all([
          statsApi.getStats(),
          jobsApi.getAll({ limit: 5 }),
          logsApi.getAll({ limit: 8 }),
        ]);
        setStats(statsRes.data);
        setRecentJobs(jobsRes.data.jobs || []);
        setRecentLogs(logsRes.data.logs || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Timer className="h-4 w-4 text-chart-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="success">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Running</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
              <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-primary" />
            </div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your cron jobs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/80 text-sm font-medium">Total Jobs</p>
                    <p className="text-4xl font-bold mt-2">{stats?.totalJobs || 0}</p>
                    <p className="text-primary-foreground/60 text-xs mt-2">All scheduled tasks</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <Calendar className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border border-chart-2/50 bg-chart-2/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Active Jobs</p>
                    <p className="text-4xl font-bold mt-2 text-foreground">{stats?.activeJobs || 0}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
                      <span className="text-muted-foreground text-xs">Running now</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-chart-2/20 flex items-center justify-center">
                    <Play className="h-7 w-7 text-chart-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Executions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border border-chart-3/50 bg-chart-3/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Executions</p>
                    <p className="text-4xl font-bold mt-2 text-foreground">{stats?.totalExecutions || 0}</p>
                    <p className="text-muted-foreground text-xs mt-2">Total runs all time</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-chart-3/20 flex items-center justify-center">
                    <Zap className="h-7 w-7 text-chart-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Success Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className={`relative overflow-hidden ${
              (stats?.successRate || 0) >= 90 
                ? 'border border-chart-1/50 bg-chart-1/10' 
                : (stats?.successRate || 0) >= 70 
                  ? 'border border-chart-4/50 bg-chart-4/10'
                  : 'border border-destructive/50 bg-destructive/10'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Success Rate</p>
                    <p className="text-4xl font-bold mt-2 text-foreground">
                      {stats?.successRate?.toFixed(1) || 0}%
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {(stats?.successRate || 0) >= 90 ? (
                        <ArrowUpRight className={`h-3 w-3 ${(stats?.successRate || 0) >= 90 ? 'text-chart-1' : (stats?.successRate || 0) >= 70 ? 'text-chart-4' : 'text-destructive'}`} />
                      ) : (
                        <ArrowDownRight className={`h-3 w-3 ${(stats?.successRate || 0) >= 90 ? 'text-chart-1' : (stats?.successRate || 0) >= 70 ? 'text-chart-4' : 'text-destructive'}`} />
                      )}
                      <span className="text-muted-foreground text-xs">Last 30 days</span>
                    </div>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                    (stats?.successRate || 0) >= 90 
                      ? 'bg-chart-1/20' 
                      : (stats?.successRate || 0) >= 70 
                        ? 'bg-chart-4/20'
                        : 'bg-destructive/20'
                  }`}>
                    <TrendingUp className={`h-7 w-7 ${
                      (stats?.successRate || 0) >= 90 
                        ? 'text-chart-1' 
                        : (stats?.successRate || 0) >= 70 
                          ? 'text-chart-4'
                          : 'text-destructive'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="border border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.successfulExecutions || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Successful Runs</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            <Card className="border border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.failedExecutions || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Failed Runs</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="border border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Pause className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.pausedJobs || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Paused Jobs</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.55 }}
          >
            <Card className="h-full">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Jobs</CardTitle>
                      <CardDescription>Your latest scheduled jobs</CardDescription>
                    </div>
                  </div>
                  <Link href="/jobs">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View all
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      No jobs created yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by creating your first scheduled job
                    </p>
                    <Link href="/jobs/new">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create your first job
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between p-4 hover:bg-accent transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              job.isActive 
                                ? 'bg-chart-2/20' 
                                : 'bg-muted'
                            }`}>
                              {job.isActive ? (
                                <Play className="h-5 w-5 text-chart-2" />
                              ) : (
                                <Pause className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            {job.isActive && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-chart-2 border-2 border-card" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {job.name}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {job.schedule}
                            </p>
                          </div>
                        </div>
                        <Badge variant={job.isActive ? "success" : "secondary"}>
                          {job.isActive ? "Active" : "Paused"}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Executions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Executions</CardTitle>
                      <CardDescription>Latest job execution logs</CardDescription>
                    </div>
                  </div>
                  <Link href="/logs">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View all
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      No executions yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Jobs will appear here once they run
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            log.status === 'success' 
                              ? 'bg-chart-2/20' 
                              : log.status === 'failed'
                                ? 'bg-destructive/20'
                                : 'bg-chart-4/20'
                          }`}>
                            {getStatusIcon(log.status)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {log.cronJob?.name || "Unknown Job"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(log.startedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {log.duration && (
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                              {formatDuration(log.duration)}
                            </span>
                          )}
                          {getStatusBadge(log.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.65 }}
        >
          <Card className="bg-primary border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTE4IDBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            <CardContent className="py-8 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-primary-foreground text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Ready to automate?</h3>
                  <p className="text-primary-foreground/80 max-w-md">
                    Schedule HTTP requests, run scripts, or automate any task with powerful cron expressions.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/jobs">
                    <Button variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      View Jobs
                    </Button>
                  </Link>
                  <Link href="/jobs/new">
                    <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

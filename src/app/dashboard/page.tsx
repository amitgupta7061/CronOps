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
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Timer className="h-4 w-4 text-yellow-500 animate-spin" />;
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
              <div className="h-12 w-12 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
              <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-indigo-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
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
            <Card className="relative overflow-hidden border-0 bg-linear-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total Jobs</p>
                    <p className="text-4xl font-bold mt-2">{stats?.totalJobs || 0}</p>
                    <p className="text-indigo-200 text-xs mt-2">All scheduled tasks</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
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
            <Card className="relative overflow-hidden border-0 bg-linear-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Active Jobs</p>
                    <p className="text-4xl font-bold mt-2">{stats?.activeJobs || 0}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      <span className="text-emerald-200 text-xs">Running now</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Play className="h-7 w-7" />
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
            <Card className="relative overflow-hidden border-0 bg-linear-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Executions</p>
                    <p className="text-4xl font-bold mt-2">{stats?.totalExecutions || 0}</p>
                    <p className="text-purple-200 text-xs mt-2">Total runs all time</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Zap className="h-7 w-7" />
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
            <Card className={`relative overflow-hidden border-0 text-white ${
              (stats?.successRate || 0) >= 90 
                ? 'bg-linear-to-br from-teal-500 to-teal-600' 
                : (stats?.successRate || 0) >= 70 
                  ? 'bg-linear-to-br from-yellow-500 to-yellow-600'
                  : 'bg-linear-to-br from-red-500 to-red-600'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Success Rate</p>
                    <p className="text-4xl font-bold mt-2">
                      {stats?.successRate?.toFixed(1) || 0}%
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {(stats?.successRate || 0) >= 90 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span className="text-white/70 text-xs">Last 30 days</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <TrendingUp className="h-7 w-7" />
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
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.successfulExecutions || 0}
                  </p>
                  <p className="text-sm text-gray-500">Successful Runs</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.failedExecutions || 0}
                  </p>
                  <p className="text-sm text-gray-500">Failed Runs</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Pause className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.pausedJobs || 0}
                  </p>
                  <p className="text-sm text-gray-500">Paused Jobs</p>
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
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Jobs</CardTitle>
                      <CardDescription>Your latest scheduled jobs</CardDescription>
                    </div>
                  </div>
                  <Link href="/jobs">
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      View all
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      No jobs created yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
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
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              job.isActive 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              {job.isActive ? (
                                <Play className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Pause className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            {job.isActive && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">
                              {job.name}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
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
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Executions</CardTitle>
                      <CardDescription>Latest job execution logs</CardDescription>
                    </div>
                  </div>
                  <Link href="/logs">
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      View all
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      No executions yet
                    </h3>
                    <p className="text-sm text-gray-500">
                      Jobs will appear here once they run
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            log.status === 'success' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                              : log.status === 'failed'
                                ? 'bg-red-100 dark:bg-red-900/30'
                                : 'bg-yellow-100 dark:bg-yellow-900/30'
                          }`}>
                            {getStatusIcon(log.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {log.cronJob?.name || "Unknown Job"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(log.startedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {log.duration && (
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
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
          <Card className="bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTE4IDBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            <CardContent className="py-8 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Ready to automate?</h3>
                  <p className="text-indigo-100 max-w-md">
                    Schedule HTTP requests, run scripts, or automate any task with powerful cron expressions.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/jobs">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      View Jobs
                    </Button>
                  </Link>
                  <Link href="/jobs/new">
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
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

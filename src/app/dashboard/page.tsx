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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { statsApi, jobsApi, logsApi } from "@/lib/api";
import type { Stats, CronJob, ExecutionLog } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<CronJob[]>([]);
  const [recentLogs, setRecentLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes, logsRes] = await Promise.all([
          statsApi.getStats(),
          jobsApi.getAll({ limit: 5 }),
          logsApi.getAll({ limit: 10 }),
        ]);
        setStats(statsRes.data);
        setRecentJobs(jobsRes.data.jobs);
        setRecentLogs(logsRes.data.logs);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = stats
    ? [
        {
          title: "Total Jobs",
          value: stats.totalJobs,
          icon: Clock,
          color: "indigo",
          description: "Scheduled tasks",
        },
        {
          title: "Active Jobs",
          value: stats.activeJobs,
          icon: Play,
          color: "emerald",
          description: "Currently running",
        },
        {
          title: "Total Executions",
          value: stats.totalExecutions,
          icon: Activity,
          color: "purple",
          description: "All time",
        },
        {
          title: "Success Rate",
          value: `${stats.successRate.toFixed(1)}%`,
          icon: TrendingUp,
          color: stats.successRate >= 95 ? "emerald" : stats.successRate >= 80 ? "yellow" : "red",
          description: "Last 30 days",
        },
      ]
    : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Timer className="h-4 w-4 text-yellow-500" />;
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-gray-500">Loading dashboard...</p>
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
            Overview of your cron jobs and executions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4" />
                    {stat.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
                <div
                  className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 bg-${stat.color}-500`}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-500" />
                      Recent Jobs
                    </CardTitle>
                    <CardDescription>Your latest scheduled jobs</CardDescription>
                  </div>
                  <Link
                    href="/jobs"
                    className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No jobs created yet</p>
                      <Link
                        href="/jobs/new"
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        Create your first job
                      </Link>
                    </div>
                  ) : (
                    recentJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              job.isActive ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600">
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Executions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Recent Executions
                    </CardTitle>
                    <CardDescription>Latest job execution logs</CardDescription>
                  </div>
                  <Link
                    href="/logs"
                    className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No executions yet</p>
                      <p className="text-sm">
                        Jobs will appear here once they run
                      </p>
                    </div>
                  ) : (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {log.cronJob?.name || "Unknown Job"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(log.startedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.duration && (
                            <span className="text-xs text-gray-500">
                              {formatDuration(log.duration)}
                            </span>
                          )}
                          {getStatusBadge(log.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="bg-linear-to-r from-indigo-500 to-purple-600 border-0">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white text-center sm:text-left">
                  <h3 className="text-lg font-semibold">Ready to create a new job?</h3>
                  <p className="text-indigo-100">
                    Schedule HTTP requests, scripts, or custom tasks with ease.
                  </p>
                </div>
                <Link
                  href="/jobs/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Create Job
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

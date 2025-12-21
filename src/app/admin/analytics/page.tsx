"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Activity,
  Clock,
  Shield,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const COLORS = {
  success: "#22c55e",
  failed: "#ef4444",
  running: "#f59e0b",
  primary: "#6366f1",
  secondary: "#8b5cf6",
  users: "#06b6d4",
  jobs: "#f97316",
};

const PLAN_COLORS = {
  FREE: "#6b7280",
  PREMIUM: "#8b5cf6",
  PRO: "#f59e0b",
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);

  useEffect(() => {
    if (!authLoading && user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await adminApi.getStats();
      return response.data.data;
    },
    enabled: user?.role === "ADMIN",
  });

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await adminApi.getUsers({ limit: 100 });
      return response.data.data;
    },
    enabled: user?.role === "ADMIN",
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ["admin-logs-analytics"],
    queryFn: async () => {
      const response = await adminApi.getAllLogs({ limit: 500 });
      return response.data.data;
    },
    enabled: user?.role === "ADMIN",
  });

  const isLoading = isStatsLoading || isUsersLoading || isLogsLoading || authLoading;

  // Process data for charts
  const processDataForCharts = () => {
    const result = {
      daily: [] as { date: string; success: number; failed: number; total: number }[],
      statusBreakdown: [] as { name: string; value: number; color: string }[],
      hourly: [] as { hour: string; executions: number }[],
      planDistribution: [] as { name: string; value: number; color: string }[],
      userGrowth: [] as { date: string; users: number }[],
    };

    if (!logsData?.logs) return result;

    const logs = logsData.logs;
    const now = new Date();
    const daysAgo = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    // Filter logs within time range
    const filteredLogs = logs.filter((log: { startedAt: string }) => new Date(log.startedAt) >= daysAgo);

    // Daily execution counts
    const dailyMap = new Map<string, { date: string; success: number; failed: number; total: number }>();
    for (let i = 0; i < timeRange; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyMap.set(dateStr, { date: dateStr, success: 0, failed: 0, total: 0 });
    }

    filteredLogs.forEach((log: { startedAt: string; status: string }) => {
      const date = new Date(log.startedAt);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const entry = dailyMap.get(dateStr);
      if (entry) {
        entry.total++;
        if (log.status.toLowerCase() === "success") {
          entry.success++;
        } else if (log.status.toLowerCase() === "failed") {
          entry.failed++;
        }
      }
    });

    result.daily = Array.from(dailyMap.values()).reverse();

    // Status breakdown
    const statusCounts = { success: 0, failed: 0, running: 0 };
    filteredLogs.forEach((log: { status: string }) => {
      const status = log.status.toLowerCase();
      if (status === "success") statusCounts.success++;
      else if (status === "failed") statusCounts.failed++;
      else statusCounts.running++;
    });

    result.statusBreakdown = [
      { name: "Success", value: statusCounts.success, color: COLORS.success },
      { name: "Failed", value: statusCounts.failed, color: COLORS.failed },
      { name: "Running", value: statusCounts.running, color: COLORS.running },
    ].filter(item => item.value > 0);

    // Hourly distribution  
    const hourlyMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, 0);
    }
    filteredLogs.forEach((log: { startedAt: string }) => {
      const hour = new Date(log.startedAt).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });
    result.hourly = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
      hour: `${hour}:00`,
      executions: count,
    }));

    // Plan distribution from users
    if (usersData?.users) {
      const planCounts = { FREE: 0, PREMIUM: 0, PRO: 0 };
      usersData.users.forEach((u: { plan?: string }) => {
        const plan = u.plan || "FREE";
        if (plan in planCounts) {
          planCounts[plan as keyof typeof planCounts]++;
        }
      });
      result.planDistribution = [
        { name: "Free", value: planCounts.FREE, color: PLAN_COLORS.FREE },
        { name: "Premium", value: planCounts.PREMIUM, color: PLAN_COLORS.PREMIUM },
        { name: "Pro", value: planCounts.PRO, color: PLAN_COLORS.PRO },
      ].filter(item => item.value > 0);

      // User growth (mock based on createdAt)
      const userGrowthMap = new Map<string, number>();
      for (let i = 0; i < timeRange; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        userGrowthMap.set(dateStr, 0);
      }
      
      let cumulativeUsers = 0;
      usersData.users.forEach((u: { createdAt: string }) => {
        const createDate = new Date(u.createdAt);
        if (createDate < daysAgo) {
          cumulativeUsers++;
        }
      });

      const sortedDates = Array.from(userGrowthMap.keys()).reverse();
      sortedDates.forEach((dateStr) => {
        usersData.users.forEach((u: { createdAt: string }) => {
          const createDate = new Date(u.createdAt);
          const dateCheck = new Date(createDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
          if (createDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) === dateStr) {
            cumulativeUsers++;
          }
        });
        userGrowthMap.set(dateStr, cumulativeUsers);
      });

      result.userGrowth = sortedDates.map(date => ({
        date,
        users: userGrowthMap.get(date) || 0,
      }));
    }

    return result;
  };

  const { daily, statusBreakdown, hourly, planDistribution } = processDataForCharts();

  const stats = statsData;
  const successRate = typeof stats?.executions?.successRate === 'number'
    ? stats.executions.successRate
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
              <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-primary" />
            </div>
            <p className="text-muted-foreground">Loading admin analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              System-wide analytics and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            {[7, 14, 30].map((days) => (
              <Button
                key={days}
                variant={timeRange === days ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(days as 7 | 14 | 30)}
              >
                {days}D
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.jobs?.total || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.executions?.successful || 0}</p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.executions?.failed || 0}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Execution Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  System Execution Trend
                </CardTitle>
                <CardDescription>All job executions over the last {timeRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={daily}>
                      <defs>
                        <linearGradient id="adminSuccessGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="adminFailedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.failed} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.failed} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                      <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="success"
                        stroke={COLORS.success}
                        fill="url(#adminSuccessGradient)"
                        name="Success"
                      />
                      <Area
                        type="monotone"
                        dataKey="failed"
                        stroke={COLORS.failed}
                        fill="url(#adminFailedGradient)"
                        name="Failed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Status Breakdown
                </CardTitle>
                <CardDescription>Success rate: {successRate.toFixed(1)}%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {statusBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No execution data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Plan Distribution
                </CardTitle>
                <CardDescription>Breakdown of users by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {planDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          {planDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No user data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hourly Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Hourly Distribution
                </CardTitle>
                <CardDescription>Peak hours for job executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourly}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'currentColor' }} />
                      <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar
                        dataKey="executions"
                        fill={COLORS.primary}
                        radius={[4, 4, 0, 0]}
                        name="Executions"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

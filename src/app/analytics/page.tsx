"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar,
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
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { statsApi, logsApi } from "@/lib/api";

const COLORS = {
  success: "#22c55e",
  failed: "#ef4444",
  running: "#f59e0b",
  primary: "#6366f1",
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await statsApi.getStats();
      return response.data.data;
    },
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ["logs", "all", "all", 1],
    queryFn: async () => {
      const response = await logsApi.getAll({ limit: 100 });
      return response.data.data;
    },
  });

  const isLoading = isStatsLoading || isLogsLoading;

  // Process logs data for charts
  const processLogsForCharts = () => {
    if (!logsData?.logs) return { daily: [], statusBreakdown: [], hourly: [] };

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

    const daily = Array.from(dailyMap.values()).reverse();

    // Status breakdown for pie chart
    const statusCounts = { success: 0, failed: 0, running: 0 };
    filteredLogs.forEach((log: { status: string }) => {
      const status = log.status.toLowerCase();
      if (status === "success") statusCounts.success++;
      else if (status === "failed") statusCounts.failed++;
      else statusCounts.running++;
    });

    const statusBreakdown = [
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
    const hourly = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
      hour: `${hour}:00`,
      executions: count,
    }));

    return { daily, statusBreakdown, hourly };
  };

  const { daily, statusBreakdown, hourly } = processLogsForCharts();

  const stats = statsData;
  const successRate = typeof stats?.executions?.successRate === 'string'
    ? parseFloat(stats.executions.successRate)
    : (stats?.executions?.successRate || 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
              <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-primary" />
            </div>
            <p className="text-muted-foreground">Loading analytics...</p>
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
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize your job execution data and trends
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
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
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
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-chart-2/20 bg-chart-2/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.executions?.total || 0}</p>
                    <p className="text-sm text-muted-foreground">Executions</p>
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
                  Execution Trend
                </CardTitle>
                <CardDescription>Daily job executions over the last {timeRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={daily}>
                      <defs>
                        <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#successGradient)"
                        name="Success"
                      />
                      <Area
                        type="monotone"
                        dataKey="failed"
                        stroke={COLORS.failed}
                        fill="url(#failedGradient)"
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

        {/* Hourly Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Hourly Distribution
              </CardTitle>
              <CardDescription>When your jobs run most frequently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
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
    </DashboardLayout>
  );
}

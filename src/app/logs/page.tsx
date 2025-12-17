"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Timer,
  Calendar,
  Activity,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/components/ui/use-toast";
import { logsApi, jobsApi } from "@/lib/api";
import type { ExecutionLog, CronJob } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";
import Link from "next/link";

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      const response = await logsApi.getAll({
        status: statusFilter === "all" ? undefined : statusFilter,
        jobId: jobFilter === "all" ? undefined : jobFilter,
        page,
        limit: 20,
      });
      setLogs(response.data.data?.logs || []);
      setTotalPages(response.data.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast({
        title: "Error",
        description: "Failed to load execution logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll({ limit: 100 });
      setJobs(response.data.data?.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, jobFilter, page]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Timer className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <Badge variant="success">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Running</Badge>;
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading logs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Execution Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            View the execution history of all your cron jobs
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-full sm:w-50">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1" />

              <Button
                variant="outline"
                onClick={() => {
                  setIsLoading(true);
                  fetchLogs();
                }}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Activity className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No execution logs found
                </h3>
                <p className="text-muted-foreground">
                  {jobFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Logs will appear here once jobs are executed"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card className="overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <div className="shrink-0">{getStatusIcon(log.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/jobs/${log.cronJobId}`}
                          className="font-semibold text-foreground hover:text-primary truncate"
                        >
                          {log.cronJob?.name || "Unknown Job"}
                        </Link>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(log.startedAt)}
                        </span>
                        {log.duration && (
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {formatDuration(log.duration)}
                          </span>
                        )}
                        {log.statusCode && (
                          <span>Status Code: {log.statusCode}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(log.error || log.response) && (
                    <div className="border-t border-border p-4 bg-accent">
                      {log.error && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-600 mb-1">Error:</p>
                          <pre className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto max-h-24">
                            {log.error}
                          </pre>
                        </div>
                      )}
                      {log.response && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Response:</p>
                          <pre className="text-sm text-foreground bg-card p-2 rounded overflow-auto max-h-24 border border-border">
                            {typeof log.response === "string"
                              ? log.response.slice(0, 500)
                              : JSON.stringify(log.response, null, 2).slice(0, 500)}
                            {(typeof log.response === "string" ? log.response : JSON.stringify(log.response)).length > 500 && "..."}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

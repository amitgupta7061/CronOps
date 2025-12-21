"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Timer,
  Globe,
  Terminal,
  Calendar,
  Activity,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/components/ui/use-toast";
import { jobsApi, logsApi } from "@/lib/api";
import type { CronJob, ExecutionLog } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [job, setJob] = useState<CronJob | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [jobRes, logsRes] = await Promise.all([
        jobsApi.getById(id),
        logsApi.getByJobId(id),
      ]);
      setJob(jobRes.data.data);
      setLogs(logsRes.data.data?.logs || []);
    } catch (error) {
      console.error("Failed to fetch job:", error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!job) return;
    try {
      if (job.status === 'ACTIVE') {
        await jobsApi.pause(id);
        setJob({ ...job, status: 'PAUSED' });
      } else {
        await jobsApi.resume(id);
        setJob({ ...job, status: 'ACTIVE' });
      }
      toast({
        title: job.status === 'ACTIVE' ? "Job paused" : "Job activated",
        description: `${job.name} has been ${job.status === 'ACTIVE' ? "paused" : "activated"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const handleRunNow = async () => {
    if (!job) return;
    try {
      await jobsApi.runNow(id);
      // Invalidate logs cache so logs page shows new execution
      await queryClient.invalidateQueries({ queryKey: ["logs"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({
        title: "Job triggered",
        description: `${job.name} has been queued for immediate execution.`,
      });
      // Also refresh local logs after a short delay
      setTimeout(fetchData, 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to trigger job",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    setIsDeleting(true);
    try {
      await jobsApi.delete(id);
      // Invalidate all related caches
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["logs"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-jobs"] });
      toast({
        title: "Job deleted",
        description: `${job.name} has been deleted.`,
      });
      router.push("/jobs");
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Timer className="h-4 w-4 text-yellow-500 animate-spin" />;
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Job not found
            </h2>
            <p className="text-muted-foreground mb-4">
              The job you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/jobs">
              <Button>Back to Jobs</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/jobs">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">
                  {job.name}
                </h1>
                <Badge variant={job.status === 'ACTIVE' ? "success" : "secondary"}>
                  {job.status === 'ACTIVE' ? "Active" : "Paused"}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono mt-1">{job.cronExpression}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRunNow}>
              <Play className="h-4 w-4 mr-2" />
              Run Now
            </Button>
            <Button variant="outline" onClick={handleToggleStatus}>
              {job.status === 'ACTIVE' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
            <Link href={`/jobs/${id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Configuration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {job.targetType === "HTTP" ? (
                        <Globe className="h-5 w-5 text-primary" />
                      ) : (
                        <Terminal className="h-5 w-5 text-primary" />
                      )}
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{job.targetType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Timezone</p>
                        <p className="font-medium">{job.timezone}</p>
                      </div>
                    </div>

                    {job.targetType === "HTTP" && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">URL</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{job.httpMethod}</Badge>
                            <a
                              href={job.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm text-primary hover:text-primary/80 truncate flex items-center gap-1"
                            >
                              {job.targetUrl}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        </div>

                        {job.headers && Object.keys(job.headers).length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Headers</p>
                            <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                              {Object.entries(job.headers).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-primary">{key}</span>:{" "}
                                  <span className="text-muted-foreground">
                                    {value as string}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.payload && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Body</p>
                            <pre className="bg-muted rounded-lg p-3 font-mono text-sm overflow-auto max-h-48">
                              {job.payload}
                            </pre>
                          </div>
                        )}
                      </>
                    )}

                    {job.targetType === "SCRIPT" && job.command && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Script</p>
                        <pre className="bg-muted rounded-lg p-3 font-mono text-sm overflow-auto max-h-48">
                          {job.command}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Advanced Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Execution Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-foreground">
                          {job.maxRetries}
                        </p>
                        <p className="text-sm text-muted-foreground">Max Retries</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-foreground">
                          {Math.floor(job.timeout / 1000)}s
                        </p>
                        <p className="text-sm text-muted-foreground">Timeout</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">
                            {formatDate(job.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="font-medium">
                            {formatDate(job.updatedAt)}
                          </p>
                        </div>
                        {job.lastRunAt && (
                          <>
                            <div>
                              <p className="text-muted-foreground">Last Run</p>
                              <p className="font-medium">
                                {formatDate(job.lastRunAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Status</p>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(job.lastStatus || "unknown")}
                                <span className="font-medium capitalize">
                                  {job.lastStatus || "Unknown"}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Execution History
                    </CardTitle>
                    <CardDescription>
                      Recent execution logs for this job
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No executions yet</p>
                    <p className="text-sm mt-1">
                      This job hasn't been executed yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 bg-accent">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(log.status)}
                            <div>
                              <p className="font-medium text-foreground">
                                {formatDate(log.startedAt)}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {log.duration && (
                                  <span>Duration: {formatDuration(log.duration)}</span>
                                )}
                                {log.statusCode && (
                                  <span>• Status: {log.statusCode}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(log.status)}
                        </div>
                        {(log.response || log.error) && (
                          <div className="p-4 border-t border-border">
                            {log.error && (
                              <div className="mb-2">
                                <p className="text-sm text-red-600 font-medium mb-1">
                                  Error:
                                </p>
                                <pre className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto max-h-24">
                                  {log.error}
                                </pre>
                              </div>
                            )}
                            {log.response && (
                              <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1">
                                  Response:
                                </p>
                                <pre className="text-sm text-foreground bg-muted p-2 rounded overflow-auto max-h-24">
                                  {typeof log.response === "string"
                                    ? log.response
                                    : JSON.stringify(log.response, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{job.name}"? This action cannot
              be undone and all execution logs will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

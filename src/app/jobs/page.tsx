"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Plus,
  Search,
  Clock,
  Play,
  Pause,
  Trash2,
  Edit,
  MoreVertical,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { jobsApi } from "@/lib/api";
import type { CronJob } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function JobsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<CronJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ["jobs", searchQuery, statusFilter],
    queryFn: async () => {
      const response = await jobsApi.getAll({
        search: searchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter === "active" ? "ACTIVE" : "PAUSED",
      });
      return response.data.data?.jobs || [];
    },
  });

  const fetchJobs = () => refetch();

  const handleToggleStatus = async (job: CronJob) => {
    try {
      if (job.status === 'ACTIVE') {
        await jobsApi.pause(job.id);
      } else {
        await jobsApi.resume(job.id);
      }
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      // Also invalidate dashboard queries as they depend on job status
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-jobs"] });
      
      toast({
        title: job.status === 'ACTIVE' ? "Job paused" : "Job activated",
        description: `${job.name} has been ${job.status === 'ACTIVE' ? "paused" : "activated"}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const handleRunNow = async (job: CronJob) => {
    try {
      await jobsApi.runNow(job.id);
      toast({
        title: "Job triggered",
        description: `${job.name} has been queued for immediate execution.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to trigger job",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      await jobsApi.delete(jobToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      // Invalidate dashboard stats
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      
      toast({
        title: "Job deleted",
        description: `${jobToDelete.name} has been deleted.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const filteredJobs = jobs.filter((job : CronJob) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.name.toLowerCase().includes(query) ||
        job.cronExpression.toLowerCase().includes(query) ||
        job.targetUrl?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading jobs...</p>
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Jobs
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your schedule ({jobs.length} / {(user?.role === 'ADMIN' || user?.plan === 'PRO') ? '∞' : (user?.plan === 'PREMIUM' ? 100 : 3)} jobs used)
            </p>
          </div>
          {(user?.role === 'ADMIN' || user?.plan === 'PRO' || jobs.length < (user?.plan === 'PREMIUM' ? 100 : 3)) ? (
            <Link href="/jobs/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Job
              </Button>
            </Link>
          ) : (
            <Button className="gap-2" disabled>
              <Plus className="h-4 w-4" />
              Limit Reached
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-35">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchJobs}
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery || statusFilter !== "all"
                    ? "No jobs found"
                    : "No jobs yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first cron job to get started"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link href="/jobs/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job: CronJob, index: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className={`h-3 w-3 rounded-full shrink-0 ${
                            job.status === 'ACTIVE'
                              ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="font-semibold text-foreground hover:text-primary truncate"
                            >
                              {job.name}
                            </Link>
                            <Badge
                              variant={job.status === 'ACTIVE' ? "success" : "secondary"}
                            >
                              {job.status === 'ACTIVE' ? "Active" : "Paused"}
                            </Badge>
                            <Badge variant="outline">{job.targetType}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="font-mono bg-muted px-2 py-0.5 rounded">
                              {job.cronExpression}
                            </span>
                            {job.targetUrl && (
                              <span className="flex items-center gap-1 truncate max-w-xs">
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span className="truncate">{job.targetUrl}</span>
                              </span>
                            )}
                          </div>
                          {job.lastRunAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last run: {formatDate(job.lastRunAt)}
                              {job.lastStatus && (
                                <span className="ml-2">
                                  {job.lastStatus === "success" ? (
                                    <CheckCircle2 className="inline h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <XCircle className="inline h-3 w-3 text-red-500" />
                                  )}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunNow(job)}
                          title="Run now"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(job)}
                          title={job.status === 'ACTIVE' ? "Pause" : "Activate"}
                        >
                          {job.status === 'ACTIVE' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/jobs/${job.id}`}>
                                <Clock className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/jobs/${job.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRunNow(job)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Run Now
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setJobToDelete(job);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{jobToDelete?.name}&rdquo;? This action
              cannot be undone and all execution logs will be deleted.
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

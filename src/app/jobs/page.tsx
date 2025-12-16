"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import { useToast } from "@/components/ui/use-toast";
import { jobsApi } from "@/lib/api";
import type { CronJob } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function JobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<CronJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll({
        search: searchQuery || undefined,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      });
      setJobs(response.data.jobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]);

  const handleToggleStatus = async (job: CronJob) => {
    try {
      await jobsApi.update(job.id, { isActive: !job.isActive });
      setJobs(
        jobs.map((j) =>
          j.id === job.id ? { ...j, isActive: !j.isActive } : j
        )
      );
      toast({
        title: job.isActive ? "Job paused" : "Job activated",
        description: `${job.name} has been ${job.isActive ? "paused" : "activated"}.`,
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
      setJobs(jobs.filter((j) => j.id !== jobToDelete.id));
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

  const filteredJobs = jobs.filter((job) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.name.toLowerCase().includes(query) ||
        job.schedule.toLowerCase().includes(query) ||
        job.url?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-gray-500">Loading jobs...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Jobs
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your scheduled cron jobs
            </p>
          </div>
          <Link href="/jobs/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Job
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <Clock className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {searchQuery || statusFilter !== "all"
                    ? "No jobs found"
                    : "No jobs yet"}
                </h3>
                <p className="text-gray-500 mb-6">
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
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className={`h-3 w-3 rounded-full shrink-0 ${
                            job.isActive
                              ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                              : "bg-gray-400"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 truncate"
                            >
                              {job.name}
                            </Link>
                            <Badge
                              variant={job.isActive ? "success" : "secondary"}
                            >
                              {job.isActive ? "Active" : "Paused"}
                            </Badge>
                            <Badge variant="outline">{job.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              {job.schedule}
                            </span>
                            {job.url && (
                              <span className="flex items-center gap-1 truncate max-w-xs">
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span className="truncate">{job.url}</span>
                              </span>
                            )}
                          </div>
                          {job.lastRunAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              Last run: {formatDate(job.lastRunAt)}
                              {job.lastRunStatus && (
                                <span className="ml-2">
                                  {job.lastRunStatus === "success" ? (
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
                          title={job.isActive ? "Pause" : "Activate"}
                        >
                          {job.isActive ? (
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

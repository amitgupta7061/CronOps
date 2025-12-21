"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/lib/store";
import { useAdminStore } from "@/lib/admin-store";
import { useToast } from "@/components/ui/use-toast";
import {
  Briefcase,
  Search,
  ArrowLeft,
  Clock,
  Globe,
  Terminal,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

export default function AdminJobsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuthStore();
  const { jobs, jobsLoading, jobsStatusFilter, fetchJobs } = useAdminStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(jobsStatusFilter);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    if (currentUser?.role === "ADMIN") {
      fetchJobs(statusFilter).catch(() => {
        toast({
          title: "Error",
          description: "Failed to load jobs",
          variant: "destructive",
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authLoading, router, statusFilter]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || jobsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              All Jobs
            </h1>
            <p className="text-muted-foreground mt-1">
              {jobs.length} total jobs across all users
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job name or user email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs List */}
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        job.targetType === "HTTP"
                          ? "bg-blue-500/10"
                          : "bg-purple-500/10"
                      }`}
                    >
                      {job.targetType === "HTTP" ? (
                        <Globe className="h-6 w-6 text-blue-500" />
                      ) : (
                        <Terminal className="h-6 w-6 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {job.name}
                        </h3>
                        <Badge
                          variant={job.status === "ACTIVE" ? "success" : "secondary"}
                        >
                          {job.status}
                        </Badge>
                        <Badge variant="outline">{job.targetType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {job.user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.cronExpression}
                        </span>
                        <span>{job.executionCount} executions</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

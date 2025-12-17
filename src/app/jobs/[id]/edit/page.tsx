"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Globe,
  Terminal,
  Info,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/components/ui/use-toast";
import { jobsApi } from "@/lib/api";
import type { CronJob } from "@/lib/api";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const TIMEZONE_OPTIONS = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

const CRON_PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every day at noon", value: "0 12 * * *" },
  { label: "Every Monday at 9am", value: "0 9 * * 1" },
  { label: "Every weekday at 9am", value: "0 9 * * 1-5" },
  { label: "First day of month", value: "0 0 1 * *" },
];

interface HeaderEntry {
  key: string;
  value: string;
}

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [job, setJob] = useState<CronJob | null>(null);
  const [jobType, setJobType] = useState<"http" | "script">("http");
  const [headers, setHeaders] = useState<HeaderEntry[]>([{ key: "", value: "" }]);

  const [formData, setFormData] = useState({
    name: "",
    schedule: "",
    timezone: "UTC",
    url: "",
    httpMethod: "GET",
    httpBody: "",
    script: "",
    retryCount: 3,
    retryDelay: 60,
    timeout: 30,
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobsApi.getById(id);
        const jobData = response.data.data;
        setJob(jobData);
        setJobType(jobData.targetType === "HTTP" ? "http" : "script");
        setFormData({
          name: jobData.name,
          schedule: jobData.cronExpression,
          timezone: jobData.timezone,
          url: jobData.targetUrl || "",
          httpMethod: jobData.httpMethod || "GET",
          httpBody: jobData.payload || "",
          script: jobData.command || "",
          retryCount: jobData.maxRetries || 3,
          retryDelay: 60,
          timeout: Math.floor(jobData.timeout / 1000), // Convert ms to seconds
        });

        // Parse headers
        if (jobData.headers && typeof jobData.headers === "object") {
          const headerEntries = Object.entries(jobData.headers).map(
            ([key, value]) => ({ key, value: value as string })
          );
          setHeaders(
            headerEntries.length > 0 ? headerEntries : [{ key: "", value: "" }]
          );
        }
      } catch (error) {
        console.error("Failed to fetch job:", error);
        toast({
          title: "Error",
          description: "Failed to load job",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, toast]);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Build headers object
      const httpHeaders: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key.trim()) {
          httpHeaders[h.key.trim()] = h.value;
        }
      });

      await jobsApi.update(id, {
        name: formData.name,
        cronExpression: formData.schedule,
        timezone: formData.timezone,
        targetType: jobType === "http" ? "HTTP" : "SCRIPT",
        targetUrl: jobType === "http" ? formData.url : undefined,
        httpMethod: jobType === "http" ? formData.httpMethod : undefined,
        headers:
          jobType === "http" && Object.keys(httpHeaders).length > 0
            ? httpHeaders
            : undefined,
        payload:
          jobType === "http" && formData.httpBody ? formData.httpBody : undefined,
        command: jobType === "script" ? formData.script : undefined,
        maxRetries: formData.retryCount,
        timeout: formData.timeout * 1000, // Convert seconds to milliseconds
      } as Partial<CronJob>);

      toast({
        title: "Job updated",
        description: `${formData.name} has been updated successfully.`,
      });

      router.push(`/jobs/${id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading job...</p>
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/jobs/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edit Job
            </h1>
            <p className="text-muted-foreground mt-1">
              Update job configuration
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update job name and schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Job Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Daily Report Generation"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule" className="flex items-center gap-2">
                      Cron Schedule
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id="schedule"
                        placeholder="* * * * *"
                        className="font-mono"
                        value={formData.schedule}
                        onChange={(e) =>
                          setFormData({ ...formData, schedule: e.target.value })
                        }
                        required
                      />
                      <Select
                        onValueChange={(value) =>
                          setFormData({ ...formData, schedule: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a preset..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CRON_PRESETS.map((preset) => (
                            <SelectItem key={preset.value} value={preset.value}>
                              <span className="flex items-center gap-2">
                                <span className="font-mono text-xs bg-muted px-1 rounded">
                                  {preset.value}
                                </span>
                                {preset.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) =>
                        setFormData({ ...formData, timezone: value })
                      }
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Job Configuration
                </CardTitle>
                <CardDescription>
                  Update job execution settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={jobType}
                  onValueChange={(v) => setJobType(v as "http" | "script")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="http" className="gap-2">
                      <Globe className="h-4 w-4" />
                      HTTP Request
                    </TabsTrigger>
                    <TabsTrigger value="script" className="gap-2">
                      <Terminal className="h-4 w-4" />
                      Script
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="http" className="space-y-4 mt-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Method</Label>
                        <Select
                          value={formData.httpMethod}
                          onValueChange={(value) =>
                            setFormData({ ...formData, httpMethod: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HTTP_METHODS.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          type="url"
                          placeholder="https://api.example.com/webhook"
                          value={formData.url}
                          onChange={(e) =>
                            setFormData({ ...formData, url: e.target.value })
                          }
                          required={jobType === "http"}
                        />
                      </div>
                    </div>

                    {/* Headers */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Headers</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleAddHeader}
                        >
                          Add Header
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {headers.map((header, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Header name"
                              value={header.key}
                              onChange={(e) =>
                                handleHeaderChange(index, "key", e.target.value)
                              }
                            />
                            <Input
                              placeholder="Value"
                              value={header.value}
                              onChange={(e) =>
                                handleHeaderChange(index, "value", e.target.value)
                              }
                            />
                            {headers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveHeader(index)}
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Body (for POST/PUT/PATCH) */}
                    {["POST", "PUT", "PATCH"].includes(formData.httpMethod) && (
                      <div className="space-y-2">
                        <Label htmlFor="body">Request Body (JSON)</Label>
                        <textarea
                          id="body"
                          className="w-full min-h-30 px-3 py-2 text-sm border rounded-md font-mono bg-background"
                          placeholder='{"key": "value"}'
                          value={formData.httpBody}
                          onChange={(e) =>
                            setFormData({ ...formData, httpBody: e.target.value })
                          }
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="script" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="script">Script</Label>
                      <textarea
                        id="script"
                        className="w-full min-h-50 px-3 py-2 text-sm border rounded-md font-mono bg-background"
                        placeholder="#!/bin/bash&#10;echo 'Hello World'"
                        value={formData.script}
                        onChange={(e) =>
                          setFormData({ ...formData, script: e.target.value })
                        }
                        required={jobType === "script"}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure retry behavior and timeouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retryCount">Retry Count</Label>
                    <Input
                      id="retryCount"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.retryCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          retryCount: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of retry attempts on failure
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retryDelay">Retry Delay (sec)</Label>
                    <Input
                      id="retryDelay"
                      type="number"
                      min="1"
                      value={formData.retryDelay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          retryDelay: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Seconds between retries
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (sec)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      min="1"
                      value={formData.timeout}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timeout: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Max execution time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href={`/jobs/${id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  signup: (data: { email: string; password: string; name?: string }) =>
    api.post("/auth/signup", data),
  register: (data: { email: string; password: string; name?: string }) =>
    api.post("/auth/signup", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put("/auth/me", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/auth/password", data),
};

// Jobs API
export const jobsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; isActive?: boolean; search?: string }) =>
    api.get("/jobs", { params }),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (data: CreateJobData) => api.post("/jobs", data),
  update: (id: string, data: Partial<CronJob>) =>
    api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  pause: (id: string) => api.post(`/jobs/${id}/pause`),
  resume: (id: string) => api.post(`/jobs/${id}/resume`),
  runNow: (id: string) => api.post(`/jobs/${id}/run`),
  getLogs: (jobId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/jobs/${jobId}/logs`, { params }),
  getStats: (jobId: string) => api.get(`/jobs/${jobId}/stats`),
};

// Logs API
export const logsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; jobId?: string }) =>
    api.get("/logs", { params }),
  getById: (id: string) => api.get(`/logs/${id}`),
  getByJobId: (jobId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/jobs/${jobId}/logs`, { params }),
};

// Stats API
export const statsApi = {
  getDashboard: () => api.get("/stats"),
  getStats: () => api.get("/stats"),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CronJob {
  id: string;
  userId: string;
  name: string;
  schedule: string;
  timezone: string;
  type: "http" | "script";
  url?: string;
  httpMethod?: string;
  httpHeaders?: Record<string, string>;
  httpBody?: string;
  script?: string;
  isActive: boolean;
  retryCount: number;
  retryDelay: number;
  timeout: number;
  lastRunAt?: string;
  lastRunStatus?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  id: string;
  cronJobId: string;
  cronJob?: {
    id: string;
    name: string;
  };
  status: "success" | "failed" | "running";
  statusCode?: number;
  response?: string | Record<string, unknown>;
  error?: string;
  duration?: number;
  startedAt: string;
  finishedAt?: string;
}

export interface CreateJobData {
  name: string;
  schedule: string;
  timezone?: string;
  type: "http" | "script";
  url?: string;
  httpMethod?: string;
  httpHeaders?: Record<string, string>;
  httpBody?: string;
  script?: string;
  isActive?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface Stats {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
}

export interface DashboardStats {
  jobs: {
    total: number;
    active: number;
    paused: number;
  };
  executions: {
    total: number;
    successful: number;
    failed: number;
    successRate: string;
  };
  recentExecutions: (ExecutionLog & { cronJob: { id: string; name: string } })[];
}

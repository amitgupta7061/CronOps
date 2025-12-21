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
  verifyOTP: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-otp", data),
  resendOTP: (data: { email: string }) =>
    api.post("/auth/resend-otp", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put("/auth/me", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/auth/password", data),
  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),
  resetPassword: (data: { token: string; password: string }) =>
    api.post("/auth/reset-password", data),
};

// Jobs API
export const jobsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
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
  getAnalytics: (params?: { days?: number }) => api.get("/stats/analytics", { params }),
};

// Admin API
export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getAnalytics: (params?: { days?: number }) => api.get("/admin/analytics", { params }),
  getUsers: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/users", { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUserRole: (id: string, role: "USER" | "ADMIN") =>
    api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAllJobs: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get("/admin/jobs", { params }),
  getAllLogs: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get("/admin/logs", { params }),
};

// Users API
export const usersApi = {
  updatePlan: (plan: Plan) => api.put("/users/plan", { plan }),
};

// Types
export type Plan = "FREE" | "PREMIUM" | "PRO";

export interface User {
  id: string;
  email: string;
  name: string;
  role?: "USER" | "ADMIN";
  plan?: Plan;
  isVerified?: boolean;
  jobCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CronJob {
  id: string;
  userId: string;
  name: string;
  cronExpression: string;
  timezone: string;
  targetType: "HTTP" | "SCRIPT";
  targetUrl?: string;
  httpMethod?: string;
  headers?: Record<string, string>;
  payload?: string;
  command?: string;
  status: "ACTIVE" | "PAUSED";
  maxRetries: number;
  retryCount: number;
  timeout: number;
  lastRunAt?: string;
  lastStatus?: string;
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
  status: "SUCCESS" | "FAILED" | "success" | "failed" | "running";
  statusCode?: number;
  response?: string | Record<string, unknown>;
  error?: string;
  duration?: number;
  startedAt: string;
  finishedAt?: string;
}

export interface CreateJobData {
  name: string;
  cronExpression: string;
  timezone?: string;
  targetType: "HTTP" | "SCRIPT";
  targetUrl?: string;
  httpMethod?: string;
  headers?: Record<string, string>;
  payload?: string;
  command?: string;
  isActive?: boolean;
  retryCount?: number;
  maxRetries?: number;
  timeout?: number;
}

export interface Stats {
  jobs: {
    total: number;
    active: number;
    paused: number;
  };
  executions: {
    total: number;
    successful: number;
    failed: number;
    successRate: number | string;
  };
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

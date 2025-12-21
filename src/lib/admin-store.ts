import { create } from "zustand";
import { adminApi, User, CronJob } from "@/lib/api";

interface AdminStats {
    users: {
        total: number;
        verified: number;
        unverified: number;
    };
    jobs: {
        total: number;
        active: number;
        paused: number;
    };
    executions: {
        total: number;
        successful: number;
        failed: number;
        successRate: number;
    };
    recentUsers: User[];
    recentExecutions: Array<{
        id: string;
        status: string;
        startedAt: string;
        duration: number;
        cronJob: {
            id: string;
            name: string;
            user: {
                email: string;
            };
        };
    }>;
}

interface UserWithCount extends User {
    jobCount: number;
}

interface LogWithJob {
    id: string;
    status: string;
    responseCode?: number;
    responseBody?: string;
    errorMessage?: string;
    startedAt: string;
    finishedAt?: string;
    duration?: number;
    cronJob: {
        id: string;
        name: string;
        user: {
            id: string;
            email: string;
        };
    };
}

interface JobWithUser extends CronJob {
    user: {
        id: string;
        email: string;
        name: string;
    };
    executionCount: number;
}

interface AdminState {
    // Stats
    stats: AdminStats | null;
    statsLoading: boolean;
    statsLastFetched: number | null;

    // Users
    users: UserWithCount[];
    usersLoading: boolean;
    usersLastFetched: number | null;

    // Jobs
    jobs: JobWithUser[];
    jobsLoading: boolean;
    jobsLastFetched: number | null;
    jobsStatusFilter: string;

    // Logs
    logs: LogWithJob[];
    logsLoading: boolean;
    logsLastFetched: number | null;
    logsStatusFilter: string;

    // Actions
    fetchStats: (force?: boolean) => Promise<void>;
    fetchUsers: (force?: boolean) => Promise<void>;
    fetchJobs: (statusFilter?: string, force?: boolean) => Promise<void>;
    fetchLogs: (statusFilter?: string, force?: boolean) => Promise<void>;
    updateUserInCache: (userId: string, updates: Partial<UserWithCount>) => void;
    removeUserFromCache: (userId: string) => void;
    clearAll: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useAdminStore = create<AdminState>()((set, get) => ({
    // Initial state
    stats: null,
    statsLoading: false,
    statsLastFetched: null,

    users: [],
    usersLoading: false,
    usersLastFetched: null,

    jobs: [],
    jobsLoading: false,
    jobsLastFetched: null,
    jobsStatusFilter: "all",

    logs: [],
    logsLoading: false,
    logsLastFetched: null,
    logsStatusFilter: "all",

    fetchStats: async (force = false) => {
        const state = get();
        const now = Date.now();

        if (
            !force &&
            state.stats &&
            state.statsLastFetched &&
            now - state.statsLastFetched < CACHE_DURATION
        ) {
            return;
        }

        if (state.statsLoading) {
            return;
        }

        set({ statsLoading: true });

        try {
            const response = await adminApi.getStats();
            set({
                stats: response.data.data,
                statsLoading: false,
                statsLastFetched: Date.now(),
            });
        } catch (error) {
            set({ statsLoading: false });
            throw error;
        }
    },

    fetchUsers: async (force = false) => {
        const state = get();
        const now = Date.now();

        if (
            !force &&
            state.users.length > 0 &&
            state.usersLastFetched &&
            now - state.usersLastFetched < CACHE_DURATION
        ) {
            return;
        }

        if (state.usersLoading) {
            return;
        }

        set({ usersLoading: true });

        try {
            const response = await adminApi.getUsers({ limit: 100 });
            set({
                users: response.data.data.users,
                usersLoading: false,
                usersLastFetched: Date.now(),
            });
        } catch (error) {
            set({ usersLoading: false });
            throw error;
        }
    },

    fetchJobs: async (statusFilter = "all", force = false) => {
        const state = get();
        const now = Date.now();

        // If filter changed, we need to refetch
        const filterChanged = statusFilter !== state.jobsStatusFilter;

        if (
            !force &&
            !filterChanged &&
            state.jobs.length > 0 &&
            state.jobsLastFetched &&
            now - state.jobsLastFetched < CACHE_DURATION
        ) {
            return;
        }

        if (state.jobsLoading) {
            return;
        }

        set({ jobsLoading: true, jobsStatusFilter: statusFilter });

        try {
            const response = await adminApi.getAllJobs({
                limit: 100,
                status: statusFilter !== "all" ? statusFilter : undefined,
            });
            set({
                jobs: response.data.data.jobs,
                jobsLoading: false,
                jobsLastFetched: Date.now(),
            });
        } catch (error) {
            set({ jobsLoading: false });
            throw error;
        }
    },

    fetchLogs: async (statusFilter = "all", force = false) => {
        const state = get();
        const now = Date.now();

        // If filter changed, we need to refetch
        const filterChanged = statusFilter !== state.logsStatusFilter;

        if (
            !force &&
            !filterChanged &&
            state.logs.length > 0 &&
            state.logsLastFetched &&
            now - state.logsLastFetched < CACHE_DURATION
        ) {
            return;
        }

        if (state.logsLoading) {
            return;
        }

        set({ logsLoading: true, logsStatusFilter: statusFilter });

        try {
            const response = await adminApi.getAllLogs({
                limit: 100,
                status: statusFilter !== "all" ? statusFilter : undefined,
            });
            set({
                logs: response.data.data.logs,
                logsLoading: false,
                logsLastFetched: Date.now(),
            });
        } catch (error) {
            set({ logsLoading: false });
            throw error;
        }
    },

    updateUserInCache: (userId: string, updates: Partial<UserWithCount>) => {
        const state = get();
        set({
            users: state.users.map((u) =>
                u.id === userId ? { ...u, ...updates } : u
            ),
        });
    },

    removeUserFromCache: (userId: string) => {
        const state = get();
        set({
            users: state.users.filter((u) => u.id !== userId),
        });
    },

    clearAll: () => {
        set({
            stats: null,
            statsLastFetched: null,
            users: [],
            usersLastFetched: null,
            jobs: [],
            jobsLastFetched: null,
            jobsStatusFilter: "all",
            logs: [],
            logsLastFetched: null,
            logsStatusFilter: "all",
        });
    },
}));

// Export types for use in components
export type { UserWithCount, LogWithJob, JobWithUser, AdminStats };

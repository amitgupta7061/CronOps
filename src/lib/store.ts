import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, authApi } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: (force?: boolean) => Promise<void>;
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("token", accessToken);

        set({ user, isAuthenticated: true });
      },

      signup: async (email: string, password: string, name?: string) => {
        const response = await authApi.signup({ email, password, name });
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("token", accessToken);

        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Ignore errors during logout
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");

        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async (force = false) => {
        try {
          const state = get();
          // If already authenticated and not forced, skip refetch
          if (!force && state.isAuthenticated && state.user) {
            set({ isLoading: false });
            return;
          }

          const token = localStorage.getItem("accessToken");
          if (!token) {
            set({ isLoading: false });
            return;
          }

          // Always fetch fresh user data from server to get latest role
          const response = await authApi.getProfile();
          set({ user: response.data.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("token");
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setAuth: (user: User, token: string) => {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("token", token);
        set({ user, isAuthenticated: true, isLoading: false });
      },
    }),
    {
      name: "cronops-auth-v2",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

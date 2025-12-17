"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 minute
            staleTime: 60 * 2000,
            // If data is stale, refetch it in the background on window focus
            refetchOnWindowFocus: true,
            // Retry failed queries 1 time
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

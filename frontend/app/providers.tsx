"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { initAnalytics, identifyUser } from "@/lib/analytics";
import { useAuthStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const { user, isAuthenticated } = useAuthStore();

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Identify user when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      identifyUser(user.id, {
        email: user.email,
        name: user.full_name,
      });
    }
  }, [isAuthenticated, user]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

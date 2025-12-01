// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Data considered fresh for 2 minutes (good for medical data)
        staleTime: 2 * 60 * 1000,
        
        // Cache stored for 5 minutes before garbage collection
        gcTime: 5 * 60 * 1000,
        
        // Refetch when user returns to window (important for medical data)
        refetchOnWindowFocus: true,
        
        // Refetch when reconnecting to internet
        refetchOnReconnect: true,
        
        // Retry failed requests twice
        retry: 2,
        
        // Don't retry on 404s
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Shows dev tools only in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
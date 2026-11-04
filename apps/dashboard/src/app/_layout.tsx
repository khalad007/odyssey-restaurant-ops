import { setApiBaseUrl } from '@odyssey/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { useState } from 'react';

setApiBaseUrl(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787');

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}

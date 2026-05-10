import { StrictMode, useEffect, useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { AuthProvider, useAuth } from './context/auth';
import { initApiClient, BASE_URL } from './api/client';
import { theme } from './theme';
import type { AuthResponseDto } from '@quiniela/types';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppInit() {
  const { getToken, setAuth, clearAuth, user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  useLayoutEffect(() => {
    initApiClient(getToken);
  }, [getToken]);

  useEffect(() => {
    const handleRefreshed = (e: Event) => {
      const { accessToken } = (e as CustomEvent<{ accessToken: string }>).detail;
      if (userRef.current) setAuth(accessToken, userRef.current);
    };
    window.addEventListener('auth:refreshed', handleRefreshed);
    window.addEventListener('auth:expired', clearAuth);
    return () => {
      window.removeEventListener('auth:refreshed', handleRefreshed);
      window.removeEventListener('auth:expired', clearAuth);
    };
  }, [setAuth, clearAuth]);

  // Silent refresh on page load — pick up existing session from httpOnly cookie
  useEffect(() => {
    fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(r => (r.ok ? (r.json() as Promise<AuthResponseDto>) : null))
      .then(data => { if (data) setAuth(data.accessToken, data.user); })
      .catch(() => {});
  }, [setAuth]);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications />
        <AuthProvider>
          <AppInit />
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);

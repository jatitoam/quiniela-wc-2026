import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppShell, Container } from '@mantine/core';
import { useComputedColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppHeader } from '../components/layout/AppHeader';
import { AppNavbar } from '../components/layout/AppNavbar';
import { AppFooter } from '../components/layout/AppFooter';
import { BottomTabBar } from '../components/layout/BottomTabBar';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const [, { close }] = useDisclosure();
  const computedScheme = useComputedColorScheme('light');

  const headerBg = computedScheme === 'dark'
    ? 'rgba(11,27,59,0.88)'
    : 'rgba(255,255,255,0.88)';

  return (
    <AppShell
      header={{ height: { base: 56, sm: 64 } }}
      navbar={{ width: { sm: 220, lg: 260 }, breakpoint: 'sm', collapsed: { mobile: true } }}
      footer={{ height: { base: 72, sm: 40 } }}
      padding="md"
    >
      <AppShell.Header
        style={{
          backdropFilter: 'blur(12px) saturate(1.4)',
          background: headerBg,
          borderBottom: '3px solid',
          borderImage: 'linear-gradient(90deg, var(--mantine-color-wcGreen-6), var(--mantine-color-wcRed-5)) 1',
        }}
      >
        <AppHeader />
      </AppShell.Header>

      <AppShell.Navbar>
        <AppNavbar onNavClick={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg" px={{ base: 'sm', sm: 'md' }}>
          <Outlet />
        </Container>
      </AppShell.Main>

      <AppShell.Footer p={0}>
        <BottomTabBar />
        <AppFooter />
      </AppShell.Footer>
    </AppShell>
  );
}

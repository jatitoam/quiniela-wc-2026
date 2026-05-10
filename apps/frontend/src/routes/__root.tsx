import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppShell, Burger, Group, NavLink, Title, Menu, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/auth';
import { useLogout } from '../api/auth';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate({ to: '/leaderboard' });
  };

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Link to="/leaderboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Title order={4}>IH Quiniela 2026</Title>
            </Link>
          </Group>
          {user ? (
            <Menu>
              <Menu.Target>
                <Button variant="subtle" size="sm">{user.alias}</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => navigate({ to: '/participants/$alias', params: { alias: user.alias } })}>
                  My profile
                </Menu.Item>
                <Menu.Item component={Link} to="/predictions">
                  My predictions
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" onClick={handleLogout}>Log out</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group gap="xs">
              <Button variant="subtle" size="sm" component={Link} to="/login">Log in</Button>
              <Button size="sm" component={Link} to="/register">Register</Button>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <NavLink label="Leaderboard" component={Link} to="/leaderboard" />
        <NavLink label="Stages & Matches" component={Link} to="/stages" />
        {user && <NavLink label="My Predictions" component={Link} to="/predictions" />}
        {user?.roles.includes('ADMIN') && (
          <>
            <Text size="xs" fw={600} c="dimmed" mt="sm" px="sm">Admin</Text>
            <NavLink label="Registrations" component={Link} to="/admin/registrations" />
            <NavLink label="Enter Scores" component={Link} to="/admin/scores" />
            <NavLink label="Manage Matches" component={Link} to="/admin/matches" />
          </>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

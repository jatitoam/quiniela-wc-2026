import { Group, Title, Menu, Button, ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/auth';
import { useLogout } from '../../api/auth';

export function AppHeader() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme('light');

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate({ to: '/leaderboard' });
  };

  const toggleScheme = () => setColorScheme(computedScheme === 'dark' ? 'light' : 'dark');

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Link to="/leaderboard" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Group gap={8} wrap="nowrap">
          <span
            style={{
              fontSize: '1.4rem',
              lineHeight: 1,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.2))',
            }}
          >
            ⚽
          </span>
          <Title order={4} style={{ whiteSpace: 'nowrap' }}>IH Quiniela 2026</Title>
        </Group>
      </Link>

      <Group gap="xs" wrap="nowrap">
        <ActionIcon variant="subtle" size="sm" aria-label="Toggle color scheme" onClick={toggleScheme}>
          {computedScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
        </ActionIcon>

        {user ? (
          <Menu shadow="md" width={180}>
            <Menu.Target>
              <Button variant="subtle" size="sm">{user.alias}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() => navigate({ to: '/participants/$alias', params: { alias: user.alias } })}
              >
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
          <Group gap="xs" wrap="nowrap">
            <Button variant="subtle" size="sm" component={Link} to="/login">Log in</Button>
            <Button size="sm" component={Link} to="/register" visibleFrom="xs">Register</Button>
          </Group>
        )}
      </Group>
    </Group>
  );
}

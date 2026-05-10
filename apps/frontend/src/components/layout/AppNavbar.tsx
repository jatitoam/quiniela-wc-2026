import { NavLink, Text, Divider, Box } from '@mantine/core';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  IconTrophy, IconCalendarEvent, IconChartBar, IconUsers,
  IconClipboardList, IconBallFootball,
} from '@tabler/icons-react';
import { useAuth } from '../../context/auth';

interface AppNavbarProps {
  onNavClick?: () => void;
}

export function AppNavbar({ onNavClick }: AppNavbarProps) {
  const { user } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <Box p="xs">
      <NavLink
        label="Leaderboard"
        leftSection={<IconTrophy size={16} />}
        component={Link}
        to="/leaderboard"
        active={pathname === '/leaderboard'}
        onClick={onNavClick}
      />
      <NavLink
        label="Stages & Matches"
        leftSection={<IconCalendarEvent size={16} />}
        component={Link}
        to="/stages"
        active={pathname === '/stages'}
        onClick={onNavClick}
      />
      {user && (
        <NavLink
          label="My Predictions"
          leftSection={<IconBallFootball size={16} />}
          component={Link}
          to="/predictions"
          active={pathname === '/predictions'}
          onClick={onNavClick}
        />
      )}

      {user?.roles.includes('ADMIN') && (
        <>
          <Divider my="xs" />
          <Text size="xs" fw={600} c="dimmed" px="sm" mb={4}>Admin</Text>
          <NavLink
            label="Registrations"
            leftSection={<IconUsers size={16} />}
            component={Link}
            to="/admin/registrations"
            active={pathname.startsWith('/admin/registrations')}
            onClick={onNavClick}
          />
          <NavLink
            label="Enter Scores"
            leftSection={<IconChartBar size={16} />}
            component={Link}
            to="/admin/scores"
            active={pathname.startsWith('/admin/scores')}
            onClick={onNavClick}
          />
          <NavLink
            label="Manage Matches"
            leftSection={<IconClipboardList size={16} />}
            component={Link}
            to="/admin/matches"
            active={pathname.startsWith('/admin/matches')}
            onClick={onNavClick}
          />
        </>
      )}
    </Box>
  );
}

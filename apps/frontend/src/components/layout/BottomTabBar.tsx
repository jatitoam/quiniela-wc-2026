import { Box, Text, UnstyledButton } from '@mantine/core';
import { useRouterState, useNavigate } from '@tanstack/react-router';
import {
  IconTrophy, IconCalendarEvent, IconBallFootball,
  IconUser, IconSettings,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import { useAuth } from '../../context/auth';

interface TabDef {
  label: string;
  Icon: ComponentType<{ size?: number; stroke?: number }>;
  path: string;
  go: () => void;
}

export function BottomTabBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });

  const tabs: TabDef[] = [
    {
      label: 'Leaderboard',
      Icon: IconTrophy,
      path: '/leaderboard',
      go: () => navigate({ to: '/leaderboard' }),
    },
    {
      label: 'Matches',
      Icon: IconCalendarEvent,
      path: '/stages',
      go: () => navigate({ to: '/stages' }),
    },
    ...(user
      ? [
          {
            label: 'My Picks',
            Icon: IconBallFootball,
            path: '/predictions',
            go: () => navigate({ to: '/predictions' }),
          } as TabDef,
        ]
      : []),
    ...(user?.roles.includes('ADMIN')
      ? [
          {
            label: 'Admin',
            Icon: IconSettings,
            path: '/admin',
            go: () => navigate({ to: '/admin/registrations' }),
          } as TabDef,
        ]
      : []),
    {
      label: user ? 'Profile' : 'Log in',
      Icon: IconUser,
      path: user ? `/participants/${user.alias}` : '/login',
      go: () =>
        user
          ? navigate({ to: '/participants/$alias', params: { alias: user.alias } })
          : navigate({ to: '/login' }),
    },
  ];

  return (
    <Box
      hiddenFrom="sm"
      h="100%"
      style={{
        display: 'flex',
        borderTop: '1px solid var(--mantine-color-default-border)',
        background: 'var(--mantine-color-body)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(({ label, Icon, path, go }) => {
        const active = pathname === path || pathname.startsWith(path + '/');
        return (
          <UnstyledButton
            key={path}
            onClick={go}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              minHeight: 48,
              color: active
                ? 'var(--mantine-color-wcGreen-6)'
                : 'var(--mantine-color-dimmed)',
              borderTop: active
                ? '2px solid var(--mantine-color-wcGreen-6)'
                : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            <Icon size={20} stroke={active ? 2.2 : 1.6} />
            <Text
              fz={10}
              fw={active ? 700 : 400}
              lh={1}
              style={{ userSelect: 'none' }}
            >
              {label}
            </Text>
          </UnstyledButton>
        );
      })}
    </Box>
  );
}

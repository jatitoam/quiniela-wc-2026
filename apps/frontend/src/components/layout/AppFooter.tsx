import { Box, Group, Text, Anchor } from '@mantine/core';
import { Link } from '@tanstack/react-router';

export function AppFooter() {
  return (
    <Box
      visibleFrom="sm"
      component="footer"
      h="100%"
      px="md"
      style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: '1px solid var(--mantine-color-default-border)',
        background: 'var(--mantine-color-body)',
      }}
    >
      <Group justify="space-between" w="100%">
        <Text fz="xs" c="dimmed">⚽ IH Quiniela · WC 2026</Text>
        <Text fz="xs" c="dimmed">
          Entry fee Q200 ·{' '}
          <Anchor component={Link} to="/leaderboard" fz="xs">Leaderboard</Anchor>
        </Text>
      </Group>
    </Box>
  );
}

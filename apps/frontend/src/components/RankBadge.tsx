import { ThemeIcon, Text } from '@mantine/core';

const RANK_CONFIG: Record<number, { color: string; glow?: string; size: string }> = {
  1: { color: 'wcGold.5', glow: '0 0 14px rgba(244,196,48,0.65)', size: 'lg' },
  2: { color: 'gray.4', size: 'md' },
  3: { color: 'orange.5', size: 'md' },
};

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const cfg = RANK_CONFIG[rank];
  if (cfg) {
    return (
      <ThemeIcon
        size={cfg.size}
        radius="xl"
        color={cfg.color}
        variant="filled"
        style={cfg.glow ? { boxShadow: cfg.glow } : undefined}
      >
        <Text fw={700} fz="xs" c={rank === 1 ? 'dark' : 'white'}>{rank}</Text>
      </ThemeIcon>
    );
  }
  return (
    <ThemeIcon size="md" radius="xl" color="gray.1" variant="light">
      <Text fw={500} fz="xs" c="dimmed">{rank}</Text>
    </ThemeIcon>
  );
}

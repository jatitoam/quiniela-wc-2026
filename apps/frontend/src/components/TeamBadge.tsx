import { Group, Text, Badge } from '@mantine/core';
import { getTeamFlag } from '../lib/teamFlags';

interface TeamBadgeProps {
  code: string;
  name?: string;
  size?: 'sm' | 'md';
  align?: 'left' | 'center' | 'right';
}

export function TeamBadge({ code, name, size = 'md', align = 'left' }: TeamBadgeProps) {
  const flag = getTeamFlag(code);
  const fz = size === 'sm' ? 'xs' : 'sm';
  const flagSize = size === 'sm' ? '1rem' : '1.25rem';

  if (flag === '🏳') {
    return <Badge variant="light" color="gray">{code}</Badge>;
  }

  return (
    <Group gap={4} justify={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'} wrap="nowrap">
      <Text fz={flagSize} lh={1} style={{ flexShrink: 0 }}>{flag}</Text>
      <Text fz={fz} fw={600} truncate style={{ maxWidth: size === 'sm' ? 64 : 100 }}>
        {name ?? code}
      </Text>
    </Group>
  );
}

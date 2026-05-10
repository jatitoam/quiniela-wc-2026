import type { ReactNode } from 'react';
import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { useComputedColorScheme } from '@mantine/core';
import { gradients, type GradientName } from '../lib/gradients';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  gradient?: GradientName;
  rightSlot?: ReactNode;
}

const DOT_OVERLAY = `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`;

export function PageHero({ title, subtitle, emoji, gradient, rightSlot }: PageHeroProps) {
  const scheme = useComputedColorScheme('light');
  const bg = gradients[gradient ?? (scheme === 'dark' ? 'sky' : 'hosts')];

  return (
    <Box
      mb="lg"
      p={{ base: 'md', sm: 'xl' }}
      style={{
        background: bg,
        backgroundImage: `${DOT_OVERLAY} 0 0/18px 18px, ${bg}`,
        borderRadius: 'var(--mantine-radius-xl)',
        boxShadow: 'var(--mantine-shadow-md)',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="md" align="center" wrap="nowrap">
          {emoji && (
            <Text fz={{ base: 40, sm: 52 }} lh={1} style={{ flexShrink: 0 }}>
              {emoji}
            </Text>
          )}
          <Stack gap={2}>
            <Title
              order={1}
              c="white"
              style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', lineHeight: 1.1 }}
            >
              {title}
            </Title>
            {subtitle && (
              <Text fz={{ base: 'sm', sm: 'md' }} c="rgba(255,255,255,0.8)">
                {subtitle}
              </Text>
            )}
          </Stack>
        </Group>
        {rightSlot && <Box style={{ flexShrink: 0 }}>{rightSlot}</Box>}
      </Group>
    </Box>
  );
}

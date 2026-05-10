import { Card, Group, Text, Badge, Stack, Divider } from '@mantine/core';
import type { MatchDto, StageName } from '@quiniela/types';
import { TeamBadge } from './TeamBadge';

const STAGE_LABELS: Record<StageName, string> = {
  GROUP_STAGE: 'Group Stage',
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS: 'Semi-Finals',
  THIRD_PLACE: 'Third-Place',
  FINAL: 'Final',
};

interface MatchCardProps {
  match: MatchDto;
  predictionStatus?: 'submitted' | 'missing' | 'window-closed';
  children?: React.ReactNode;
}

export function MatchCard({ match, predictionStatus, children }: MatchCardProps) {
  const kickoff = new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(match.scheduledAt));

  const hasScore = match.score !== null;

  return (
    <Card
      padding="sm"
      style={{
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      styles={{
        root: {
          '@media (hover: hover)': {
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--mantine-shadow-md)' },
          },
          '&:active': { transform: 'scale(0.99)' },
        },
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Badge
            variant="gradient"
            gradient={{ from: 'wcGreen.6', to: 'wcGreen.8', deg: 135 }}
            size="xs"
            radius="xl"
          >
            {STAGE_LABELS[match.stageName]}
          </Badge>
          <Group gap={6} wrap="nowrap">
            {match.group && (
              <Badge variant="outline" color="gray" size="xs" radius="xl">{match.group.name}</Badge>
            )}
            {predictionStatus === 'submitted' && (
              <Badge variant="dot" color="wcGreen" size="xs">Predicted</Badge>
            )}
            {predictionStatus === 'missing' && (
              <Badge variant="dot" color="wcRed" size="xs">No prediction</Badge>
            )}
          </Group>
        </Group>

        <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
          <TeamBadge code={match.homeTeam.code} name={match.homeTeam.name} size="md" />

          <Stack gap={0} align="center" style={{ flexShrink: 0, minWidth: 64 }}>
            {hasScore ? (
              <Text
                fw={800}
                lh={1}
                style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontFamily: 'monospace' }}
              >
                {match.score!.homeGoals} – {match.score!.awayGoals}
              </Text>
            ) : (
              <Text fw={600} fz="sm" c="dimmed">vs</Text>
            )}
            {hasScore && match.score!.hadPenalties && (
              <Text fz={10} c="dimmed" fw={500}>pen.</Text>
            )}
            {hasScore && !match.score!.hadPenalties && match.score!.hadExtraTime && (
              <Text fz={10} c="dimmed" fw={500}>AET</Text>
            )}
          </Stack>

          <TeamBadge code={match.awayTeam.code} name={match.awayTeam.name} size="md" align="right" />
        </Group>

        <Divider />
        <Text fz="xs" c="dimmed" ta="center">{kickoff}</Text>

        {children}
      </Stack>
    </Card>
  );
}

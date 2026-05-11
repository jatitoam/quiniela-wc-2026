import { createFileRoute } from '@tanstack/react-router';
import {
  Badge, Container, Skeleton, Stack,
  Table, Text,
} from '@mantine/core';
import { useParticipant } from '../../api/users';
import { useAuth } from '../../context/auth';
import type { PredictionSummaryDto } from '@quiniela/types';
import { PageHero } from '../../components/PageHero';
import { RankBadge } from '../../components/RankBadge';
import { TeamBadge } from '../../components/TeamBadge';

export const Route = createFileRoute('/participants/$alias')({
  component: ParticipantPage,
});

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

function PredictionHistoryRow({ p }: { p: PredictionSummaryDto }) {
  const hasPrediction = p.homeGoals != null && p.awayGoals != null;
  return (
    <Table.Tr>
      <Table.Td w={160}><TeamBadge code={p.homeTeam.code} name={p.homeTeam.name} size="sm" /></Table.Td>
      <Table.Td ta="center" w={90}>
        {hasPrediction
          ? <Text size="sm" fw={600} ff="monospace">{p.homeGoals} – {p.awayGoals}</Text>
          : <Text size="sm" c="dimmed">—</Text>}
      </Table.Td>
      <Table.Td w={160}><TeamBadge code={p.awayTeam.code} name={p.awayTeam.name} size="sm" /></Table.Td>
      <Table.Td ta="center" w={90}>
        {p.score
          ? <Text size="sm" ff="monospace">{p.score.homeGoals} – {p.score.awayGoals}</Text>
          : <Text size="sm" c="dimmed">TBD</Text>}
      </Table.Td>
      <Table.Td ta="center" w={80}>
        {p.points != null
          ? <Badge variant="light" color={p.points > 0 ? 'wcGreen' : 'gray'}>{p.points} pts</Badge>
          : <Text size="sm" c="dimmed">—</Text>}
      </Table.Td>
      <Table.Td ta="right">
        <Text size="xs" c="dimmed">{formatDate(p.scheduledAt)}</Text>
      </Table.Td>
    </Table.Tr>
  );
}

function ParticipantPage() {
  const { alias } = Route.useParams();
  const { user } = useAuth();
  const { data: participant, isLoading } = useParticipant(alias);

  if (isLoading) {
    return (
      <Container size="md">
        <Stack gap="sm">
          <Skeleton h={120} radius="xl" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={40} />)}
        </Stack>
      </Container>
    );
  }

  if (!participant) {
    return (
      <Container size="md">
        <Text c="dimmed">Participant not found.</Text>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Stack gap="lg">
        <PageHero
          emoji="👤"
          title={participant.alias}
          subtitle={`${participant.totalPoints} points · Rank #${participant.rank}`}
          gradient="pitch"
          rightSlot={<RankBadge rank={participant.rank} />}
        />

        {user && participant.name && (
          <Text c="dimmed" size="sm">{participant.name}</Text>
        )}

        {participant.predictions.length > 0 ? (
          <Stack gap="xs">
            <Text fw={600} size="lg">Prediction history</Text>
            <Table.ScrollContainer minWidth={480}>
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Home</Table.Th>
                    <Table.Th ta="center">Pick</Table.Th>
                    <Table.Th>Away</Table.Th>
                    <Table.Th ta="center">Score</Table.Th>
                    <Table.Th ta="center">Pts</Table.Th>
                    <Table.Th ta="right">Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {participant.predictions.map(p => (
                    <PredictionHistoryRow key={p.matchId} p={p} />
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Stack>
        ) : (
          <Text c="dimmed" size="sm">No predictions visible yet.</Text>
        )}
      </Stack>
    </Container>
  );
}

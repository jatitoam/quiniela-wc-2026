import { createFileRoute } from '@tanstack/react-router';
import {
  Badge,
  Container,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useParticipant } from '../../api/users';
import { useAuth } from '../../context/auth';
import type { PredictionSummaryDto } from '@quiniela/types';

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
      <Table.Td w={160}>{p.homeTeam.name}</Table.Td>
      <Table.Td ta="center" w={90}>
        {hasPrediction ? (
          <Text size="sm" fw={600}>{p.homeGoals} – {p.awayGoals}</Text>
        ) : (
          <Text size="sm" c="dimmed">—</Text>
        )}
      </Table.Td>
      <Table.Td w={160}>{p.awayTeam.name}</Table.Td>
      <Table.Td ta="center" w={90}>
        {p.score ? (
          <Text size="sm">{p.score.homeGoals} – {p.score.awayGoals}</Text>
        ) : (
          <Text size="sm" c="dimmed">TBD</Text>
        )}
      </Table.Td>
      <Table.Td ta="center" w={80}>
        {p.points != null ? (
          <Badge variant="light" color={p.points > 0 ? 'blue' : 'gray'}>{p.points} pts</Badge>
        ) : (
          <Text size="sm" c="dimmed">—</Text>
        )}
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
          <Skeleton h={40} w={200} />
          <Skeleton h={24} w={120} />
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

  const rankColor = participant.rank === 1 ? 'yellow' : participant.rank === 2 ? 'gray' : participant.rank === 3 ? 'orange' : 'blue';

  return (
    <Container size="md">
      <Stack gap="lg">
        <Stack gap={4}>
          <Group gap="sm" align="baseline">
            <Title order={2}>{participant.alias}</Title>
            <Badge variant="light" color={rankColor} size="lg">#{participant.rank}</Badge>
          </Group>
          {user && participant.name && (
            <Text c="dimmed" size="sm">{participant.name}</Text>
          )}
          <Text fw={600} size="lg">{participant.totalPoints} points</Text>
        </Stack>

        {participant.predictions.length > 0 ? (
          <Stack gap="xs">
            <Title order={4}>Prediction history</Title>
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
          </Stack>
        ) : (
          <Text c="dimmed" size="sm">No predictions visible yet.</Text>
        )}
      </Stack>
    </Container>
  );
}

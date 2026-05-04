import { createFileRoute } from '@tanstack/react-router';
import { Accordion, Badge, Container, Group, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { useStages } from '../api/stages';
import type { MatchDto, StageName } from '@quiniela/types';

export const Route = createFileRoute('/stages')({
  component: StagesPage,
});

const STAGE_LABELS: Record<StageName, string> = {
  GROUP_STAGE: 'Group Stage',
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter Finals',
  SEMI_FINALS: 'Semi Finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

function MatchScoreCell({ match }: { match: MatchDto }) {
  if (!match.score) return <Text size="sm" c="dimmed" ta="center">vs</Text>;
  const { homeGoals, awayGoals, hadPenalties, hadExtraTime } = match.score;
  return (
    <Group gap={4} justify="center" wrap="nowrap">
      <Text size="sm" fw={700}>{homeGoals} – {awayGoals}</Text>
      {hadExtraTime && !hadPenalties && <Badge size="xs" variant="light" color="blue">AET</Badge>}
      {hadPenalties && <Badge size="xs" variant="light" color="orange">PKs</Badge>}
    </Group>
  );
}

function MatchTable({ matches }: { matches: MatchDto[] }) {
  const sorted = [...matches].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return (
    <Table highlightOnHover>
      <Table.Tbody>
        {sorted.map(m => (
          <Table.Tr key={m.id}>
            <Table.Td ta="right">{m.homeTeam.name}</Table.Td>
            <Table.Td w={140} ta="center"><MatchScoreCell match={m} /></Table.Td>
            <Table.Td>{m.awayTeam.name}</Table.Td>
            <Table.Td ta="right" w={190}>
              <Text size="xs" c="dimmed">{formatDate(m.scheduledAt)}</Text>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

function StagesPage() {
  const { data: stages, isLoading } = useStages();

  if (isLoading) {
    return (
      <Container size="md">
        <Stack gap="sm">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={60} />)}
        </Stack>
      </Container>
    );
  }

  const groupStage = stages?.find(s => s.name === 'GROUP_STAGE');
  const knockoutStages = stages?.filter(s => s.type === 'KNOCKOUT') ?? [];

  const matchesByGroup = new Map<string, MatchDto[]>();
  for (const match of groupStage?.matches ?? []) {
    const key = match.group?.name ?? 'Unknown';
    if (!matchesByGroup.has(key)) matchesByGroup.set(key, []);
    matchesByGroup.get(key)!.push(match);
  }
  const sortedGroups = [...matchesByGroup.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <Container size="md">
      <Stack gap="xl">
        <Title order={2}>Stages & Matches</Title>

        {groupStage && (
          <Stack gap="xs">
            <Title order={3}>Group Stage</Title>
            <Accordion variant="separated" multiple>
              {sortedGroups.map(([groupName, matches]) => (
                <Accordion.Item key={groupName} value={groupName}>
                  <Accordion.Control>
                    <Text fw={600}>Group {groupName}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <MatchTable matches={matches} />
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Stack>
        )}

        {knockoutStages.map(stage => (
          <Stack key={stage.id} gap="xs">
            <Title order={3}>{STAGE_LABELS[stage.name]}</Title>
            {stage.matches.length === 0 ? (
              <Text c="dimmed" size="sm">Matches will be announced once the bracket is set.</Text>
            ) : (
              <MatchTable matches={stage.matches} />
            )}
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}

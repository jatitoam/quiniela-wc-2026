import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Accordion,
  Anchor,
  Badge,
  Button,
  Checkbox,
  Container,
  Group,
  NumberInput,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/auth';
import { useStages } from '../api/stages';
import { useMyPredictions, useUpsertPrediction } from '../api/predictions';
import type { MatchDto, PredictionSummaryDto, StageType, UpsertPredictionDto } from '@quiniela/types';

export const Route = createFileRoute('/predictions')({
  component: PredictionsPage,
});

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

interface MatchPredictionRowProps {
  match: MatchDto;
  prediction: PredictionSummaryDto | undefined;
  stageType: StageType;
  windowOpen: boolean;
}

function MatchPredictionRow({ match, prediction, stageType, windowOpen }: MatchPredictionRowProps) {
  const upsert = useUpsertPrediction();
  const [homeGoals, setHomeGoals] = useState<number | string>(prediction?.homeGoals ?? '');
  const [awayGoals, setAwayGoals] = useState<number | string>(prediction?.awayGoals ?? '');
  const [predictedET, setPredictedET] = useState(prediction?.predictedExtraTime ?? false);
  const [penaltyWinnerId, setPenaltyWinnerId] = useState<string | null>(
    prediction?.predictedPenaltyWinnerId ?? null,
  );

  const isTiePrediction = typeof homeGoals === 'number' && typeof awayGoals === 'number' && homeGoals === awayGoals;
  const isKnockout = stageType === 'KNOCKOUT';

  const handleSave = async () => {
    if (typeof homeGoals !== 'number' || typeof awayGoals !== 'number') {
      notifications.show({ color: 'orange', message: 'Enter goals for both teams.' });
      return;
    }
    if (isKnockout && isTiePrediction && !penaltyWinnerId) {
      notifications.show({ color: 'orange', message: 'Select the penalty shootout winner.' });
      return;
    }

    const dto: UpsertPredictionDto = isKnockout
      ? {
          matchId: match.id,
          homeGoals,
          awayGoals,
          predictedExtraTime: isTiePrediction ? true : predictedET,
          predictedPenaltyWinnerId: isTiePrediction ? penaltyWinnerId : null,
        }
      : { matchId: match.id, homeGoals, awayGoals };

    try {
      await upsert.mutateAsync(dto);
      notifications.show({ color: 'green', message: 'Prediction saved.' });
    } catch {
      notifications.show({ color: 'red', message: 'Failed to save prediction.' });
    }
  };

  const penaltyOptions = [
    { value: match.homeTeam.id, label: match.homeTeam.name },
    { value: match.awayTeam.id, label: match.awayTeam.name },
  ];

  if (!windowOpen) {
    // Read-only: show prediction + score + points
    return (
      <Table.Tr>
        <Table.Td w={200}>{match.homeTeam.name}</Table.Td>
        <Table.Td ta="center" w={80}>
          {prediction ? (
            <Text size="sm" fw={600}>{prediction.homeGoals} – {prediction.awayGoals}</Text>
          ) : (
            <Text size="sm" c="dimmed">—</Text>
          )}
        </Table.Td>
        <Table.Td w={200}>{match.awayTeam.name}</Table.Td>
        <Table.Td ta="center" w={100}>
          {match.score ? (
            <Text size="sm" fw={600}>{match.score.homeGoals} – {match.score.awayGoals}</Text>
          ) : (
            <Text size="sm" c="dimmed">TBD</Text>
          )}
        </Table.Td>
        <Table.Td ta="center" w={80}>
          {prediction?.points != null ? (
            <Badge color="blue" variant="light">{prediction.points} pts</Badge>
          ) : (
            <Text size="sm" c="dimmed">—</Text>
          )}
        </Table.Td>
        <Table.Td ta="right" w={160}>
          <Text size="xs" c="dimmed">{formatDate(match.scheduledAt)}</Text>
        </Table.Td>
      </Table.Tr>
    );
  }

  return (
    <Table.Tr>
      <Table.Td w={160}>{match.homeTeam.name}</Table.Td>
      <Table.Td w={180}>
        <Group gap="xs" wrap="nowrap">
          <NumberInput
            value={homeGoals}
            onChange={setHomeGoals}
            min={0}
            max={99}
            allowDecimal={false}
            allowNegative={false}
            hideControls
            w={52}
            size="xs"
          />
          <Text>–</Text>
          <NumberInput
            value={awayGoals}
            onChange={setAwayGoals}
            min={0}
            max={99}
            allowDecimal={false}
            allowNegative={false}
            hideControls
            w={52}
            size="xs"
          />
        </Group>
      </Table.Td>
      <Table.Td w={160}>{match.awayTeam.name}</Table.Td>
      {isKnockout && (
        <Table.Td w={280}>
          {isTiePrediction ? (
            <Select
              placeholder="Penalty winner"
              data={penaltyOptions}
              value={penaltyWinnerId}
              onChange={setPenaltyWinnerId}
              size="xs"
              w={200}
            />
          ) : (
            <Checkbox
              label="Won in extra time"
              checked={predictedET}
              onChange={(e) => setPredictedET(e.currentTarget.checked)}
              size="xs"
            />
          )}
        </Table.Td>
      )}
      <Table.Td>
        <Button size="xs" variant="light" loading={upsert.isPending} onClick={handleSave}>
          Save
        </Button>
      </Table.Td>
      <Table.Td ta="right">
        <Text size="xs" c="dimmed">{formatDate(match.scheduledAt)}</Text>
      </Table.Td>
    </Table.Tr>
  );
}

function PredictionsPage() {
  const { user } = useAuth();
  const { data: stages, isLoading: stagesLoading } = useStages();
  const { data: predictions, isLoading: predsLoading } = useMyPredictions(undefined, { enabled: !!user });

  const predMap = useMemo(() => {
    const m = new Map<string, PredictionSummaryDto>();
    for (const p of predictions ?? []) m.set(p.matchId, p);
    return m;
  }, [predictions]);

  if (!user) {
    return (
      <Container size="md">
        <Text>
          <Anchor component={Link} to="/login">Log in</Anchor> to submit predictions.
        </Text>
      </Container>
    );
  }

  if (user.registration?.status !== 'CONFIRMED') {
    return (
      <Container size="md">
        <Stack gap="sm">
          <Title order={2}>My Predictions</Title>
          <Text c="dimmed">
            Your registration is pending admin confirmation. Once confirmed, you can submit predictions.
          </Text>
        </Stack>
      </Container>
    );
  }

  if (stagesLoading || predsLoading) {
    return (
      <Container size="md">
        <Stack gap="sm">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={60} />)}
        </Stack>
      </Container>
    );
  }

  const groupStage = stages?.find(s => s.name === 'GROUP_STAGE');
  const knockoutStages = stages?.filter(s => s.type === 'KNOCKOUT') ?? [];

  // Group stage: group matches by group name
  const matchesByGroup = new Map<string, MatchDto[]>();
  for (const match of groupStage?.matches ?? []) {
    const key = match.group?.name ?? 'Unknown';
    if (!matchesByGroup.has(key)) matchesByGroup.set(key, []);
    matchesByGroup.get(key)!.push(match);
  }
  const sortedGroups = [...matchesByGroup.entries()].sort(([a], [b]) => a.localeCompare(b));
  const windowOpen = groupStage?.windowOpen ?? false;

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Title order={2}>My Predictions</Title>

        {groupStage && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Title order={3}>Group Stage</Title>
              {windowOpen ? (
                <Badge color="green" variant="light">Window open</Badge>
              ) : (
                <Badge color="gray" variant="light">Window closed</Badge>
              )}
            </Group>
            <Accordion variant="separated" multiple>
              {sortedGroups.map(([groupName, matches]) => {
                const sorted = [...matches].sort(
                  (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
                );
                return (
                  <Accordion.Item key={groupName} value={groupName}>
                    <Accordion.Control>
                      <Text fw={600}>Group {groupName}</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Home</Table.Th>
                            <Table.Th>{windowOpen ? 'Your pick' : 'Your pick'}</Table.Th>
                            <Table.Th>Away</Table.Th>
                            {!windowOpen && <Table.Th ta="center">Score</Table.Th>}
                            {!windowOpen && <Table.Th ta="center">Pts</Table.Th>}
                            {windowOpen && <Table.Th />}
                            <Table.Th ta="right">Date</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {sorted.map(m => (
                            <MatchPredictionRow
                              key={m.id}
                              match={m}
                              prediction={predMap.get(m.id)}
                              stageType="GROUP"
                              windowOpen={windowOpen}
                            />
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Stack>
        )}

        {knockoutStages.map(stage => (
          <Stack key={stage.id} gap="xs">
            <Group justify="space-between">
              <Title order={3}>{stage.name.replace(/_/g, ' ')}</Title>
              {stage.windowOpen ? (
                <Badge color="green" variant="light">Window open</Badge>
              ) : (
                <Badge color="gray" variant="light">Window closed</Badge>
              )}
            </Group>
            {stage.matches.length === 0 ? (
              <Text c="dimmed" size="sm">Matches not yet announced.</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Home</Table.Th>
                    <Table.Th>Your pick</Table.Th>
                    <Table.Th>Away</Table.Th>
                    {stage.windowOpen && <Table.Th>ET / PKs</Table.Th>}
                    {!stage.windowOpen && <Table.Th ta="center">Score</Table.Th>}
                    {!stage.windowOpen && <Table.Th ta="center">Pts</Table.Th>}
                    {stage.windowOpen && <Table.Th />}
                    <Table.Th ta="right">Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {stage.matches.map(m => (
                    <MatchPredictionRow
                      key={m.id}
                      match={m}
                      prediction={predMap.get(m.id)}
                      stageType="KNOCKOUT"
                      windowOpen={stage.windowOpen}
                    />
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}

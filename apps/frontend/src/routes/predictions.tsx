import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Accordion, Anchor, Badge, Button, Card, Checkbox, Container,
  Divider, Group, NumberInput, Select, Skeleton, Stack, Table, Text, Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/auth';
import { useStages } from '../api/stages';
import { useMyPredictions, useUpsertPrediction } from '../api/predictions';
import type { MatchDto, PredictionSummaryDto, StageType, UpsertPredictionDto } from '@quiniela/types';
import { TeamBadge } from '../components/TeamBadge';
import { PageHero } from '../components/PageHero';

export const Route = createFileRoute('/predictions')({
  component: PredictionsPage,
});

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

interface PredictionFormProps {
  match: MatchDto;
  prediction: PredictionSummaryDto | undefined;
  stageType: StageType;
  windowOpen: boolean;
}

function usePredictionForm(match: MatchDto, prediction: PredictionSummaryDto | undefined, stageType: StageType) {
  const upsert = useUpsertPrediction();
  const [homeGoals, setHomeGoals] = useState<number | string>(prediction?.homeGoals ?? '');
  const [awayGoals, setAwayGoals] = useState<number | string>(prediction?.awayGoals ?? '');
  const [predictedET, setPredictedET] = useState(prediction?.predictedExtraTime ?? false);
  const [penaltyWinnerId, setPenaltyWinnerId] = useState<string | null>(
    prediction?.predictedPenaltyWinnerId ?? null,
  );

  const isTie = typeof homeGoals === 'number' && typeof awayGoals === 'number' && homeGoals === awayGoals;
  const isKnockout = stageType === 'KNOCKOUT';
  const canSave = typeof homeGoals === 'number' && typeof awayGoals === 'number';

  const penaltyOptions = [
    { value: match.homeTeam.id, label: match.homeTeam.name },
    { value: match.awayTeam.id, label: match.awayTeam.name },
  ];

  const handleSave = async () => {
    if (!canSave) {
      notifications.show({ color: 'orange', message: 'Enter goals for both teams.' });
      return;
    }
    if (isKnockout && isTie && !penaltyWinnerId) {
      notifications.show({ color: 'orange', message: 'Select the penalty shootout winner.' });
      return;
    }
    const dto: UpsertPredictionDto = isKnockout
      ? { matchId: match.id, homeGoals: homeGoals as number, awayGoals: awayGoals as number,
          predictedExtraTime: isTie ? true : predictedET,
          predictedPenaltyWinnerId: isTie ? penaltyWinnerId : null }
      : { matchId: match.id, homeGoals: homeGoals as number, awayGoals: awayGoals as number };
    try {
      await upsert.mutateAsync(dto);
      notifications.show({ color: 'green', message: 'Prediction saved.' });
    } catch {
      notifications.show({ color: 'red', message: 'Failed to save prediction.' });
    }
  };

  return {
    homeGoals, setHomeGoals, awayGoals, setAwayGoals,
    predictedET, setPredictedET, penaltyWinnerId, setPenaltyWinnerId,
    isTie, isKnockout, canSave, penaltyOptions, handleSave, upsert,
  };
}

function PredictionCardMobile({ match, prediction, stageType, windowOpen }: PredictionFormProps) {
  const f = usePredictionForm(match, prediction, stageType);

  if (!windowOpen) {
    return (
      <Card p="md">
        <Stack gap="sm">
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6}>
              <TeamBadge code={match.homeTeam.code} name={match.homeTeam.name} size="md" />
              <Text fz="xs" c="dimmed">vs</Text>
              <TeamBadge code={match.awayTeam.code} name={match.awayTeam.name} size="md" />
            </Group>
            {prediction?.points != null && (
              <Badge color="wcGreen" variant="light" radius="xl">{prediction.points} pts</Badge>
            )}
          </Group>
          <Divider />
          <Group justify="space-between">
            <Stack gap={0}>
              <Text fz="xs" c="dimmed">Your pick</Text>
              <Text fw={700} ff="monospace">
                {prediction ? `${prediction.homeGoals} – ${prediction.awayGoals}` : '—'}
              </Text>
            </Stack>
            <Stack gap={0} ta="right">
              <Text fz="xs" c="dimmed">Score</Text>
              <Text fw={700} ff="monospace">
                {match.score ? `${match.score.homeGoals} – ${match.score.awayGoals}` : 'TBD'}
              </Text>
            </Stack>
          </Group>
          <Text fz="xs" c="dimmed" ta="right">{formatDate(match.scheduledAt)}</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fz="xs" c="dimmed">{formatDate(match.scheduledAt)}</Text>
        </Group>

        <Stack gap="xs">
          <TeamBadge code={match.homeTeam.code} name={match.homeTeam.name} size="md" />

          <Group gap="xs" justify="center">
            <NumberInput
              value={f.homeGoals} onChange={f.setHomeGoals}
              min={0} max={99} allowDecimal={false} allowNegative={false}
              hideControls w={72} size="lg" ta="center"
              styles={{ input: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 } }}
            />
            <Text fw={600} fz="lg" c="dimmed">–</Text>
            <NumberInput
              value={f.awayGoals} onChange={f.setAwayGoals}
              min={0} max={99} allowDecimal={false} allowNegative={false}
              hideControls w={72} size="lg" ta="center"
              styles={{ input: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 } }}
            />
          </Group>

          <TeamBadge code={match.awayTeam.code} name={match.awayTeam.name} size="md" />
        </Stack>

        {f.isKnockout && (
          f.isTie ? (
            <Select
              placeholder="Penalty shootout winner"
              data={f.penaltyOptions}
              value={f.penaltyWinnerId}
              onChange={f.setPenaltyWinnerId}
              size="md"
            />
          ) : (
            <Checkbox
              label="Won in extra time"
              checked={f.predictedET}
              onChange={e => f.setPredictedET(e.currentTarget.checked)}
              size="md"
            />
          )
        )}

        <Button
          fullWidth
          radius="xl"
          size="md"
          disabled={!f.canSave}
          loading={f.upsert.isPending}
          onClick={f.handleSave}
        >
          Save prediction
        </Button>
      </Stack>
    </Card>
  );
}

function PredictionRowDesktop({ match, prediction, stageType, windowOpen }: PredictionFormProps) {
  const f = usePredictionForm(match, prediction, stageType);

  if (!windowOpen) {
    return (
      <Table.Tr>
        <Table.Td w={180}><TeamBadge code={match.homeTeam.code} name={match.homeTeam.name} size="sm" /></Table.Td>
        <Table.Td ta="center" w={80}>
          {prediction
            ? <Text size="sm" fw={600} ff="monospace">{prediction.homeGoals} – {prediction.awayGoals}</Text>
            : <Text size="sm" c="dimmed">—</Text>}
        </Table.Td>
        <Table.Td w={180}><TeamBadge code={match.awayTeam.code} name={match.awayTeam.name} size="sm" /></Table.Td>
        <Table.Td ta="center" w={100}>
          {match.score
            ? <Text size="sm" fw={600} ff="monospace">{match.score.homeGoals} – {match.score.awayGoals}</Text>
            : <Text size="sm" c="dimmed">TBD</Text>}
        </Table.Td>
        <Table.Td ta="center" w={80}>
          {prediction?.points != null
            ? <Badge color="wcGreen" variant="light">{prediction.points} pts</Badge>
            : <Text size="sm" c="dimmed">—</Text>}
        </Table.Td>
        <Table.Td ta="right" w={160}>
          <Text size="xs" c="dimmed">{formatDate(match.scheduledAt)}</Text>
        </Table.Td>
      </Table.Tr>
    );
  }

  return (
    <Table.Tr>
      <Table.Td w={160}><TeamBadge code={match.homeTeam.code} name={match.homeTeam.name} size="sm" /></Table.Td>
      <Table.Td w={180}>
        <Group gap="xs" wrap="nowrap">
          <NumberInput value={f.homeGoals} onChange={f.setHomeGoals} min={0} max={99}
            allowDecimal={false} allowNegative={false} hideControls w={52} size="xs" />
          <Text>–</Text>
          <NumberInput value={f.awayGoals} onChange={f.setAwayGoals} min={0} max={99}
            allowDecimal={false} allowNegative={false} hideControls w={52} size="xs" />
        </Group>
      </Table.Td>
      <Table.Td w={160}><TeamBadge code={match.awayTeam.code} name={match.awayTeam.name} size="sm" /></Table.Td>
      {f.isKnockout && (
        <Table.Td w={280}>
          {f.isTie ? (
            <Select placeholder="Penalty winner" data={f.penaltyOptions}
              value={f.penaltyWinnerId} onChange={f.setPenaltyWinnerId} size="xs" w={200} />
          ) : (
            <Checkbox label="Won in extra time" checked={f.predictedET}
              onChange={e => f.setPredictedET(e.currentTarget.checked)} size="xs" />
          )}
        </Table.Td>
      )}
      <Table.Td>
        <Button size="xs" variant="light" loading={f.upsert.isPending} onClick={f.handleSave}>
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
  const isDesktop = useMediaQuery('(min-width: 48em)', true);

  const predMap = useMemo(() => {
    const m = new Map<string, PredictionSummaryDto>();
    for (const p of predictions ?? []) m.set(p.matchId, p);
    return m;
  }, [predictions]);

  if (!user) {
    return (
      <Container size="md">
        <Text><Anchor component={Link} to="/login">Log in</Anchor> to submit predictions.</Text>
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

  const matchesByGroup = new Map<string, MatchDto[]>();
  for (const match of groupStage?.matches ?? []) {
    const key = match.group?.name ?? 'Unknown';
    if (!matchesByGroup.has(key)) matchesByGroup.set(key, []);
    matchesByGroup.get(key)!.push(match);
  }
  const sortedGroups = [...matchesByGroup.entries()].sort(([a], [b]) => a.localeCompare(b));
  const windowOpen = groupStage?.windowOpen ?? false;

  const renderMatches = (matches: MatchDto[], type: StageType, open: boolean) =>
    isDesktop ? null : (
      <Stack gap="sm">
        {[...matches]
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          .map(m => (
            <PredictionCardMobile
              key={m.id} match={m}
              prediction={predMap.get(m.id)}
              stageType={type} windowOpen={open}
            />
          ))}
      </Stack>
    );

  const renderTable = (matches: MatchDto[], type: StageType, open: boolean) =>
    !isDesktop ? null : (
      <Table.ScrollContainer minWidth={520}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Home</Table.Th>
              <Table.Th>Your pick</Table.Th>
              <Table.Th>Away</Table.Th>
              {type === 'KNOCKOUT' && open && <Table.Th>ET / PKs</Table.Th>}
              {!open && <Table.Th ta="center">Score</Table.Th>}
              {!open && <Table.Th ta="center">Pts</Table.Th>}
              {open && <Table.Th />}
              <Table.Th ta="right">Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[...matches]
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .map(m => (
                <PredictionRowDesktop
                  key={m.id} match={m}
                  prediction={predMap.get(m.id)}
                  stageType={type} windowOpen={open}
                />
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );

  const windowBadge = (
    <Badge
      color={windowOpen ? 'wcGreen' : 'gray'}
      variant="light"
      radius="xl"
      size="lg"
    >
      {windowOpen ? 'Window open' : 'Window closed'}
    </Badge>
  );

  return (
    <Container size="lg">
      <Stack gap="xl">
        <PageHero
          emoji="🎯"
          title="My Predictions"
          subtitle="Lock in before kick-off"
          rightSlot={groupStage ? windowBadge : undefined}
        />

        {groupStage && (
          <Stack gap="xs">
            <Title order={3}>Group Stage</Title>
            <Accordion variant="separated" radius="lg" multiple>
              {sortedGroups.map(([groupName, matches]) => (
                <Accordion.Item key={groupName} value={groupName}>
                  <Accordion.Control>
                    <Text fw={600}>Group {groupName}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {renderMatches(matches, 'GROUP', windowOpen)}
                    {renderTable(matches, 'GROUP', windowOpen)}
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Stack>
        )}

        {knockoutStages.map(stage => (
          <Stack key={stage.id} gap="xs">
            <Group justify="space-between">
              <Title order={3}>{stage.name.replace(/_/g, ' ')}</Title>
              <Badge color={stage.windowOpen ? 'wcGreen' : 'gray'} variant="light" radius="xl">
                {stage.windowOpen ? 'Window open' : 'Window closed'}
              </Badge>
            </Group>
            {stage.matches.length === 0 ? (
              <Text c="dimmed" size="sm">Matches not yet announced.</Text>
            ) : (
              <>
                {renderMatches(stage.matches, 'KNOCKOUT', stage.windowOpen)}
                {renderTable(stage.matches, 'KNOCKOUT', stage.windowOpen)}
              </>
            )}
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}

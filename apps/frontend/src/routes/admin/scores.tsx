import { createFileRoute } from '@tanstack/react-router';
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Group,
  Modal,
  NumberInput,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useAuth } from '../../context/auth';
import { useStages } from '../../api/stages';
import { useEnterScore } from '../../api/admin';
import type { AdminEnterScoreDto, MatchDto, StageName } from '@quiniela/types';

export const Route = createFileRoute('/admin/scores')({
  component: AdminScoresPage,
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
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

interface ScoreFormValues {
  homeGoals: number | string;
  awayGoals: number | string;
  hadExtraTime: boolean;
  hadPenalties: boolean;
  penaltyWinnerId: string | null;
}

interface ScoreModalProps {
  match: MatchDto;
  opened: boolean;
  onClose: () => void;
}

function ScoreModal({ match, opened, onClose }: ScoreModalProps) {
  const enterScore = useEnterScore();
  const isKnockout = match.stageName !== 'GROUP_STAGE';
  const existing = match.score;

  const form = useForm<ScoreFormValues>({
    initialValues: {
      homeGoals: existing?.homeGoals ?? '',
      awayGoals: existing?.awayGoals ?? '',
      hadExtraTime: existing?.hadExtraTime ?? false,
      hadPenalties: existing?.hadPenalties ?? false,
      penaltyWinnerId: existing?.penaltyWinnerId ?? null,
    },
    validate: {
      homeGoals: (v) => (typeof v !== 'number' ? 'Required' : null),
      awayGoals: (v) => (typeof v !== 'number' ? 'Required' : null),
    },
  });

  const homeGoals = form.values.homeGoals;
  const awayGoals = form.values.awayGoals;
  const isTie = typeof homeGoals === 'number' && typeof awayGoals === 'number' && homeGoals === awayGoals;

  const handleSubmit = form.onSubmit(async (values) => {
    if (typeof values.homeGoals !== 'number' || typeof values.awayGoals !== 'number') return;
    const dto: AdminEnterScoreDto = {
      matchId: match.id,
      homeGoals: values.homeGoals,
      awayGoals: values.awayGoals,
    };
    if (isKnockout) {
      dto.hadExtraTime = values.hadExtraTime || isTie;
      dto.hadPenalties = isTie ? values.hadPenalties : false;
      dto.penaltyWinnerId = isTie && values.hadPenalties ? (values.penaltyWinnerId ?? undefined) : undefined;
    }
    try {
      await enterScore.mutateAsync(dto);
      notifications.show({ color: 'green', message: 'Score saved and points recalculated.' });
      onClose();
    } catch {
      notifications.show({ color: 'red', message: 'Failed to save score.' });
    }
  });

  const penaltyOptions = [
    { value: match.homeTeam.id, label: match.homeTeam.name },
    { value: match.awayTeam.id, label: match.awayTeam.name },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <Group gap="xs" align="flex-end">
            <NumberInput
              label={match.homeTeam.name}
              value={form.values.homeGoals}
              onChange={(v) => form.setFieldValue('homeGoals', v)}
              min={0}
              max={99}
              allowDecimal={false}
              allowNegative={false}
              hideControls
              w={80}
            />
            <Text mb={6}>–</Text>
            <NumberInput
              label={match.awayTeam.name}
              value={form.values.awayGoals}
              onChange={(v) => form.setFieldValue('awayGoals', v)}
              min={0}
              max={99}
              allowDecimal={false}
              allowNegative={false}
              hideControls
              w={80}
            />
          </Group>

          {isKnockout && (
            <>
              {!isTie && (
                <Checkbox
                  label="Won in extra time (AET)"
                  {...form.getInputProps('hadExtraTime', { type: 'checkbox' })}
                />
              )}
              {isTie && (
                <Checkbox
                  label="Went to penalty shootout"
                  {...form.getInputProps('hadPenalties', { type: 'checkbox' })}
                />
              )}
              {isTie && form.values.hadPenalties && (
                <Select
                  label="Penalty shootout winner"
                  data={penaltyOptions}
                  value={form.values.penaltyWinnerId}
                  onChange={(v) => form.setFieldValue('penaltyWinnerId', v)}
                />
              )}
            </>
          )}

          <Button type="submit" loading={enterScore.isPending} mt="sm">
            Save score
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

function MatchScoreRow({ match }: { match: MatchDto }) {
  const [opened, { open, close }] = useDisclosure(false);
  const locked = match.score?.lockedAt != null;

  return (
    <>
      <Table.Tr>
        <Table.Td>{match.homeTeam.name}</Table.Td>
        <Table.Td ta="center" w={100}>
          {match.score ? (
            <Group gap={4} justify="center">
              <Text size="sm" fw={600}>{match.score.homeGoals} – {match.score.awayGoals}</Text>
              {locked && <Badge size="xs" color="gray" variant="outline">locked</Badge>}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">—</Text>
          )}
        </Table.Td>
        <Table.Td>{match.awayTeam.name}</Table.Td>
        <Table.Td ta="right" w={160}>
          <Text size="xs" c="dimmed">{formatDate(match.scheduledAt)}</Text>
        </Table.Td>
        <Table.Td ta="right" w={130}>
          {locked ? (
            <Text size="xs" c="dimmed">Immutable</Text>
          ) : (
            <Button size="xs" variant="light" onClick={open}>
              {match.score ? 'Edit score' : 'Enter score'}
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
      <ScoreModal match={match} opened={opened} onClose={close} />
    </>
  );
}

function AdminScoresPage() {
  const { user } = useAuth();
  const { data: stages, isLoading } = useStages();
  const [stageFilter, setStageFilter] = useState<string | null>(null);

  if (!user?.roles.includes('ADMIN')) {
    return (
      <Container size="sm">
        <Text c="dimmed">Access denied.</Text>
      </Container>
    );
  }

  const stageOptions = stages?.map(s => ({ value: s.id, label: STAGE_LABELS[s.name] })) ?? [];
  const selectedStage = stageFilter
    ? stages?.find(s => s.id === stageFilter)
    : stages?.[0];

  return (
    <Container size="lg">
      <Stack gap="lg">
        <Title order={2}>Enter Scores</Title>

        {isLoading ? (
          <Stack gap="sm">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={50} />)}</Stack>
        ) : (
          <>
            <Select
              label="Stage"
              data={stageOptions}
              value={stageFilter ?? selectedStage?.id ?? null}
              onChange={setStageFilter}
              w={260}
            />

            {selectedStage && (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Home</Table.Th>
                    <Table.Th ta="center">Score</Table.Th>
                    <Table.Th>Away</Table.Th>
                    <Table.Th ta="right">Date</Table.Th>
                    <Table.Th ta="right">Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedStage.matches
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .map(m => <MatchScoreRow key={m.id} match={m} />)}
                </Table.Tbody>
              </Table>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}

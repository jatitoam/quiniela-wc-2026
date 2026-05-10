import { createFileRoute } from '@tanstack/react-router';
import {
  Button,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../context/auth';
import { useStages, useTeams } from '../../api/stages';
import { useCreateMatch } from '../../api/admin';
import type { StageName } from '@quiniela/types';

export const Route = createFileRoute('/admin/matches')({
  component: AdminMatchesPage,
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

function AdminMatchesPage() {
  const { user } = useAuth();
  const { data: stages } = useStages();
  const teams = useTeams();
  const createMatch = useCreateMatch();

  const form = useForm({
    initialValues: {
      stageId: '',
      homeTeamId: '',
      awayTeamId: '',
      scheduledAt: '',
    },
    validate: {
      stageId: (v) => (v ? null : 'Required'),
      homeTeamId: (v) => (v ? null : 'Required'),
      awayTeamId: (v) => (v ? null : 'Required'),
      scheduledAt: (v) => (v ? null : 'Required'),
    },
  });

  if (!user?.roles.includes('ADMIN')) {
    return (
      <Container size="sm">
        <Text c="dimmed">Access denied.</Text>
      </Container>
    );
  }

  const knockoutStages = stages?.filter(s => s.type === 'KNOCKOUT') ?? [];
  const stageOptions = knockoutStages.map(s => ({ value: s.id, label: STAGE_LABELS[s.name] }));
  const teamOptions = teams.map(t => ({ value: t.id, label: `${t.name} (${t.code})` }));

  const handleSubmit = form.onSubmit(async (values) => {
    const dto = {
      stageId: values.stageId,
      homeTeamId: values.homeTeamId,
      awayTeamId: values.awayTeamId,
      scheduledAt: new Date(values.scheduledAt).toISOString(),
    };
    try {
      await createMatch.mutateAsync(dto);
      notifications.show({ color: 'green', message: 'Match created.' });
      form.reset();
    } catch {
      notifications.show({ color: 'red', message: 'Failed to create match.' });
    }
  });

  const selectedStageId = form.values.stageId;
  const recentMatches = stages
    ?.find(s => s.id === selectedStageId)
    ?.matches.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    ?? [];

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Title order={2}>Manage Matches</Title>
        <Text size="sm" c="dimmed">
          Use this page to create knockout round matches once the bracket is determined.
          Group stage matches are seeded automatically.
        </Text>

        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="md">Create match</Title>
          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <Select
                label="Stage"
                data={stageOptions}
                placeholder="Select knockout stage"
                {...form.getInputProps('stageId')}
              />
              <Group grow>
                <Select
                  label="Home team"
                  data={teamOptions}
                  placeholder="Search team..."
                  searchable
                  {...form.getInputProps('homeTeamId')}
                />
                <Select
                  label="Away team"
                  data={teamOptions}
                  placeholder="Search team..."
                  searchable
                  {...form.getInputProps('awayTeamId')}
                />
              </Group>
              <TextInput
                label="Scheduled date & time (local)"
                type="datetime-local"
                {...form.getInputProps('scheduledAt')}
              />
              <Button type="submit" loading={createMatch.isPending} w="fit-content">
                Create match
              </Button>
            </Stack>
          </form>
        </Paper>

        {selectedStageId && recentMatches.length > 0 && (
          <Stack gap="xs">
            <Title order={4}>Matches in selected stage</Title>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Home</Table.Th>
                  <Table.Th ta="center">Score</Table.Th>
                  <Table.Th>Away</Table.Th>
                  <Table.Th ta="right">Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentMatches.map(m => (
                  <Table.Tr key={m.id}>
                    <Table.Td>{m.homeTeam.name}</Table.Td>
                    <Table.Td ta="center" w={100}>
                      {m.score ? (
                        <Text size="sm" fw={600}>{m.score.homeGoals} – {m.score.awayGoals}</Text>
                      ) : (
                        <Text size="sm" c="dimmed">TBD</Text>
                      )}
                    </Table.Td>
                    <Table.Td>{m.awayTeam.name}</Table.Td>
                    <Table.Td ta="right">
                      <Text size="xs" c="dimmed">{formatDate(m.scheduledAt)}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

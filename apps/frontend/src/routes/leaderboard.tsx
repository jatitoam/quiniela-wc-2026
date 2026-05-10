import { createFileRoute, Link } from '@tanstack/react-router';
import { Anchor, Badge, Button, Container, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { useLeaderboard, useLeaderboardAll } from '../api/leaderboard';
import { useAuth } from '../context/auth';

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useLeaderboard();
  const allQuery = useLeaderboardAll();
  const [showAll, setShowAll] = useState(false);

  const handleShowAll = () => {
    setShowAll(true);
    allQuery.refetch();
  };

  const rows = showAll ? (allQuery.data?.participants ?? []) : (data?.top10 ?? []);
  const total = data?.total ?? 0;

  return (
    <Container size="sm">
      <Stack gap="md">
        <Title order={2}>Leaderboard</Title>

        {isLoading ? (
          <Stack gap="xs">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} h={40} />)}
          </Stack>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={60}>#</Table.Th>
                <Table.Th>Participant</Table.Th>
                <Table.Th ta="right">Points</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>
                    <Badge variant="light" color={p.rank === 1 ? 'yellow' : p.rank === 2 ? 'gray' : p.rank === 3 ? 'orange' : 'blue'}>
                      {p.rank}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Link to="/participants/$alias" params={{ alias: p.alias }}>
                      {p.alias}
                    </Link>
                  </Table.Td>
                  <Table.Td ta="right" fw={600}>{p.totalPoints}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {!showAll && !isLoading && total > 10 && (
          <Button variant="subtle" onClick={handleShowAll} loading={allQuery.isFetching}>
            Show all {total} participants
          </Button>
        )}

        {!user && (
          <Text c="dimmed" size="sm" ta="center">
            <Anchor component={Link} to="/login">Log in</Anchor> to see participant details and submit predictions.
          </Text>
        )}
      </Stack>
    </Container>
  );
}

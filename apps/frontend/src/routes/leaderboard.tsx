import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Anchor, Button, Card, Container,
  SimpleGrid, Skeleton, Stack, Table, Text,
} from '@mantine/core';
import { useState } from 'react';
import { useLeaderboard, useLeaderboardAll } from '../api/leaderboard';
import { useAuth } from '../context/auth';
import { RankBadge } from '../components/RankBadge';
import { PageHero } from '../components/PageHero';

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
});

const MEDAL = ['🥇', '🥈', '🥉'];

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
  const top3 = data?.top10?.slice(0, 3) ?? [];

  return (
    <Container size="sm" px={0}>
      <Stack gap="md">
        <PageHero
          emoji="🏆"
          title="Leaderboard"
          subtitle="Top picks for WC 2026"
        />

        {isLoading ? (
          <Stack gap="xs">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} h={40} />)}
          </Stack>
        ) : (
          <>
            {/* Mobile podium — top 3 */}
            {top3.length >= 1 && (
              <SimpleGrid cols={3} hiddenFrom="sm" spacing="xs">
                {top3.map((p, i) => (
                  <Card key={p.id} p="sm" ta="center">
                    <Stack gap={4} align="center">
                      <Text fz={28} lh={1}>{MEDAL[i]}</Text>
                      <Text fw={700} fz="xs" truncate style={{ maxWidth: '100%' }}>
                        <Link to="/participants/$alias" params={{ alias: p.alias }}
                          style={{ textDecoration: 'none', color: 'inherit' }}>
                          {p.alias}
                        </Link>
                      </Text>
                      <Text fz="xs" c="dimmed">{p.totalPoints} pts</Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}

            <Table.ScrollContainer minWidth={320}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={56}>#</Table.Th>
                    <Table.Th>Participant</Table.Th>
                    <Table.Th ta="right">Points</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((p) => (
                    <Table.Tr key={p.id}>
                      <Table.Td>
                        <RankBadge rank={p.rank} />
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
            </Table.ScrollContainer>
          </>
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

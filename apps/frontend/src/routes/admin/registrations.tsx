import { createFileRoute } from '@tanstack/react-router';
import { Badge, Button, Container, Group, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../context/auth';
import { useConfirmRegistration, usePendingRegistrations } from '../../api/admin';

export const Route = createFileRoute('/admin/registrations')({
  component: AdminRegistrationsPage,
});

function AdminRegistrationsPage() {
  const { user } = useAuth();
  const { data: pending, isLoading } = usePendingRegistrations();
  const confirm = useConfirmRegistration();

  if (!user?.roles.includes('ADMIN')) {
    return (
      <Container size="sm">
        <Text c="dimmed">Access denied.</Text>
      </Container>
    );
  }

  const handleConfirm = async (userId: string) => {
    try {
      await confirm.mutateAsync(userId);
      notifications.show({ color: 'green', message: 'Registration confirmed.' });
    } catch {
      notifications.show({ color: 'red', message: 'Failed to confirm registration.' });
    }
  };

  return (
    <Container size="md">
      <Stack gap="lg">
        <Title order={2}>Pending Registrations</Title>

        {isLoading ? (
          <Stack gap="sm">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={50} />)}
          </Stack>
        ) : pending && pending.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Alias</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pending.map(({ user: u }) => (
                <Table.Tr key={u.id}>
                  <Table.Td>{u.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light">{u.alias}</Badge>
                  </Table.Td>
                  <Table.Td>{u.email}</Table.Td>
                  <Table.Td ta="right">
                    <Button
                      size="xs"
                      color="green"
                      loading={confirm.isPending && confirm.variables === u.id}
                      onClick={() => handleConfirm(u.id)}
                    >
                      Confirm
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Group>
            <Text c="dimmed">No pending registrations.</Text>
          </Group>
        )}
      </Stack>
    </Container>
  );
}

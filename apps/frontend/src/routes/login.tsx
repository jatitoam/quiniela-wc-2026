import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Anchor, Button, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useLogin } from '../api/auth';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length < 1 ? 'Required' : null),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      navigate({ to: '/leaderboard' });
    } catch {
      notifications.show({ color: 'red', title: 'Login failed', message: 'Invalid email or password.' });
    }
  });

  return (
    <Container size={420} py="xl">
      <Title ta="center" mb="md">Welcome back</Title>
      <Paper withBorder shadow="md" p="xl" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Email" type="email" {...form.getInputProps('email')} />
            <PasswordInput label="Password" {...form.getInputProps('password')} />
            <Button type="submit" loading={login.isPending} fullWidth mt="sm">
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>
      <Text ta="center" mt="md" size="sm">
        No account?{' '}
        <Anchor component={Link} to="/register">Register here</Anchor>
      </Text>
    </Container>
  );
}

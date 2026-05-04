import { createFileRoute, Link } from '@tanstack/react-router';
import { Alert, Anchor, Button, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useRegister } from '../api/auth';
import { ApiError } from '../api/client';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const register = useRegister();
  const [success, setSuccess] = useState(false);
  const form = useForm({
    initialValues: { email: '', password: '', name: '', alias: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length < 8 ? 'At least 8 characters' : null),
      name: (v) => (v.trim().length < 2 ? 'Required' : null),
      alias: (v) => (/^\w{2,}$/.test(v.trim()) ? null : 'At least 2 chars, letters/numbers/underscores only'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await register.mutateAsync(values);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '';
      if (msg.toLowerCase().includes('email')) form.setFieldError('email', 'Email already registered');
      else if (msg.toLowerCase().includes('alias')) form.setFieldError('alias', 'Alias already taken');
      else form.setErrors({ alias: 'Registration failed. Please try again.' });
    }
  });

  if (success) {
    return (
      <Container size={420} py="xl">
        <Alert color="green" title="Registration submitted!">
          An admin will review and confirm your account. You can log in once confirmed.
        </Alert>
        <Text ta="center" mt="md" size="sm">
          <Anchor component={Link} to="/login">Back to login</Anchor>
        </Text>
      </Container>
    );
  }

  return (
    <Container size={420} py="xl">
      <Title ta="center" mb="md">Create account</Title>
      <Paper withBorder shadow="md" p="xl" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Full name" placeholder="Jane Smith" {...form.getInputProps('name')} />
            <TextInput
              label="Alias"
              placeholder="jsmith"
              description="This is your public name on the leaderboard"
              {...form.getInputProps('alias')}
            />
            <TextInput label="Email" type="email" {...form.getInputProps('email')} />
            <PasswordInput label="Password" {...form.getInputProps('password')} />
            <Button type="submit" loading={register.isPending} fullWidth mt="sm">
              Register
            </Button>
          </Stack>
        </form>
      </Paper>
      <Text ta="center" mt="md" size="sm">
        Already have an account?{' '}
        <Anchor component={Link} to="/login">Log in</Anchor>
      </Text>
    </Container>
  );
}

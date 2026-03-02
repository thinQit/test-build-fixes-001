'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  token: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<RegisterResponse>('/api/auth/register', {
      name,
      email,
      password
    });

    if (apiError || !data) {
      setError(apiError || 'Registration failed');
      setLoading(false);
      return;
    }

    localStorage.setItem('token', data.token);
    login({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    toast('Account created!', 'success');
    router.push('/tasks');
  };

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-secondary">Start managing tasks in minutes.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Name"
              type="text"
              name="name"
              value={name}
              onChange={event => setName(event.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link className="font-medium text-primary" href="/login">
          Login
        </Link>
      </p>
    </section>
  );
}

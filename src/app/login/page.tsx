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

interface LoginResponse {
  token: string;
  expiresIn: number;
  user: { id: string; name: string; email: string; role: 'customer' | 'admin' };
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password
    });

    if (apiError || !data) {
      setError(apiError || 'Login failed');
      setLoading(false);
      return;
    }

    localStorage.setItem('token', data.token);
    login({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    toast('Welcome back!', 'success');
    router.push('/tasks');
  };

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-sm text-secondary">Access your task dashboard.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-secondary">
        Don&apos;t have an account?{' '}
        <Link className="font-medium text-primary" href="/register">
          Register
        </Link>
      </p>
    </section>
  );
}

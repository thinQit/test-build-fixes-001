'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function NewTaskPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          dueDate: dueDate || undefined,
          priority
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || 'Failed to create task');
      }

      toast('Task created!', 'success');
      router.push('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">Create task</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary">Please log in to create a task.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Create a new task</h1>
          <p className="text-sm text-secondary">Fill out the details below.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              type="text"
              name="title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                value={description}
                onChange={event => setDescription(event.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Due date"
                type="date"
                name="dueDate"
                value={dueDate}
                onChange={event => setDueDate(event.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground" htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={priority}
                  onChange={event => setPriority(event.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>Create task</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

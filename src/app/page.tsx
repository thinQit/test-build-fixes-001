'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/providers/AuthProvider';

interface TaskSummary {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTasks = async () => {
      setFetching(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/api/tasks?page=1&limit=5`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || err.message || 'Failed to load tasks');
        }
        const data: { items: TaskSummary[] } = await res.json();
        setTasks(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setFetching(false);
      }
    };
    fetchTasks();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <p className="text-secondary">
          Organize your tasks, track progress, and manage your workflow with a simple, secure task app.
        </p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-secondary">Here is a quick snapshot of your tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick actions</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/tasks">
                <Button>View tasks</Button>
              </Link>
              <Link href="/tasks/new">
                <Button variant="outline">Create task</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent tasks</h2>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex items-center gap-2 text-sm text-secondary">
                <Spinner className="h-4 w-4" /> Loading tasks...
              </div>
            ) : error ? (
              <p className="text-sm text-error">{error}</p>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-secondary">No tasks yet. Create your first task.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-secondary">
                        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.status === 'done'
                          ? 'success'
                          : task.status === 'in_progress'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

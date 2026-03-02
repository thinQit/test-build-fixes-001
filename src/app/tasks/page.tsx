'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string | null;
  createdAt?: string;
}

interface TaskListResponse {
  items: Task[];
  page: number;
  limit: number;
  total: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function TasksPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit) || 1;

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'dueDate',
        sortOrder
      });
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`${BASE_URL}/api/tasks?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || 'Failed to load tasks');
      }
      const data: TaskListResponse = await res.json();
      setTasks(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTasks();
  }, [isAuthenticated, statusFilter, sortOrder, page]);

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
            <h1 className="text-xl font-semibold">Tasks</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary">Please log in to view your tasks.</p>
            <div className="mt-4">
              <Link href="/login">
                <Button>Go to login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your tasks</h1>
          <p className="text-sm text-secondary">Manage and prioritize your work.</p>
        </div>
        <Link href="/tasks/new">
          <Button>Create task</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-secondary" htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                className="rounded-md border border-border px-3 py-2 text-sm"
                value={statusFilter}
                onChange={event => {
                  setPage(1);
                  setStatusFilter(event.target.value);
                }}
              >
                <option value="">All</option>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-secondary" htmlFor="sort-order">Sort by due date</label>
              <select
                id="sort-order"
                className="rounded-md border border-border px-3 py-2 text-sm"
                value={sortOrder}
                onChange={event => {
                  setPage(1);
                  setSortOrder(event.target.value as 'asc' | 'desc');
                }}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Spinner className="h-4 w-4" /> Loading tasks...
            </div>
          ) : error ? (
            <p className="text-sm text-error">{error}</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-secondary">No tasks found. Try adjusting filters or create a new task.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                  <div className="rounded-lg border border-border p-4 transition hover:border-primary">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-secondary">
                          Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <Badge variant="default">{task.priority}</Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <p className="text-sm text-secondary">
              Page {page} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

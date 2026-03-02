'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/tasks/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || 'Failed to load task');
      }
      const data: Task = await res.json();
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTask();
  }, [isAuthenticated]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description || undefined,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate || undefined
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || 'Failed to update task');
      }
      const data: Task = await res.json();
      setTask(data);
      toast('Task updated', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || 'Failed to delete task');
      }
      toast('Task deleted', 'success');
      router.push('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setSaving(false);
      setShowDelete(false);
    }
  };

  if (authLoading || loading) {
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
            <h1 className="text-xl font-semibold">Task details</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary">Please log in to view this task.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error && !task) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">Task details</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!task) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardContent>
            <p className="text-sm text-secondary">Task not found.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Edit task</h1>
          <p className="text-sm text-secondary">Update the details below.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            <Input
              label="Title"
              type="text"
              name="title"
              value={task.title}
              onChange={event => setTask({ ...task, title: event.target.value })}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                value={task.description || ''}
                onChange={event => setTask({ ...task, description: event.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Due date"
                type="date"
                name="dueDate"
                value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                onChange={event => setTask({ ...task, dueDate: event.target.value || null })}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground" htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={task.priority}
                  onChange={event => setTask({ ...task, priority: event.target.value as Task['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground" htmlFor="status">Status</label>
                <select
                  id="status"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={task.status}
                  onChange={event => setTask({ ...task, status: event.target.value as Task['status'] })}
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="space-y-1 text-sm text-secondary">
                <p>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</p>
                <p>Updated: {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>
                Delete task
              </Button>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Modal isOpen={showDelete} title="Delete task" onClose={() => setShowDelete(false)}>
        <p className="text-sm text-secondary">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" loading={saving} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </section>
  );
}

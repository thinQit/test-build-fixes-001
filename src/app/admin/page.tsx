'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';

interface StatsResponse {
  totalUsers: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AdminDashboardPage() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/api/admin/stats`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || err.message || 'Failed to load stats');
        }
        const data: StatsResponse = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAuthenticated, isAdmin]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">Admin dashboard</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary">You do not have access to this page.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="text-sm text-secondary">Monitor system metrics and manage users.</p>
        </div>
        <Link href="/admin/users">
          <Button>Manage users</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">System stats</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Spinner className="h-4 w-4" /> Loading stats...
            </div>
          ) : error ? (
            <p className="text-sm text-error">{error}</p>
          ) : !stats ? (
            <p className="text-sm text-secondary">No stats available.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-secondary">Total users</p>
                <p className="text-2xl font-semibold">{stats.totalUsers}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-secondary">Total tasks</p>
                <p className="text-2xl font-semibold">{stats.totalTasks}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-secondary">Tasks by status</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>To do: {stats.tasksByStatus.todo || 0}</p>
                  <p>In progress: {stats.tasksByStatus.in_progress || 0}</p>
                  <p>Done: {stats.tasksByStatus.done || 0}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

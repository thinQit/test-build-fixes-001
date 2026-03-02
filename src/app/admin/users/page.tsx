'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface UsersResponse {
  items: UserSummary[];
  page: number;
  limit: number;
  total: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit) || 1;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      const res = await fetch(`${BASE_URL}/api/admin/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || 'Failed to load users');
      }
      const data: UsersResponse = await res.json();
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    fetchUsers();
  }, [isAuthenticated, isAdmin, page]);

  const updateRole = async (userId: string, role: 'customer' | 'admin') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ role })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || 'Failed to update role');
      }
      const updated: UserSummary = await res.json();
      setUsers(prev => prev.map(user => (user.id === updated.id ? updated : user)));
      toast('Role updated', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update role', 'error');
    }
  };

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
            <h1 className="text-xl font-semibold">User management</h1>
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
      <div>
        <h1 className="text-2xl font-semibold">User management</h1>
        <p className="text-sm text-secondary">Review users and update their roles.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Users</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Spinner className="h-4 w-4" /> Loading users...
            </div>
          ) : error ? (
            <p className="text-sm text-error">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-secondary">No users found.</p>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-secondary">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      className="rounded-md border border-border px-3 py-2 text-sm"
                      value={user.role}
                      onChange={event => updateRole(user.id, event.target.value as 'customer' | 'admin')}
                    >
                      <option value="customer">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
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

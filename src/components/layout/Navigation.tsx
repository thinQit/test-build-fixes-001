'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

export function Navigation() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/tasks', label: 'Tasks' }
  ];

  return (
    <nav className="w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">TaskManager</Link>
        <button
          type="button"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="block h-0.5 w-6 bg-foreground" />
          <span className="mt-1 block h-0.5 w-6 bg-foreground" />
          <span className="mt-1 block h-0.5 w-6 bg-foreground" />
        </button>
        <div className="hidden items-center gap-4 md:flex">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary">
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button size="sm">Login</Button></Link>
              <Link href="/register"><Button size="sm" variant="outline">Sign Up</Button></Link>
            </div>
          )}
        </div>
      </div>
      {open && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 md:hidden">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary">
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          ) : (
            <div className="flex gap-2">
              <Link href="/login"><Button size="sm">Login</Button></Link>
              <Link href="/register"><Button size="sm" variant="outline">Sign Up</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navigation;

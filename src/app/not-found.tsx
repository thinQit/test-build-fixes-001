import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-secondary">The page you are looking for does not exist.</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) router.push(user ? '/dashboard' : '/login');
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#111111] selection:bg-[#32d583] selection:text-black">
      <div className="text-4xl font-bold text-white tracking-tight flex justify-center items-center gap-1 animate-pulse">
        Thesis<span className="text-[#32d583]">OS</span>
      </div>
    </div>
  );
  return null;
}

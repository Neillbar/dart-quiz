"use client";

import QuizPage from '@/components/QuizPage';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Quiz() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <QuizPage userId={user.uid} />;
}
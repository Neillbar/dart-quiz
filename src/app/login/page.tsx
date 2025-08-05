"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import dynamicImport from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Dynamically import LoginPage to avoid SSR issues
const LoginPage = dynamicImport(() => import('@/components/LoginPage'), {
  ssr: false
});

const Login = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // You might want to show an error message to the user here
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <LoginPage onGoogleSignIn={handleGoogleSignIn} />;
};

export default Login;
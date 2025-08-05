'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import LoginPage from '@/components/LoginPage';

const DemoLogin = () => {
  const handleGoogleSignIn = () => {
    alert('Google Sign-In Demo - This would normally authenticate with Google OAuth');
  };

  return (
    <div>
      <LoginPage onGoogleSignIn={handleGoogleSignIn} />
    </div>
  );
};

export default DemoLogin;
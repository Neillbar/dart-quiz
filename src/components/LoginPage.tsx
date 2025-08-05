"use client";

import React, { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface LoginPageProps {
  onGoogleSignIn?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onGoogleSignIn }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Dart Board Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-4 border-red-500/20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full border-2 border-green-500/30 animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-32 w-16 h-16 rounded-full border-2 border-yellow-500/25 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 rounded-full border-3 border-red-600/20 animate-bounce delay-500"></div>
        
        {/* Dart Board Rings */}
        <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-64 h-64 opacity-10">
          <div className="absolute inset-0 rounded-full border-8 border-red-500"></div>
          <div className="absolute inset-4 rounded-full border-4 border-green-600"></div>
          <div className="absolute inset-8 rounded-full border-2 border-yellow-500"></div>
        </div>
        
        <div className="absolute top-1/3 right-1/4 transform w-48 h-48 opacity-5">
          <div className="absolute inset-0 rounded-full border-6 border-green-500"></div>
          <div className="absolute inset-3 rounded-full border-3 border-red-600"></div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-slate-700/50 transition-all duration-300 hover:shadow-3xl">
          
          {/* Dart Icon and App Name */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-green-600 rounded-full mb-4 shadow-lg">
              <svg 
                viewBox="0 0 24 24" 
                className="w-10 h-10 text-white"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1l3 8h-6z"/>
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent mb-2">
              Dart Quiz
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
              Master Your Checkout Game
            </p>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Professional dart finishing training
            </p>
          </div>

          {/* Features Preview */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Interactive checkout scenarios
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              Track your finish percentages
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              Compete with other players
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={onGoogleSignIn}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-6 py-4 flex items-center justify-center space-x-3 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] group"
          >
            {/* Google Icon */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6"
            >
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            
            <span className="text-slate-700 dark:text-slate-200 font-medium text-lg">
              Sign in with Google
            </span>
            
            <ChevronRightIcon 
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                isHovered ? 'translate-x-1' : ''
              }`}
            />
          </button>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your data is secure and never shared with third parties
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-red-500 to-green-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full opacity-30 animate-bounce delay-1000"></div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Ready to improve your checkout game?
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Join thousands of players perfecting their dart finishes
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    if (token) {
      // Login successful
      localStorage.setItem('token', token);
      
      // Fetch user data
      authAPI.getMe()
        .then(response => {
          localStorage.setItem('user', JSON.stringify(response.user));
          window.location.href = '/';
        })
        .catch(err => {
          console.error('Failed to fetch user:', err);
          router.push('/auth/login?error=Failed to fetch user data');
        });
    } else if (error) {
      router.push(`/auth/login?error=${encodeURIComponent(error)}`);
    } else {
      router.push('/auth/login?error=Authentication failed');
    }
  }, [token, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Completing secure login...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}

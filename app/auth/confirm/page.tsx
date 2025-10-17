'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConfirmLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  // Get the code and error from URL params, using the encoded parameter name
  const [authCode] = useState(searchParams?.get('auth_code'));
  const [authError] = useState(searchParams?.get('error'));

  useEffect(() => {
    // If there's no code and no error, redirect to home
    if (!authCode && !authError) {
      router.push('/');
    }
  }, [authCode, authError, router]);

  const handleConfirm = async () => {
    if (!authCode) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Exchange code for session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(authCode);
      
      if (sessionError) {
        throw sessionError;
      }

      if (!data?.session) {
        throw new Error('Failed to establish session');
      }

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.session.user.id,
          name: data.session.user.email?.split('@')[0] || 'Anonymous User'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating/updating profile:', profileError);
      }

      // Get the redirect URL from user metadata or default to /game
      const redirectTo = data.session.user.user_metadata.redirect_url || '/game';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Error during confirmation:', err);
      setError(err.message || 'Failed to confirm login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authCode && !authError) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {authError ? 'Authentication Error' : 'Confirm Login'}
            </CardTitle>
            <CardDescription>
              {authError 
                ? 'There was a problem with the authentication process.'
                : 'Click the button below to complete your login.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}
            {authError ? (
              <p className="text-sm text-red-600 mb-4">
                Error: {decodeURIComponent(authError)}
              </p>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Confirming...' : 'Complete Login'}
              </Button>
            )}
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/')}
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

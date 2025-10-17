'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Fetching profile...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', session);
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      
      if (!session) {
        console.log('No session found, redirecting to home');
        router.push('/');
        return;
      }

      console.log('Fetching profile for user:', session.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      console.log('Retrieved profile:', profile);
      if (profile) {
        setName(profile.name || '');
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with name:', name);
    setIsLoading(true);

    try {
      console.log('Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        console.error('No session found');
        throw new Error('Not authenticated');
      }

      console.log('Updating profile for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', session.user.id)
        .select();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('No rows were updated. This likely means you don\'t have permission.');
        throw new Error('Failed to update profile - no permission');
      }

      console.log('Profile updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Breadcrumbs
          items={[
            {
              label: 'Profile',
            },
          ]}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter your name"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

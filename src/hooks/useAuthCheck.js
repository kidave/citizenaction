import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForum } from '../context/ForumContext';

/**
 * A custom hook to verify user authentication.
 * Redirects to the login page if the user is not authenticated.
 *
 * @param {string} redirectTo - The path to redirect to if not logged in.
 * @returns {{user: object, loading: boolean}} The user object and loading state.
 */
export default function useAuthCheck(redirectTo = '/auth') {
  const { user, loading } = useForum();
  const router = useRouter();

  useEffect(() => {
    // We don't want to redirect while the auth state is still loading.
    if (loading) {
      return;
    }

    // If loading is complete and there's no user, redirect.
    if (!user) {
      // We use router.asPath to get the full path with query parameters.
      router.push(`${redirectTo}?returnTo=${encodeURIComponent(router.asPath)}`);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}
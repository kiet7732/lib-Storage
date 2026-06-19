import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuth } from '../../features/auth/auth-context';
import { getRoleHomePath } from '../../features/auth/auth.utils';

export default function AuthCallbackRoute() {
  const params = useLocalSearchParams<{ code?: string; state?: string; error?: string }>();
  const { completeRedirectSignIn, isHydrating, isReady, session } = useAuth();
  const isCompletingRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const authCode = typeof params.code === 'string' ? params.code : undefined;
  const authState = typeof params.state === 'string' ? params.state : undefined;
  const authError = typeof params.error === 'string' ? params.error : undefined;

  useEffect(() => {
    if (isHydrating || !isReady || hasRedirectedRef.current || isCompletingRef.current) {
      return;
    }

    if (!authCode && !authError) {
      return;
    }

    if (authError) {
      hasRedirectedRef.current = true;
      router.replace('/login');
      return;
    }

    isCompletingRef.current = true;

    completeRedirectSignIn({
      code: authCode,
      state: authState,
    })
      .then((result) => {
        hasRedirectedRef.current = true;
        router.replace(result.redirectTo);
      })
      .catch((nextError) => {
        console.warn('Keycloak callback failed.', nextError);
        hasRedirectedRef.current = true;
        router.replace('/login');
      });
  }, [authCode, authError, authState, completeRedirectSignIn, isHydrating, isReady]);

  useEffect(() => {
    if (!session || hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;
    router.replace(getRoleHomePath(session.role));
  }, [session]);

  return null;
}

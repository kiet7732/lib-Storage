import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

import { readPendingWebAuthFlow, useAuth } from '../../features/auth/auth-context';
import { getRoleHomePath } from '../../features/auth/auth.utils';

function notifyAuthError(message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(message);
    return;
  }

  Alert.alert('Xac thuc that bai', message);
}

function replaceRoute(href: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.replace(href);
    return;
  }

  router.replace(href as never);
}

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

    const pendingFlow = readPendingWebAuthFlow();
    const fallbackRoute = pendingFlow === 'register' ? '/register?authError=1' : '/login?authError=1';
    const defaultErrorMessage =
      pendingFlow === 'register'
        ? 'Dang ky chua hoan tat. Vui long kiem tra lai thong tin va thu lai.'
        : 'Dang nhap chua hoan tat. Vui long thu lai.';

    if (authError) {
      notifyAuthError(defaultErrorMessage);
      hasRedirectedRef.current = true;
      replaceRoute(fallbackRoute);
      return;
    }

    isCompletingRef.current = true;

    completeRedirectSignIn({
      code: authCode,
      state: authState,
    })
      .then((result) => {
        hasRedirectedRef.current = true;
        replaceRoute(result.redirectTo);
      })
      .catch((nextError) => {
        console.warn('Keycloak callback failed.', nextError);
        notifyAuthError(nextError instanceof Error ? nextError.message : defaultErrorMessage);
        hasRedirectedRef.current = true;
        replaceRoute(fallbackRoute);
      });
  }, [authCode, authError, authState, completeRedirectSignIn, isHydrating, isReady]);

  useEffect(() => {
    if (!session || hasRedirectedRef.current || authCode || authError || isCompletingRef.current) {
      return;
    }

    hasRedirectedRef.current = true;
    replaceRoute(getRoleHomePath(session.role));
  }, [authCode, authError, session]);

  return null;
}

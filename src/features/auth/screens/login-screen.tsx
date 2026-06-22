import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuth } from '../auth-context';

export function LoginScreen() {
  const { clearRegistrationNotice, isBusy, isReady, signIn } = useAuth();
  const params = useLocalSearchParams<{ registered?: string; authError?: string }>();
  const hasStartedRef = useRef(false);
  const shouldForcePrompt = params.registered === '1';

  useEffect(() => {
    clearRegistrationNotice();
  }, [clearRegistrationNotice]);

  useEffect(() => {
    if (!isReady || isBusy || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    void signIn({ forcePrompt: shouldForcePrompt });
  }, [isBusy, isReady, shouldForcePrompt, signIn]);

  return null;
}

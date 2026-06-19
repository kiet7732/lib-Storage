import { useEffect, useRef } from 'react';

import { useAuth } from '../auth-context';

export function LoginScreen() {
  const { clearRegistrationNotice, isBusy, isReady, signIn } = useAuth();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    clearRegistrationNotice();
  }, [clearRegistrationNotice]);

  useEffect(() => {
    if (!isReady || isBusy || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    void signIn();
  }, [isBusy, isReady, signIn]);

  return null;
}

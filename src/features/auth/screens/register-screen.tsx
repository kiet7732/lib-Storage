import { useEffect, useRef } from 'react';

import { useAuth } from '../auth-context';

export function RegisterScreen() {
  const { didCompleteRegistration, isBusy, isReady, signUp } = useAuth();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (didCompleteRegistration || !isReady || isBusy || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    void signUp();
  }, [didCompleteRegistration, isBusy, isReady, signUp]);

  return null;
}

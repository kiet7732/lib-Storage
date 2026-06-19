import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { getRoleHomePath } from '@/features/auth/auth.utils';

export default function AuthLayout() {
  const { isHydrating, session } = useAuth();

  if (isHydrating) {
    return null;
  }

  if (session) {
    return <Redirect href={getRoleHomePath(session.role)} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { getRoleHomePath } from '@/features/auth/auth.utils';
import { theme } from '@/theme/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LibrarianLayout() {
  const { isHydrating, session } = useAuth();

  if (isHydrating) {
    return null;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (session.role !== 'librarian') {
    return <Redirect href={getRoleHomePath(session.role)} />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

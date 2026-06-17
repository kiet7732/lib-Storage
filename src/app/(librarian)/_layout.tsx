import { Stack } from 'expo-router';

import { theme } from '@/theme/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LibrarianLayout() {
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

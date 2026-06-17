import { Stack } from 'expo-router';

import { theme } from '@/theme/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function StudentLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontFamily: theme.fonts.serifBold,
          color: theme.colors.primary,
          fontSize: 18,
        },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="books/[id]"
        options={{
          title: 'Chi tiết sách',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Lịch sử mượn trả',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
        }}
      />
      <Stack.Screen
        name="search/camera"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="borrow/request"
        options={{
          title: 'Yêu cầu mượn',
          headerShown: false,
          presentation: 'transparentModal',
          animation: 'none',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  );
}

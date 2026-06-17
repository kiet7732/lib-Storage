import { Stack, router } from 'expo-router';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

export default function NotFoundScreen() {
  const layout = useResponsiveLayout();

  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy trang' }} />
      <AppScrollScreen contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View
          style={{
            alignSelf: 'center',
            width: '100%',
            maxWidth: layout.isLarge ? 480 : undefined,
            gap: theme.spacing.lg,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            padding: layout.surfacePadding,
            boxShadow: theme.shadow.card,
          }}
        >
          <AppText variant="display">404</AppText>
          <AppText tone="muted">
            Màn hình bạn tìm không tồn tại trong prototype này.
          </AppText>
          <AppButton label="Quay về trang chủ" onPress={() => router.replace('/home')} />
        </View>
      </AppScrollScreen>
    </>
  );
}

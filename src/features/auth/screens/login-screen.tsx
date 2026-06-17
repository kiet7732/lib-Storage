import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { successHaptic } from '@/utils/haptics';

export function LoginScreen() {
  const layout = useResponsiveLayout();

  return (
    <AppScrollScreen
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
      }}
    >
      <Animated.View
        entering={FadeInDown.springify().damping(18)}
        style={{
          width: '100%',
          alignSelf: 'center',
          maxWidth: layout.isLarge ? 520 : undefined,
          gap: layout.sectionGap,
        }}
      >
        <View style={{ alignItems: 'center', gap: layout.isCompact ? theme.spacing.md : theme.spacing.lg }}>
          <View
            style={{
              width: layout.heroIconSize,
              height: layout.heroIconSize,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon
              name="books"
              color={theme.colors.primary}
              size={layout.isCompact ? 30 : 36}
            />
          </View>

          <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
            <AppText variant="display" tone="primary" style={{ textAlign: 'center' }}>
              Thư viện số
            </AppText>
            <AppText
              tone="muted"
              style={{
                textAlign: 'center',
                maxWidth: Math.min(layout.contentWidth, 320),
              }}
            >
              Đăng nhập bằng tài khoản trường để mượn sách, theo dõi hạn trả và tìm
              sách từ ảnh bìa.
            </AppText>
          </View>
        </View>

        <View
          style={{
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            padding: layout.surfacePadding,
            gap: theme.spacing.lg,
            boxShadow: theme.shadow.card,
          }}
        >
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="label" tone="muted">
              TÀI KHOẢN / EMAIL
            </AppText>
            <View
              style={{
                minHeight: layout.denseActionHeight,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.md,
                borderRadius: theme.radius.md,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: layout.inputVerticalPadding,
              }}
            >
              <AppIcon name="user" color={theme.colors.outline} />
              <AppText tone="muted">sv123456@tdmu.edu.vn</AppText>
            </View>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="label" tone="muted">
              MẬT KHẨU
            </AppText>
            <View
              style={{
                minHeight: layout.denseActionHeight,
                flexDirection: layout.isCompact ? 'column' : 'row',
                alignItems: layout.isCompact ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: layout.isCompact ? theme.spacing.sm : theme.spacing.md,
                borderRadius: theme.radius.md,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: layout.inputVerticalPadding,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <AppIcon name="bookmark" color={theme.colors.outline} />
                <AppText tone="muted">••••••••••</AppText>
              </View>
              <AppText variant="caption" tone="primary">
                Quên mật khẩu?
              </AppText>
            </View>
          </View>

          <AppButton
            label="Đăng nhập"
            iconName="arrow-right"
            onPress={async () => {
              await successHaptic();
              router.replace('/home');
            }}
          />

          <AppButton
            label="Bỏ qua đăng nhập - Librarian"
            iconName="dashboard"
            variant="secondary"
            onPress={async () => {
              await successHaptic();
              router.replace('/dashboard');
            }}
          />

          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="caption" tone="muted">
              Tích hợp sẵn cho đồ án:
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {['Keycloak SSO', 'Thông báo hạn trả', 'Camera Search', 'Lịch sử mượn trả'].map(
                (item) => (
                  <View
                    key={item}
                    style={{
                      borderRadius: theme.radius.pill,
                      backgroundColor: theme.colors.surfaceTint,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <AppText variant="label" tone="primary">
                      {item}
                    </AppText>
                  </View>
                ),
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </AppScrollScreen>
  );
}

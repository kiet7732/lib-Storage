import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { librarianProfile } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { successHaptic } from '@/utils/haptics';

import { getLibrarianTabBarClearance } from './librarian-layout.constants';

type LibrarianScreenShellProps = {
  title?: string;
  subtitle?: string;
  aside?: ReactNode;
  children: ReactNode;
};

export function LibrarianScreenShell({
  title,
  subtitle,
  aside,
  children,
}: LibrarianScreenShellProps) {
  const layout = useResponsiveLayout();
  const stackIntro = layout.width < 460;
  const bottomClearance = Math.max(
    layout.bottomScrollPadding,
    getLibrarianTabBarClearance(layout.insets.bottom),
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: Math.max(layout.insets.top, 12),
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
          backgroundColor: 'rgba(251,249,244,0.92)',
        }}
      >
        <View
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'center',
          }}
        >
          <AppText
            variant="headline"
            tone="primary"
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {librarianProfile.branchName}
          </AppText>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
          }}
        >
          <IconButton
            label="Đăng xuất librarian"
            variant="soft"
            onPress={async () => {
              await successHaptic();
              router.replace('/login');
            }}
          >
            <AppIcon name="logout" color={theme.colors.danger} />
          </IconButton>
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 94 + Math.max(layout.insets.top, 0),
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: bottomClearance,
          gap: theme.spacing.xl,
          width: '100%',
          maxWidth: layout.isLarge ? 760 : undefined,
          alignSelf: 'center',
        }}
      >
        {(title || subtitle || aside) ? (
          <View
            style={{
              flexDirection: stackIntro ? 'column' : 'row',
              alignItems: stackIntro ? 'flex-start' : 'flex-end',
              justifyContent: 'space-between',
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: 6 }}>
              {title ? (
                <AppText variant="display" tone="primary">
                  {title}
                </AppText>
              ) : null}
              {subtitle ? <AppText tone="muted">{subtitle}</AppText> : null}
            </View>
            {aside}
          </View>
        ) : null}

        {children}
      </ScrollView>
    </View>
  );
}

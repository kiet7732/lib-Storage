import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { theme } from '@/theme/theme';

type BannerTone = 'success' | 'warning' | 'danger' | 'info';

type LibrarianFeedbackBannerProps = {
  title: string;
  description?: string;
  tone?: BannerTone;
  onClose?: () => void;
};

export function LibrarianFeedbackBanner({
  title,
  description,
  tone = 'success',
  onClose,
}: LibrarianFeedbackBannerProps) {
  const palette = {
    success: {
      icon: 'check-circle' as const,
      background: '#e8f7ef',
      border: '#cce9d8',
      foreground: theme.colors.primary,
    },
    warning: {
      icon: 'warning' as const,
      background: '#fff0de',
      border: '#f6d2aa',
      foreground: '#8b4b08',
    },
    danger: {
      icon: 'warning' as const,
      background: '#ffe8e5',
      border: '#f1c0b8',
      foreground: theme.colors.danger,
    },
    info: {
      icon: 'info' as const,
      background: theme.colors.infoSoft,
      border: '#d6e1dd',
      foreground: theme.colors.primary,
    },
  }[tone];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.background,
        padding: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.white,
        }}
      >
        <AppIcon name={palette.icon} size={18} color={palette.foreground} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong" style={{ color: palette.foreground }}>
          {title}
        </AppText>
        {description ? <AppText tone="muted">{description}</AppText> : null}
      </View>

      {onClose ? (
        <Pressable onPress={onClose}>
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.68 : 1 }}>
              <AppIcon name="close" size={18} color={palette.foreground} />
            </View>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

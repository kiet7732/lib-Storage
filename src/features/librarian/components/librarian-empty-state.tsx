import { View } from 'react-native';

import { AppIcon, type IconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { theme } from '@/theme/theme';

type LibrarianEmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
};

export function LibrarianEmptyState({
  icon,
  title,
  description,
}: LibrarianEmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        gap: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xl,
        boxShadow: theme.shadow.card,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surfaceTint,
        }}
      >
        <AppIcon name={icon} color={theme.colors.primary} size={24} />
      </View>
      <View style={{ gap: 4 }}>
        <AppText variant="headline" style={{ textAlign: 'center' }}>
          {title}
        </AppText>
        <AppText tone="muted" style={{ textAlign: 'center' }}>
          {description}
        </AppText>
      </View>
    </View>
  );
}

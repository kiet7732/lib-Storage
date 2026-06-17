import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';

import { useResponsiveLayout } from '@/theme/responsive';
import { selectionHaptic } from '@/utils/haptics';

import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { theme } from '@/theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  iconName?: Parameters<typeof AppIcon>[0]['name'];
  variant?: ButtonVariant;
};

export function AppButton({
  label,
  onPress,
  iconName,
  variant = 'primary',
}: AppButtonProps) {
  const layout = useResponsiveLayout();

  const handlePress = async () => {
    await selectionHaptic();
    onPress?.();
  };

  if (variant === 'primary') {
    return (
      <Pressable onPress={handlePress}>
        {({ pressed }) => (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryStrong]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              minHeight: layout.denseActionHeight,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: layout.isCompact ? theme.spacing.xs : theme.spacing.sm,
              borderRadius: theme.radius.md,
              borderCurve: 'continuous',
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: layout.isCompact ? 16 : 18,
              opacity: pressed ? 0.94 : 1,
              boxShadow: theme.shadow.floating,
            }}
          >
            {iconName ? <AppIcon name={iconName} color={theme.colors.white} size={20} /> : null}
            <AppText variant="bodyStrong" tone="white" style={{ fontFamily: theme.fonts.sansBold }}>
              {label}
            </AppText>
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <View
          style={{
            minHeight: layout.denseActionHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: layout.isCompact ? theme.spacing.xs : theme.spacing.sm,
            borderRadius: theme.radius.md,
            borderCurve: 'continuous',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: layout.isCompact ? 14 : 16,
            backgroundColor: variant === 'secondary' ? theme.colors.surface : 'transparent',
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.75 : 1,
          }}
        >
          {iconName ? <AppIcon name={iconName} color={theme.colors.primary} size={20} /> : null}
          <AppText variant="bodyStrong" tone="primary">
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

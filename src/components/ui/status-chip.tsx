import { View } from 'react-native';

import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { theme } from '@/theme/theme';

type ChipTone = 'success' | 'warning' | 'danger' | 'neutral';

type StatusChipProps = {
  label: string;
  tone?: ChipTone;
  solid?: boolean;
  iconName?: Parameters<typeof AppIcon>[0]['name'];
};

export function StatusChip({
  label,
  tone = 'neutral',
  solid = false,
  iconName,
}: StatusChipProps) {
  const colors = {
    success: solid
      ? { background: theme.colors.primary, text: theme.colors.white }
      : { background: '#dff6ea', text: theme.colors.primary },
    warning: solid
      ? { background: theme.colors.accent, text: theme.colors.white }
      : { background: '#fff2df', text: '#925319' },
    danger: solid
      ? { background: theme.colors.danger, text: theme.colors.white }
      : { background: theme.colors.dangerSoft, text: theme.colors.danger },
    neutral: solid
      ? { background: theme.colors.text, text: theme.colors.white }
      : { background: theme.colors.surfaceMuted, text: theme.colors.muted },
  }[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: theme.radius.pill,
        borderCurve: 'continuous',
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      {iconName ? <AppIcon name={iconName} size={14} color={colors.text} /> : null}
      <AppText variant="label" selectable={false} style={{ color: colors.text }}>
        {label}
      </AppText>
    </View>
  );
}

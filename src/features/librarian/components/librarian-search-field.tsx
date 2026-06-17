import type { ComponentProps } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppIcon, type IconName } from '@/components/ui/app-icon';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic } from '@/utils/haptics';

type LibrarianSearchFieldProps = {
  value: string;
  onChangeText: ComponentProps<typeof TextInput>['onChangeText'];
  placeholder: string;
  actionIcon?: IconName;
  onActionPress?: () => void;
};

export function LibrarianSearchField({
  value,
  onChangeText,
  placeholder,
  actionIcon = 'tune',
  onActionPress,
}: LibrarianSearchFieldProps) {
  const layout = useResponsiveLayout();

  return (
    <View
      style={{
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.md,
        boxShadow: theme.shadow.card,
      }}
    >
      <AppIcon name="search" color={theme.colors.outline} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.outline}
        style={{
          flex: 1,
          paddingVertical: 0,
          color: theme.colors.text,
          fontFamily: theme.fonts.sansRegular,
          fontSize: layout.isCompact ? 15 : 16,
        }}
      />
      <Pressable
        onPress={async () => {
          await selectionHaptic();
          onActionPress?.();
        }}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.72 : 1 }}>
            <AppIcon
              name={actionIcon}
              color={value ? theme.colors.primary : theme.colors.outline}
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}

import { ScrollView, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';

import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

type AppScrollScreenProps = ScrollViewProps & {
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function AppScrollScreen({
  children,
  contentContainerStyle,
  style,
  ...props
}: AppScrollScreenProps) {
  const layout = useResponsiveLayout();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}
      contentContainerStyle={[
        {
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: layout.isCompact ? theme.spacing.md : theme.spacing.lg,
          paddingBottom: layout.bottomScrollPadding,
          gap: layout.sectionGap,
        },
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

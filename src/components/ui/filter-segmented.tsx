import { Pressable, ScrollView, View } from 'react-native';

import { useResponsiveLayout } from '@/theme/responsive';
import { selectionHaptic } from '@/utils/haptics';

import { AppText } from './app-text';
import { theme } from '@/theme/theme';

type FilterSegmentedProps = {
  items: string[];
  activeItem: string;
  onChange: (value: string) => void;
};

export function FilterSegmented({
  items,
  activeItem,
  onChange,
}: FilterSegmentedProps) {
  const layout = useResponsiveLayout();
  const compactLabels = items.length >= 4;
  const shouldStretch = compactLabels && layout.contentWidth >= 300;

  const segmentStyle = {
    minWidth: shouldStretch ? 0 : compactLabels ? 92 : layout.isCompact ? 120 : 0,
    flex: shouldStretch ? 1 : undefined,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous' as const,
    paddingHorizontal: compactLabels ? 8 : layout.isCompact ? 14 : 18,
    paddingVertical: layout.isCompact ? 12 : 14,
  };

  const renderOption = (item: string) => {
    const active = item === activeItem;

    return (
      <Pressable
        key={item}
        onPress={async () => {
          await selectionHaptic();
          onChange(item);
        }}
        style={shouldStretch ? { flex: 1 } : undefined}
      >
        {({ pressed }) => (
          <View
            style={{
              ...segmentStyle,
              backgroundColor: active ? theme.colors.surface : 'transparent',
              opacity: pressed ? 0.75 : 1,
            }}
          >
            <AppText
              variant={compactLabels ? 'label' : 'bodyStrong'}
              tone={active ? 'primary' : 'muted'}
              numberOfLines={1}
              style={compactLabels ? { fontSize: 11, lineHeight: 14, letterSpacing: 0.2 } : undefined}
            >
              {item}
            </AppText>
          </View>
        )}
      </Pressable>
    );
  };

  const containerStyle = {
    gap: 6,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous' as const,
    backgroundColor: theme.colors.surfaceMuted,
    padding: 6,
  };

  if (shouldStretch) {
    return (
      <View style={{ ...containerStyle, flexDirection: 'row', width: '100%' }}>
        {items.map(renderOption)}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={containerStyle}
    >
      {items.map(renderOption)}
    </ScrollView>
  );
}

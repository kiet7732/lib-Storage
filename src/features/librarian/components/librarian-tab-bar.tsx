import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type IconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic } from '@/utils/haptics';

import {
  LIBRARIAN_TAB_BAR_INNER_PADDING,
  LIBRARIAN_TAB_BAR_INNER_PADDING_COMPACT,
  LIBRARIAN_TAB_BAR_MAX_WIDTH,
  LIBRARIAN_TAB_BAR_MIN_HEIGHT,
  LIBRARIAN_TAB_BAR_MIN_HEIGHT_COMPACT,
  LIBRARIAN_TAB_BAR_OUTER_HORIZONTAL,
  LIBRARIAN_TAB_BAR_OUTER_HORIZONTAL_COMPACT,
  LIBRARIAN_TAB_BAR_OUTER_TOP,
} from './librarian-layout.constants';

const TAB_META: Record<string, { icon: IconName; label: string }> = {
  dashboard: { icon: 'dashboard', label: 'Bảng tin' },
  requests: { icon: 'task', label: 'Yêu cầu' },
  returns: { icon: 'return', label: 'Trả sách' },
  inventory: { icon: 'inventory', label: 'Kho' },
  reports: { icon: 'report', label: 'Báo cáo' },
};

type LibrarianTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

export function LibrarianTabBar({
  state,
  descriptors,
  navigation,
}: LibrarianTabBarProps) {
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const [innerWidth, setInnerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const previousTrackRef = useRef<{ indicatorWidth: number; tabGap: number } | null>(null);
  const tabCount = state.routes.length;
  const isCompactBar = layout.width < 390;
  const isWideBar = layout.width >= 430;
  const outerHorizontal = isCompactBar
    ? LIBRARIAN_TAB_BAR_OUTER_HORIZONTAL_COMPACT
    : LIBRARIAN_TAB_BAR_OUTER_HORIZONTAL;
  const innerPadding = isCompactBar
    ? LIBRARIAN_TAB_BAR_INNER_PADDING_COMPACT
    : LIBRARIAN_TAB_BAR_INNER_PADDING;
  const tabGap = isCompactBar ? 4 : isWideBar ? 8 : 6;
  const tabMinHeight = isCompactBar
    ? LIBRARIAN_TAB_BAR_MIN_HEIGHT_COMPACT
    : LIBRARIAN_TAB_BAR_MIN_HEIGHT;
  const iconSize = isCompactBar ? 18 : 20;
  const labelFontSize = isCompactBar ? 10 : isWideBar ? 12 : 11;
  const labelLineHeight = isCompactBar ? 12 : isWideBar ? 16 : 14;
  const labelTopSpacing = isCompactBar ? 2 : 3;
  const compactLabels = tabCount >= 5;
  const trackWidth = Math.max(innerWidth - innerPadding * 2, 0);

  const indicatorWidth = useMemo(() => {
    if (!trackWidth || tabCount === 0) {
      return 0;
    }

    return (trackWidth - tabGap * (tabCount - 1)) / tabCount;
  }, [tabCount, tabGap, trackWidth]);

  useEffect(() => {
    if (!indicatorWidth) {
      return;
    }

    const nextValue = state.index * (indicatorWidth + tabGap);
    const previousTrack = previousTrackRef.current;
    const shouldSnap =
      !previousTrack ||
      previousTrack.indicatorWidth !== indicatorWidth ||
      previousTrack.tabGap !== tabGap;

    if (shouldSnap) {
      translateX.setValue(nextValue);
    } else {
      Animated.spring(translateX, {
        toValue: nextValue,
        useNativeDriver: Platform.OS !== 'web',
        damping: 18,
        stiffness: 180,
        mass: 0.85,
      }).start();
    }

    previousTrackRef.current = { indicatorWidth, tabGap };
  }, [indicatorWidth, state.index, tabGap, translateX]);

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: outerHorizontal,
        paddingTop: LIBRARIAN_TAB_BAR_OUTER_TOP,
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      <View
        onLayout={(event) => setInnerWidth(event.nativeEvent.layout.width)}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: LIBRARIAN_TAB_BAR_MAX_WIDTH,
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: tabGap,
          borderRadius: theme.radius.lg,
          borderTopLeftRadius: theme.radius.lg,
          borderTopRightRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.surface,
          padding: innerPadding,
          overflow: 'hidden',
          boxShadow: '0px -4px 20px rgba(26, 26, 26, 0.04)',
        }}
      >
        {indicatorWidth ? (
          <Animated.View
            style={{
              position: 'absolute',
              top: innerPadding,
              bottom: innerPadding,
              left: innerPadding,
              width: indicatorWidth,
              borderRadius: theme.radius.md,
              borderCurve: 'continuous',
              backgroundColor: theme.colors.primary,
              pointerEvents: 'none',
              transform: [{ translateX }],
            }}
          />
        ) : null}

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const meta = TAB_META[route.name] ?? TAB_META.dashboard;

          const onPress = async () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (isFocused || event.defaultPrevented) {
              return;
            }

            await selectionHaptic();
            navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              onPress={onPress}
              onLongPress={() => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              }}
              style={({ pressed }) => ({
                zIndex: 1,
                flex: 1,
                minHeight: tabMinHeight,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radius.md,
                borderCurve: 'continuous',
                paddingHorizontal: isCompactBar ? 2 : 4,
                paddingVertical: isCompactBar ? 5 : 6,
                opacity: pressed ? 0.78 : 1,
              })}
              testID={options.tabBarButtonTestID}
            >
              <AppIcon
                name={meta.icon}
                size={iconSize}
                color={isFocused ? theme.colors.white : theme.colors.text}
              />
              <AppText
                variant="caption"
                numberOfLines={1}
                style={{
                  marginTop: labelTopSpacing,
                  fontFamily: isFocused ? theme.fonts.sansSemiBold : theme.fonts.sansMedium,
                  fontSize: compactLabels ? labelFontSize : labelFontSize + 1,
                  lineHeight: compactLabels ? labelLineHeight : labelLineHeight + 1,
                  color: isFocused ? theme.colors.white : theme.colors.text,
                }}
              >
                {meta.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

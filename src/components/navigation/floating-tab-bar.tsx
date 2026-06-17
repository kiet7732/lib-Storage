import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type IconName } from '@/components/ui/app-icon';
import { TabBarIcon } from '@/components/ui/tab-bar-icon';
import { theme } from '@/theme/theme';
import { selectionHaptic } from '@/utils/haptics';

const TAB_ICONS: Record<string, IconName> = {
  home: 'home',
  books: 'books',
  'my-library': 'library',
  profile: 'user',
};

const HORIZONTAL_INSET = 20;
const BAR_PADDING = 8;
const INDICATOR_WIDTH = 72;
const INDICATOR_HEIGHT = 44;
type FloatingTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: FloatingTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomPadding = 8 + Math.min(insets.bottom, 8);
  const barHeight = 60 + bottomPadding;
  const barWidth = Math.max(width - HORIZONTAL_INSET * 2, 280);
  const contentWidth = barWidth - BAR_PADDING * 2;
  const itemWidth = contentWidth / state.routes.length;
  const indicatorX = useSharedValue(
    BAR_PADDING + state.index * itemWidth + (itemWidth - INDICATOR_WIDTH) / 2,
  );

  useEffect(() => {
    indicatorX.value = withSpring(
      BAR_PADDING + state.index * itemWidth + (itemWidth - INDICATOR_WIDTH) / 2,
      {
        damping: 18,
        stiffness: 220,
        mass: 0.9,
        velocity: 0.2,
      },
    );
  }, [indicatorX, itemWidth, state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: HORIZONTAL_INSET,
          right: HORIZONTAL_INSET,
          bottom: 18,
          height: barHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          paddingHorizontal: BAR_PADDING,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: 'rgba(255,255,255,0.96)',
          boxShadow: theme.shadow.floating,
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 8,
              left: 0,
              width: INDICATOR_WIDTH,
              height: INDICATOR_HEIGHT,
              borderRadius: theme.radius.pill,
              borderCurve: 'continuous',
              backgroundColor: 'rgba(11, 81, 61, 0.12)',
            },
            indicatorStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const iconName = TAB_ICONS[route.name] ?? 'home';

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              onLongPress={onLongPress}
              onPress={onPress}
              style={({ pressed }) => ({
                flex: 1,
                height: INDICATOR_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.78 : 1,
                outlineWidth: 0,
              })}
              testID={options.tabBarButtonTestID}
            >
              <TabBarIcon focused={isFocused} name={iconName} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

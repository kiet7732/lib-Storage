import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppIcon, type IconName } from '@/components/ui/app-icon';
import { theme } from '@/theme/theme';

type TabBarIconProps = {
  name: IconName;
  focused: boolean;
  size?: number;
};

export function TabBarIcon({
  name,
  focused,
  size = 22,
}: TabBarIconProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, progress]);

  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.94, 1.08]),
      },
      {
        translateY: interpolate(progress.value, [0, 1], [1, 0]),
      },
    ],
  }));

  const inactiveIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [1, 0.92]),
      },
      {
        translateY: interpolate(progress.value, [0, 1], [0, 1]),
      },
    ],
  }));

  return (
    <View
      style={{
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
          },
          inactiveIconStyle,
        ]}
      >
        <AppIcon name={name} color={theme.colors.muted} size={size} />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
          },
          activeIconStyle,
        ]}
      >
        <AppIcon name={name} color={theme.colors.primary} size={size} />
      </Animated.View>
    </View>
  );
}

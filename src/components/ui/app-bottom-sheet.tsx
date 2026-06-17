import { type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { clamp, useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

type AppBottomSheetProps = {
  children: ReactNode;
  footer?: ReactNode;
  initialSnapIndex?: number;
  minHeight?: number;
  onClose: () => void;
  snapPoints?: number[];
};

const DEFAULT_SNAP_POINTS = [0.9, 0.74, 0.58];
const OVERDRAG_FACTOR = 0.18;
const CLOSE_VELOCITY = 1800;
const FLING_VELOCITY = 900;
const CLOSE_DISTANCE = 120;
const SPRING_CONFIG = {
  damping: 24,
  stiffness: 260,
  mass: 0.92,
  velocity: 0.2,
};
const CLOSE_TIMING = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
};

export function AppBottomSheet({
  children,
  footer,
  initialSnapIndex = 1,
  minHeight = 420,
  onClose,
  snapPoints = DEFAULT_SNAP_POINTS,
}: AppBottomSheetProps) {
  const layout = useResponsiveLayout();
  const closeGuardRef = useRef(false);

  const maxVisibleHeight = Math.max(layout.height - layout.insets.top - theme.spacing.lg, minHeight);
  const snapTranslations = useMemo(() => {
    const resolvedHeights = [...snapPoints]
      .map((point) => clamp(layout.height * point, minHeight, maxVisibleHeight))
      .sort((left, right) => right - left)
      .filter((height, index, values) => index === 0 || Math.abs(values[index - 1] - height) > 8);

    return resolvedHeights.map((height) => maxVisibleHeight - height);
  }, [layout.height, maxVisibleHeight, minHeight, snapPoints]);

  const boundedInitialSnapIndex = clamp(initialSnapIndex, 0, Math.max(snapTranslations.length - 1, 0));
  const initialTranslation = snapTranslations[boundedInitialSnapIndex] ?? 0;
  const hiddenTranslation = maxVisibleHeight + Math.max(layout.insets.bottom, theme.spacing.lg);

  const translateY = useSharedValue(hiddenTranslation);
  const dragStartY = useSharedValue(initialTranslation);

  const finishClose = useCallback(() => {
    closeGuardRef.current = false;
    onClose();
  }, [onClose]);

  const closeSheet = useCallback(() => {
    if (closeGuardRef.current) {
      return;
    }

    closeGuardRef.current = true;
    translateY.value = withTiming(hiddenTranslation, CLOSE_TIMING, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
  }, [finishClose, hiddenTranslation, translateY]);

  useEffect(() => {
    closeGuardRef.current = false;
    translateY.value = hiddenTranslation;
    translateY.value = withSpring(initialTranslation, SPRING_CONFIG);
  }, [hiddenTranslation, initialTranslation, translateY]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, []);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          dragStartY.value = translateY.value;
        })
        .onUpdate((event) => {
          const lowestSnap = snapTranslations[snapTranslations.length - 1] ?? 0;
          const highestSnap = snapTranslations[0] ?? 0;
          const rawNext = dragStartY.value + event.translationY;

          if (rawNext < highestSnap) {
            translateY.value = highestSnap + (rawNext - highestSnap) * OVERDRAG_FACTOR;
            return;
          }

          if (rawNext > hiddenTranslation) {
            translateY.value = hiddenTranslation + (rawNext - hiddenTranslation) * OVERDRAG_FACTOR;
            return;
          }

          if (rawNext > lowestSnap + CLOSE_DISTANCE) {
            translateY.value = rawNext;
            return;
          }

          translateY.value = rawNext;
        })
        .onEnd((event) => {
          const lowestSnap = snapTranslations[snapTranslations.length - 1] ?? 0;
          const projectedY = translateY.value + event.velocityY * 0.08;

          if (projectedY > lowestSnap + CLOSE_DISTANCE || event.velocityY > CLOSE_VELOCITY) {
            runOnJS(closeSheet)();
            return;
          }

          let nearestIndex = findNearestSnapIndex(projectedY, snapTranslations);

          if (event.velocityY < -FLING_VELOCITY && nearestIndex > 0) {
            nearestIndex -= 1;
          } else if (
            event.velocityY > FLING_VELOCITY &&
            nearestIndex < snapTranslations.length - 1
          ) {
            nearestIndex += 1;
          }

          translateY.value = withSpring(snapTranslations[nearestIndex] ?? initialTranslation, SPRING_CONFIG);
        }),
    [closeSheet, dragStartY, hiddenTranslation, initialTranslation, snapTranslations, translateY],
  );

  const backdropStyle = useAnimatedStyle(() => {
    const lowestSnap = snapTranslations[snapTranslations.length - 1] ?? initialTranslation;
    const opacity = interpolate(
      translateY.value,
      [0, lowestSnap, hiddenTranslation],
      [0.5, 0.34, 0],
      Extrapolation.CLAMP,
    );

    return { opacity };
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme.colors.overlay,
          },
          backdropStyle,
        ]}
      >
        <Pressable
          accessibilityLabel="Đóng cửa sổ yêu cầu"
          onPress={closeSheet}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            bottom: 0,
            left: 0,
            height: maxVisibleHeight,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            overflow: 'hidden',
            boxShadow: '0px -18px 36px rgba(20, 25, 22, 0.16)',
          },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: theme.spacing.sm,
              paddingBottom: theme.spacing.xs,
            }}
          >
            <View
              style={{
                width: 46,
                height: 5,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.border,
              }}
            />
          </View>
        </GestureDetector>

        <View style={{ flex: 1, minHeight: 0 }}>{children}</View>

        {footer ? (
          <View
            style={{
              gap: theme.spacing.sm,
              borderTopWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: layout.horizontalPadding,
              paddingTop: theme.spacing.sm,
              paddingBottom: Math.max(layout.insets.bottom, theme.spacing.sm),
              backgroundColor: theme.colors.surface,
            }}
          >
            {footer}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

function findNearestSnapIndex(value: number, snapTranslations: number[]) {
  'worklet';

  let nearestIndex = 0;
  let nearestDistance = Math.abs(value - (snapTranslations[0] ?? 0));

  for (let index = 1; index < snapTranslations.length; index += 1) {
    const distance = Math.abs(value - snapTranslations[index]);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }

  return nearestIndex;
}

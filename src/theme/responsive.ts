import { useMemo } from 'react';
import { type TextStyle, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme/theme';

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function getResponsiveTypeScale(width: number) {
  if (width < 360) {
    return 0.94;
  }

  if (width >= 430) {
    return 1.06;
  }

  return 1;
}

export function scaleTextStyle(style: TextStyle, scale: number): TextStyle {
  return {
    ...style,
    fontSize: style.fontSize ? round(style.fontSize * scale) : style.fontSize,
    lineHeight: style.lineHeight ? round(style.lineHeight * scale) : style.lineHeight,
    letterSpacing:
      typeof style.letterSpacing === 'number'
        ? round(style.letterSpacing * scale)
        : style.letterSpacing,
  };
}

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const shortestSide = Math.min(width, height);
    const isCompact = shortestSide < 360;
    const isLarge = shortestSide >= 430;

    const horizontalPadding = isCompact ? 16 : isLarge ? 24 : theme.spacing.safe;
    const sectionGap = isCompact ? 20 : isLarge ? 28 : theme.spacing.lg;
    const itemGap = isCompact ? 12 : theme.spacing.md;
    const surfacePadding = isCompact ? theme.spacing.md : theme.spacing.lg;
    const denseActionHeight = isCompact ? 54 : isLarge ? 64 : 60;
    const inputVerticalPadding = isCompact ? 15 : 18;
    const heroIconSize = isCompact ? 72 : isLarge ? 96 : 88;
    const profileAvatarSize = isCompact ? 84 : isLarge ? 104 : 96;
    const statsIconSize = isCompact ? 60 : 72;

    const contentWidth = Math.max(shortestSide - horizontalPadding * 2, 0);
    const gridMinItemWidth = isCompact ? 148 : 164;
    const gridColumns = Math.max(
      1,
      Math.floor((contentWidth + itemGap) / (gridMinItemWidth + itemGap)),
    );
    const gridItemWidth = Math.floor(
      (contentWidth - itemGap * (gridColumns - 1)) / gridColumns,
    );

    const carouselCardWidth = clamp(
      contentWidth * (isCompact ? 0.72 : 0.48),
      150,
      188,
    );
    const smallCarouselCardWidth = clamp(contentWidth * 0.38, 124, 148);

    const detailCoverWidth = clamp(
      contentWidth * (isCompact ? 0.62 : 0.58),
      184,
      244,
    );
    const detailCoverHeight = Math.round(detailCoverWidth * 1.46);

    const bookRowCoverWidth = clamp(contentWidth * 0.26, 88, 104);
    const bookRowCoverHeight = Math.round(bookRowCoverWidth * 1.4);

    return {
      width,
      height,
      shortestSide,
      insets,
      isCompact,
      isLarge,
      horizontalPadding,
      sectionGap,
      itemGap,
      surfacePadding,
      denseActionHeight,
      inputVerticalPadding,
      heroIconSize,
      profileAvatarSize,
      statsIconSize,
      contentWidth,
      gridColumns,
      gridItemWidth,
      carouselCardWidth,
      smallCarouselCardWidth,
      detailCoverWidth,
      detailCoverHeight,
      bookRowCoverWidth,
      bookRowCoverHeight,
      bottomScrollPadding: 120 + Math.max(insets.bottom, 20),
      typeScale: getResponsiveTypeScale(shortestSide),
    };
  }, [height, insets, width]);
}

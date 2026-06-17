import { Image } from 'expo-image';
import { View } from 'react-native';

import { theme } from '@/theme/theme';

type BookCoverProps = {
  uri: string;
  width: number;
  height: number;
  radius?: number;
};

export function BookCover({
  uri,
  width,
  height,
  radius = theme.radius.md,
}: BookCoverProps) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: radius,
        borderCurve: 'continuous',
        overflow: 'hidden',
        backgroundColor: theme.colors.surfaceMuted,
        boxShadow: theme.shadow.soft,
      }}
    >
      <Image
        source={uri}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={250}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 10,
          backgroundColor: 'rgba(9, 18, 14, 0.14)',
          pointerEvents: 'none',
        }}
      />
    </View>
  );
}

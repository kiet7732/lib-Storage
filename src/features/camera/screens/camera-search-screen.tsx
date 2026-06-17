import { useState } from 'react';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { BookCover } from '@/features/books/components/book-cover';
import { getBookById } from '@/services/library';
import { clamp, useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

const detectedBook = getBookById('clean-code');

export function CameraSearchScreen() {
  const layout = useResponsiveLayout();
  const [permission, requestPermission] = useCameraPermissions();
  const [resultVisible, setResultVisible] = useState(true);

  const frameWidth = clamp(layout.contentWidth * 0.8, 240, 320);
  const frameHeight = Math.round(frameWidth * 1.12);
  const frameTop = clamp(layout.height * 0.24, 180, 250);
  const overlayTop = layout.insets.top + 12;
  const instructionTop = overlayTop + 92;
  const cardBottom = layout.insets.bottom + 18;

  if (!permission?.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0f1310',
          alignItems: 'center',
          justifyContent: 'center',
          padding: layout.surfacePadding,
          gap: theme.spacing.lg,
        }}
      >
        <AppText
          variant="display"
          selectable={false}
          style={{ color: theme.colors.white, textAlign: 'center' }}
        >
          Camera Search
        </AppText>
        <AppText selectable={false} style={{ color: '#d9e8e1', textAlign: 'center' }}>
          Cần quyền truy cập camera để thử trải nghiệm nhận diện bìa sách trực tiếp trong
          app.
        </AppText>
        <AppButton label="Cấp quyền camera" onPress={() => requestPermission()} />
        <Pressable onPress={() => router.back()}>
          <AppText tone="white">Quay lại</AppText>
        </Pressable>
      </View>
    );
  }

  if (!detectedBook) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <CameraView style={{ flex: 1 }} facing="back" />

      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: theme.colors.overlay,
          pointerEvents: 'none',
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: overlayTop,
          left: layout.horizontalPadding,
          right: layout.horizontalPadding,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <OverlayIconButton icon="close" onPress={() => router.back()} />
        <OverlayIconButton icon="flash" onPress={() => setResultVisible((current) => !current)} />
      </View>

      <View
        style={{
          position: 'absolute',
          top: instructionTop,
          left: layout.horizontalPadding,
          right: layout.horizontalPadding,
          alignItems: 'center',
          gap: theme.spacing.md,
        }}
      >
        <AppText
          variant="headline"
          selectable={false}
          style={{
            color: theme.colors.white,
            textAlign: 'center',
            maxWidth: Math.min(layout.contentWidth, 320),
          }}
        >
          Đặt bìa sách vào khung để tìm kiếm
        </AppText>
        {resultVisible ? (
          <View
            style={{
              alignSelf: layout.isCompact ? 'stretch' : 'center',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <AppIcon name="check-circle" color={theme.colors.white} size={16} />
            <AppText variant="bodyStrong" tone="white" numberOfLines={1}>
              {detectedBook.title}
            </AppText>
          </View>
        ) : null}
      </View>

      <View
        style={{
          position: 'absolute',
          top: frameTop,
          left: (layout.width - frameWidth) / 2,
          width: frameWidth,
          height: frameHeight,
          borderRadius: 28,
          borderColor: theme.colors.primary,
          borderWidth: 4,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 2,
            backgroundColor: theme.colors.primary,
          }}
        />
      </View>

      <Animated.View
        entering={FadeInUp.springify().damping(16)}
        style={{
          position: 'absolute',
          left: layout.horizontalPadding,
          right: layout.horizontalPadding,
          bottom: cardBottom,
          gap: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: 'rgba(255,255,255,0.96)',
          padding: layout.isCompact ? theme.spacing.sm : theme.spacing.md,
          boxShadow: theme.shadow.floating,
        }}
      >
        <View
          style={{
            flexDirection: layout.isCompact ? 'column' : 'row',
            gap: theme.spacing.md,
          }}
        >
          <BookCover
            uri={detectedBook.coverUrl}
            width={layout.isCompact ? 108 : 92}
            height={layout.isCompact ? 154 : 132}
            radius={14}
          />
          <View style={{ flex: 1, gap: 8 }}>
            <AppText variant="headline">{detectedBook.title}</AppText>
            <AppText tone="muted">{detectedBook.author}</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <View
                style={{
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.surfaceTint,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <AppText variant="label" tone="primary">
                  Sẵn sàng
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <AppButton
          label="Xem chi tiết"
          iconName="arrow-right"
          onPress={() =>
            router.replace({
              pathname: '/books/[id]',
              params: { id: detectedBook.id },
            })
          }
        />
      </Animated.View>
    </View>
  );
}

function OverlayIconButton({
  icon,
  onPress,
}: {
  icon: Parameters<typeof AppIcon>[0]['name'];
  onPress: () => void;
}) {
  const layout = useResponsiveLayout();
  const buttonSize = layout.isCompact ? 48 : 52;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: theme.radius.pill,
            backgroundColor: 'rgba(255,255,255,0.18)',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.76 : 1,
          }}
        >
          <AppIcon name={icon} color={theme.colors.white} />
        </View>
      )}
    </Pressable>
  );
}

import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

type LibrarianActionSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  initialSnapIndex?: number;
  minHeight?: number;
  snapPoints?: number[];
};

export function LibrarianActionSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
  initialSnapIndex = 1,
  minHeight,
  snapPoints,
}: LibrarianActionSheetProps) {
  const layout = useResponsiveLayout();
  const resolvedMinHeight = minHeight ?? (layout.width < 460 ? 430 : 500);
  const resolvedSnapPoints = snapPoints ?? (layout.width < 460 ? [0.94, 0.82, 0.68] : [0.92, 0.8, 0.66]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1 }}>
        <AppBottomSheet
          initialSnapIndex={initialSnapIndex}
          minHeight={resolvedMinHeight}
          onClose={onClose}
          snapPoints={resolvedSnapPoints}
          footer={footer}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: theme.spacing.md,
              paddingHorizontal: layout.horizontalPadding,
              paddingBottom: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="headline">{title}</AppText>
              {subtitle ? <AppText tone="muted">{subtitle}</AppText> : null}
            </View>

            <Pressable onPress={onClose}>
              {({ pressed }) => (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.colors.surfaceMuted,
                    opacity: pressed ? 0.72 : 1,
                  }}
                >
                  <AppIcon name="close" size={18} color={theme.colors.muted} />
                </View>
              )}
            </Pressable>
          </View>

          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: layout.horizontalPadding,
              paddingBottom: footer ? theme.spacing.md : layout.insets.bottom + theme.spacing.xl,
              gap: theme.spacing.md,
            }}
          >
            {children}
          </ScrollView>
        </AppBottomSheet>
      </View>
    </Modal>
  );
}

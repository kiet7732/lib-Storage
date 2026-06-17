import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { notifications } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

export function NotificationsScreen() {
  const layout = useResponsiveLayout();
  const leadingSize = layout.isCompact ? 20 : 32;
  const insetOffset = leadingSize + theme.spacing.md;

  return (
    <AppScrollScreen>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="display">Thông báo</AppText>
        <AppText tone="muted">Cập nhật tình trạng mượn trả của bạn.</AppText>
      </View>

      <View style={{ gap: theme.spacing.lg }}>
        {notifications.map((item) => {
          const tone = {
            success: {
              circle: '#e8f1ed',
              text: theme.colors.primary,
              icon: 'check-circle' as const,
              border: 'transparent',
            },
            warning: {
              circle: '#fff0e2',
              text: '#a96614',
              icon: 'clock' as const,
              border: 'transparent',
            },
            danger: {
              circle: '#fde8e5',
              text: theme.colors.danger,
              icon: 'money' as const,
              border: '#f3c1bb',
            },
            info: {
              circle: '#f2f1eb',
              text: theme.colors.muted,
              icon: 'info' as const,
              border: 'transparent',
            },
          }[item.type];

          return (
            <View
              key={item.id}
              style={{
                gap: theme.spacing.md,
                borderRadius: theme.radius.lg,
                borderCurve: 'continuous',
                backgroundColor: theme.colors.surface,
                padding: layout.surfacePadding,
                boxShadow: theme.shadow.card,
                borderWidth: item.type === 'danger' ? 1 : 0,
                borderColor: tone.border,
              }}
            >
              <View
                style={{
                  flexDirection: layout.isCompact ? 'column' : 'row',
                  gap: theme.spacing.md,
                }}
              >
                <View
                  style={{
                    width: leadingSize,
                    height: leadingSize,
                    borderRadius: theme.radius.pill,
                    backgroundColor: tone.circle,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppIcon name={tone.icon} color={tone.text} size={layout.isCompact ? 14 : 20} />
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <AppText variant="headline" selectable={false} style={{ color: tone.text }}>
                    {item.title}
                  </AppText>
                  <AppText tone="muted">{item.message}</AppText>
                </View>
              </View>

              {item.amount ? (
                <View
                  style={{
                    marginLeft: layout.isCompact ? 0 : insetOffset,
                    borderRadius: theme.radius.md,
                    borderCurve: 'continuous',
                    borderWidth: 1,
                    borderColor: '#f3d8d3',
                    backgroundColor: '#fff8f7',
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: theme.spacing.md,
                  }}
                >
                  <AppText>Tổng tiền phạt:</AppText>
                  <AppText variant="bodyStrong" tone="danger">
                    {item.amount}
                  </AppText>
                </View>
              ) : null}

              <AppText
                variant="caption"
                tone="muted"
                style={{ marginLeft: layout.isCompact ? 0 : insetOffset }}
              >
                {item.timeLabel}
              </AppText>
            </View>
          );
        })}
      </View>
    </AppScrollScreen>
  );
}

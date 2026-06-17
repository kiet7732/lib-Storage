import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { StatusChip } from '@/components/ui/status-chip';
import { historyEvents } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

export function HistoryScreen() {
  const layout = useResponsiveLayout();
  const railWidth = layout.isCompact ? 24 : 36;
  const iconSize = layout.isCompact ? 24 : 32;

  return (
    <AppScrollScreen>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="display">Lịch sử hoạt động</AppText>
        <AppText tone="muted">Theo dõi quá trình mượn trả sách của bạn.</AppText>
      </View>

      <View style={{ gap: layout.sectionGap }}>
        {historyEvents.map((event, index) => {
          const eventConfig = {
            borrowed: { label: 'Đã mượn', tone: 'success' as const, icon: 'library' as const },
            returned: { label: 'Đã trả', tone: 'neutral' as const, icon: 'check-circle' as const },
            renewed: { label: 'Gia hạn', tone: 'warning' as const, icon: 'history' as const },
            'late-return': {
              label: 'Đã trả (trễ)',
              tone: 'danger' as const,
              icon: 'warning' as const,
            },
          }[event.type];

          return (
            <View key={event.id} style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <View
                style={{
                  width: railWidth,
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: iconSize,
                    height: iconSize,
                    borderRadius: theme.radius.pill,
                    borderCurve: 'continuous',
                    backgroundColor: theme.colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.shadow.soft,
                  }}
                >
                  <AppIcon name={eventConfig.icon} color={theme.colors.primary} />
                </View>
                {index === historyEvents.length - 1 ? null : (
                  <View style={{ flex: 1, width: 2, backgroundColor: '#ebe7dd' }} />
                )}
              </View>

              <View
                style={{
                  flex: 1,
                  gap: theme.spacing.md,
                  borderRadius: theme.radius.lg,
                  borderCurve: 'continuous',
                  backgroundColor: theme.colors.surface,
                  padding: layout.surfacePadding,
                  boxShadow: theme.shadow.card,
                }}
              >
                <View
                  style={{
                    flexDirection: layout.isCompact ? 'column' : 'row',
                    justifyContent: 'space-between',
                    gap: theme.spacing.sm,
                  }}
                >
                  <StatusChip label={eventConfig.label} tone={eventConfig.tone} />
                  <AppText variant="caption" tone="muted">
                    {event.date}
                  </AppText>
                </View>
                <View style={{ gap: 6 }}>
                  <AppText variant="headline" numberOfLines={2}>
                    {event.bookTitle}
                  </AppText>
                  <AppText tone="muted" numberOfLines={1}>
                    {event.bookAuthor}
                  </AppText>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <AppIcon name="calendar" color={theme.colors.muted} size={18} />
                  <AppText style={{ flex: 1 }}>{event.note}</AppText>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </AppScrollScreen>
  );
}

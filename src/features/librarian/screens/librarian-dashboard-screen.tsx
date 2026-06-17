import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon, type IconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { librarianActivities, librarianStats } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic } from '@/utils/haptics';

import { LibrarianScreenShell } from '../components/librarian-screen-shell';

const statDestinations: Record<string, '/requests' | '/returns'> = {
  'pending-borrow': '/requests',
  'pending-renew': '/requests',
  overdue: '/returns',
  returned: '/returns',
};

const quickActions: Array<{
  id: string;
  label: string;
  icon: IconName;
  tone: 'primary' | 'secondary' | 'danger';
  route: '/requests' | '/returns' | '/reports';
}> = [
  {
    id: 'approve',
    label: 'Duyệt yêu cầu',
    icon: 'check-circle',
    tone: 'primary',
    route: '/requests',
  },
  {
    id: 'return',
    label: 'Xác nhận trả',
    icon: 'return',
    tone: 'secondary',
    route: '/returns',
  },
  {
    id: 'overdue',
    label: 'Xử lý quá hạn',
    icon: 'warning',
    tone: 'danger',
    route: '/returns',
  },
  {
    id: 'report',
    label: 'Xuất báo cáo',
    icon: 'report',
    tone: 'secondary',
    route: '/reports',
  },
];

const SHELL_MAX_WIDTH = 760;

function getGridItemWidth(containerWidth: number, columns: number, gap: number) {
  if (columns <= 1) {
    return containerWidth;
  }

  return Math.floor((containerWidth - gap * (columns - 1)) / columns);
}

export function LibrarianDashboardScreen() {
  const layout = useResponsiveLayout();
  const cardGap = theme.spacing.md;
  const splitGap = theme.spacing.lg;
  const shellContentWidth = Math.min(
    layout.contentWidth,
    layout.isLarge ? SHELL_MAX_WIDTH - layout.horizontalPadding * 2 : layout.contentWidth,
  );
  const contentIsNarrow = shellContentWidth < 400;
  const useSplitSections = shellContentWidth >= 680;
  const statsColumns = useSplitSections ? 4 : shellContentWidth >= 360 ? 2 : 1;
  const statCardWidth = getGridItemWidth(shellContentWidth, statsColumns, cardGap);
  const secondarySectionWidth = useSplitSections
    ? getGridItemWidth(shellContentWidth, 2, splitGap)
    : shellContentWidth;
  const quickActionColumns = useSplitSections ? 2 : shellContentWidth >= 360 ? 2 : 1;
  const quickActionCardWidth = getGridItemWidth(secondarySectionWidth, quickActionColumns, cardGap);
  const compactQuickActions = quickActionCardWidth < 180;
  const activityTimeWidth = useSplitSections ? 72 : contentIsNarrow ? 64 : 84;

  return (
    <LibrarianScreenShell
      title="Chào buổi sáng, Thủ thư"
      subtitle="Tổng quan nhanh các luồng đang cần xử lý trong ca làm việc."
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: cardGap }}>
        {librarianStats.map((stat) => (
          <Pressable
            key={stat.id}
            style={{ width: statCardWidth }}
            onPress={async () => {
              await selectionHaptic();
              router.push(statDestinations[stat.id]);
            }}
          >
            {({ pressed }) => (
              <View
                style={{
                  minHeight: contentIsNarrow ? 168 : 180,
                  borderRadius: theme.radius.lg,
                  borderCurve: 'continuous',
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  boxShadow: theme.shadow.card,
                  borderWidth: stat.tone === 'danger' ? 1 : 0,
                  borderColor: stat.tone === 'danger' ? '#f5d2cf' : 'transparent',
                  justifyContent: 'space-between',
                  opacity: pressed ? 0.84 : 1,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: theme.radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      stat.tone === 'danger'
                        ? '#fde3df'
                        : stat.tone === 'warning'
                          ? '#ffe7d0'
                          : '#dcebe5',
                  }}
                >
                  <AppIcon
                    name={stat.icon}
                    color={stat.tone === 'danger' ? theme.colors.danger : theme.colors.primary}
                  />
                </View>

                <View style={{ gap: 4 }}>
                  <AppText variant="display" tone={stat.tone === 'danger' ? 'danger' : 'primary'}>
                    {stat.value}
                  </AppText>
                  <AppText
                    variant="bodyStrong"
                    tone={stat.tone === 'danger' ? 'danger' : 'text'}
                    numberOfLines={2}
                  >
                    {stat.label}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    Chạm để mở danh sách liên quan
                  </AppText>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <View
        style={{
          flexDirection: useSplitSections ? 'row' : 'column',
          alignItems: 'flex-start',
          gap: splitGap,
        }}
      >
        <View style={{ width: secondarySectionWidth, gap: theme.spacing.md, minWidth: 0 }}>
          <AppText variant="headline">Thao tác nhanh</AppText>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: cardGap }}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={{ width: quickActionCardWidth }}
                onPress={async () => {
                  await selectionHaptic();
                  router.push(action.route);
                }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      minHeight: compactQuickActions ? 82 : contentIsNarrow ? 88 : 92,
                      flexDirection: compactQuickActions ? 'column' : 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: compactQuickActions ? theme.spacing.xs : theme.spacing.sm,
                      borderRadius: theme.radius.md,
                      borderCurve: 'continuous',
                      backgroundColor:
                        action.tone === 'primary' ? theme.colors.primary : theme.colors.surface,
                      borderWidth: action.tone === 'primary' ? 0 : 1,
                      borderColor: action.tone === 'danger' ? '#f1b8b3' : theme.colors.border,
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: theme.spacing.sm,
                      opacity: pressed ? 0.86 : 1,
                    }}
                  >
                    <AppIcon
                      name={action.icon}
                      color={
                        action.tone === 'primary'
                          ? theme.colors.white
                          : action.tone === 'danger'
                            ? theme.colors.danger
                            : theme.colors.primary
                      }
                    />
                    <AppText
                      variant="bodyStrong"
                      tone={
                        action.tone === 'primary'
                          ? 'white'
                          : action.tone === 'danger'
                            ? 'danger'
                            : 'text'
                      }
                      numberOfLines={2}
                      style={{ flexShrink: 1, textAlign: 'center' }}
                    >
                      {action.label}
                    </AppText>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ width: secondarySectionWidth, gap: theme.spacing.md, minWidth: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.spacing.md,
            }}
          >
            <AppText variant="headline">Hoạt động gần đây</AppText>
            <Pressable
              onPress={async () => {
                await selectionHaptic();
                router.push('/reports');
              }}
            >
              {({ pressed }) => (
                <AppText
                  variant="bodyStrong"
                  tone="primary"
                  style={{ opacity: pressed ? 0.72 : 1 }}
                >
                  Xem tất cả
                </AppText>
              )}
            </Pressable>
          </View>

          <View
            style={{
              borderRadius: theme.radius.lg,
              borderCurve: 'continuous',
              overflow: 'hidden',
              backgroundColor: theme.colors.surface,
              boxShadow: theme.shadow.card,
            }}
          >
            {librarianActivities.map((activity, index) => (
              <View
                key={activity.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: theme.spacing.md,
                  padding: theme.spacing.md,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: theme.colors.surfaceMuted,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: theme.radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      activity.tone === 'danger'
                        ? '#fde3df'
                        : activity.tone === 'warning'
                          ? '#f8ead9'
                          : '#e1ece6',
                  }}
                >
                  <AppIcon
                    name={activity.icon}
                    size={18}
                    color={activity.tone === 'danger' ? theme.colors.danger : theme.colors.primary}
                  />
                </View>

                <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
                  <AppText numberOfLines={2}>{activity.title}</AppText>
                  <AppText variant="caption" tone="muted" numberOfLines={2}>
                    {activity.note}
                  </AppText>
                </View>

                <AppText
                  variant="caption"
                  tone="muted"
                  style={{
                    width: activityTimeWidth,
                    textAlign: 'right',
                  }}
                >
                  {activity.timeLabel}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </LibrarianScreenShell>
  );
}

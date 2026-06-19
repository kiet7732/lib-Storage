import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { StatusChip } from '@/components/ui/status-chip';
import { useAuth } from '@/features/auth/auth-context';
import { studentProfile } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { successHaptic } from '@/utils/haptics';

export function ProfileScreen() {
  const layout = useResponsiveLayout();
  const { signOut } = useAuth();

  return (
    <AppScrollScreen>
      <AppText variant="display" tone="primary">
        Cá nhân
      </AppText>

      <View
        style={{
          flexDirection: layout.isCompact ? 'column' : 'row',
          alignItems: layout.isCompact ? 'flex-start' : 'center',
          gap: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.surface,
          padding: layout.surfacePadding,
          boxShadow: theme.shadow.card,
        }}
      >
        <Image
          source={studentProfile.avatarUrl}
          style={{
            width: layout.profileAvatarSize,
            height: layout.profileAvatarSize,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surfaceMuted,
          }}
          contentFit="cover"
        />

        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <AppText variant="display">{studentProfile.fullName}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppIcon name="bookmark" color={theme.colors.muted} size={18} />
            <AppText tone="muted">{studentProfile.studentId}</AppText>
          </View>
          <StatusChip label={studentProfile.faculty.toUpperCase()} tone="success" />
        </View>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="headline">Thống kê</AppText>
        <View style={{ flexDirection: layout.isCompact ? 'column' : 'row', gap: layout.itemGap }}>
          <ProfileStat icon="history" value={studentProfile.booksRead} label="SÁCH ĐÃ ĐỌC" />
          <ProfileStat icon="bookmark" value={studentProfile.currentlyBorrowed} label="ĐANG MƯỢN" />
        </View>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="headline">Cài đặt & Hỗ trợ</AppText>
        <View
          style={{
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            padding: layout.surfacePadding,
            gap: theme.spacing.md,
            boxShadow: theme.shadow.card,
          }}
        >
          <ProfileMenuItem icon="user" label="Tài khoản" />
          <Link href="/notifications" asChild>
            <Pressable>
              <ProfileMenuItem icon="bell" label="Thông báo" />
            </Pressable>
          </Link>
          <ProfileMenuItem icon="info" label="Trợ giúp" />
          <View
            style={{
              height: 1,
              backgroundColor: theme.colors.border,
              marginVertical: theme.spacing.sm,
            }}
          />
          <Pressable
            onPress={async () => {
              await successHaptic();
              await signOut();
            }}
          >
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.72 : 1 }}>
                <ProfileMenuItem icon="logout" label="Đăng xuất" destructive />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </AppScrollScreen>
  );
}

function ProfileStat({
  icon,
  value,
  label,
}: {
  icon: Parameters<typeof AppIcon>[0]['name'];
  value: number;
  label: string;
}) {
  const layout = useResponsiveLayout();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        gap: theme.spacing.xs, 
        borderRadius: theme.radius.md, 
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md, 
        boxShadow: theme.shadow.card,
      }}
    >
      <View
        style={{
          width: 40, 
          height: 40,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name={icon} color={theme.colors.primary} size={19} />
      </View>
      <AppText variant="title" style={{ fontVariant: ['tabular-nums'] }}> 
        {value}
      </AppText>
      <AppText variant="label" tone="muted" style={{ textAlign: 'center', fontSize: 10 }}> 
        {label}
      </AppText>
    </View>
  );
}

function ProfileMenuItem({
  icon,
  label,
  destructive = false,
}: {
  icon: Parameters<typeof AppIcon>[0]['name'];
  label: string;
  destructive?: boolean;
}) {
  const layout = useResponsiveLayout();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: layout.isCompact ? 26 : 32,
          height: layout.isCompact ? 26 : 32,
          borderRadius: theme.radius.pill,
          backgroundColor: destructive ? '#fde8e5' : theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name={icon} color={destructive ? theme.colors.danger : theme.colors.muted} />
      </View>
      <AppText
        variant={layout.isCompact ? 'bodyStrong' : 'title'}
        style={{ flex: 1, color: destructive ? theme.colors.danger : theme.colors.text }}
      >
        {label}
      </AppText>
      <AppIcon
        name="arrow-right"
        color={destructive ? theme.colors.danger : theme.colors.outline}
      />
    </View>
  );
}

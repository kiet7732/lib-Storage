import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/app-icon';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { StatusChip } from '@/components/ui/status-chip';
import { BookCard } from '@/features/books/components/book-card';
import { books, borrowedItems, recommendedBookIds, studentProfile } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

export function HomeScreen() {
  const layout = useResponsiveLayout();
  const recommendedBooks = recommendedBookIds
    .map((id) => books.find((book) => book.id === id))
    .filter((book): book is (typeof books)[number] => Boolean(book));
  const recommendedCoverHeight = Math.round(layout.carouselCardWidth * 1.39);
  const greetingName = studentProfile.fullName.trim().split(' ').pop() ?? studentProfile.fullName;
  const borrowLimitProgress = Math.min(
    100,
    Math.round((studentProfile.currentlyBorrowed / studentProfile.currentBorrowLimit) * 100),
  );
  const highlightedItem =
    borrowedItems.find((item) => item.status === 'overdue') ??
    borrowedItems.find((item) => item.status === 'due-soon') ??
    borrowedItems[0];
  const highlightedState =
    highlightedItem?.status === 'overdue'
      ? {
          chipLabel: 'Quá hạn',
          chipTone: 'danger' as const,
          cardBackground: '#ffd8d2',
          buttonBackground: '#b40010',
          description: highlightedItem.note ?? `Hạn trả: ${highlightedItem.dueDate}`,
        }
      : highlightedItem?.status === 'due-soon'
        ? {
            chipLabel: 'Sắp đến hạn',
            chipTone: 'warning' as const,
            cardBackground: '#fff1d6',
            buttonBackground: theme.colors.primaryStrong,
            description: highlightedItem.note ?? `Hạn trả: ${highlightedItem.dueDate}`,
          }
        : highlightedItem
          ? {
              chipLabel: 'Đang mượn',
              chipTone: 'success' as const,
              cardBackground: theme.colors.surface,
              buttonBackground: theme.colors.primaryStrong,
              description: `Hạn trả: ${highlightedItem.dueDate}`,
            }
          : null;

  return (
    <AppScrollScreen>
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="display" tone="primary">
          Chào buổi sáng, {greetingName}!
        </AppText>
        <AppText tone="muted">Hôm nay bạn muốn đọc gì?</AppText>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: theme.spacing.sm }}>
        <Link href="/books" asChild>
          <Pressable style={{ flex: 1 }}>
            {({ pressed }) => (
              <View
                style={{
                  minHeight: layout.denseActionHeight,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  borderCurve: 'continuous',
                  backgroundColor: theme.colors.surface,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: layout.inputVerticalPadding,
                  boxShadow: theme.shadow.card,
                  opacity: pressed ? 0.82 : 1,
                }}
              >
                <AppIcon name="search" color={theme.colors.outline} />
                <AppText tone="muted" numberOfLines={1} style={{ flex: 1 }}>
                  Tìm kiếm sách, tác giả, chuyên ngành...
                </AppText>
                <AppIcon name="camera" color={theme.colors.primary} />
              </View>
            )}
          </Pressable>
        </Link>

        <Link href="/notifications" asChild>
          <Pressable style={{ alignSelf: 'stretch' }}>
            {({ pressed }) => (
              <View
                style={{
                  width: layout.denseActionHeight,
                  height: layout.denseActionHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.radius.md,
                  borderCurve: 'continuous',
                  backgroundColor: theme.colors.surface,
                  boxShadow: theme.shadow.card,
                  opacity: pressed ? 0.82 : 1,
                }}
              >
                <AppIcon name="bell" color={theme.colors.primary} />
              </View>
            )}
          </Pressable>
        </Link>
      </View>

      <Animated.View entering={FadeInDown.delay(60).springify().damping(16)}>
        <View
          style={{
            gap: theme.spacing.md,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            padding: layout.surfacePadding,
            boxShadow: theme.shadow.card,
          }}
        >
          <AppText variant="label" tone="muted">
            TỔNG QUAN
          </AppText>
          <AppText variant="headline" tone="primary">
            Đang mượn: {studentProfile.currentlyBorrowed} cuốn
          </AppText>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 10,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.surfaceMuted,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${borrowLimitProgress}%`,
                  height: '100%',
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.primaryStrong,
                }}
              />
            </View>
            <AppText variant="caption" tone="muted" style={{ fontVariant: ['tabular-nums'] }}>
              Hạn mức: {studentProfile.currentBorrowLimit}
            </AppText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).springify().damping(16)}>
        <View
          style={{
            gap: theme.spacing.md,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: highlightedState?.cardBackground ?? theme.colors.surface,
            padding: layout.surfacePadding,
            boxShadow: theme.shadow.card,
          }}
        >
          {highlightedItem && highlightedState ? (
            <>
              <StatusChip
                label={highlightedState.chipLabel}
                tone={highlightedState.chipTone}
                iconName="clock"
              />
              <View style={{ gap: 4 }}>
                <AppText
                  variant="headline"
                  tone={highlightedState.chipTone === 'danger' ? 'danger' : 'primary'}
                  numberOfLines={2}
                >
                  {highlightedItem.bookTitle}
                </AppText>
                <AppText tone={highlightedState.chipTone === 'danger' ? 'danger' : 'muted'}>
                  {highlightedState.description}
                </AppText>
              </View>
              <Link href="/my-library" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <View
                      style={{
                        minHeight: layout.denseActionHeight,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: theme.radius.md,
                        borderCurve: 'continuous',
                        backgroundColor: highlightedState.buttonBackground,
                        paddingVertical: 16,
                        opacity: pressed ? 0.85 : 1,
                      }}
                    >
                      <AppText variant="bodyStrong" tone="white">
                        {highlightedItem.renewable ? 'Gia hạn ngay' : 'Xem trong tủ sách'}
                      </AppText>
                    </View>
                  )}
                </Pressable>
              </Link>
            </>
          ) : (
            <>
              <StatusChip label="Sẵn sàng đọc mới" tone="success" iconName="check-circle" />
              <View style={{ gap: 4 }}>
                <AppText variant="headline" tone="primary">
                  Bạn chưa có sách cần xử lý
                </AppText>
                <AppText tone="muted">Hãy khám phá thêm đầu sách mới trong thư viện.</AppText>
              </View>
            </>
          )}
        </View>
      </Animated.View>

      <View style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="headline">Gợi ý cho bạn</AppText>
          <Link href="/books" asChild>
            <Pressable>
              <AppText variant="bodyStrong" tone="primary">
                Xem tất cả
              </AppText>
            </Pressable>
          </Link>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: layout.itemGap, paddingRight: layout.horizontalPadding }}
        >
          {recommendedBooks.map((book) => (
            <View key={book.id} style={{ width: layout.carouselCardWidth }}>
              <BookCard
                book={book}
                coverHeight={recommendedCoverHeight}
                coverWidth={layout.carouselCardWidth}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="headline">Truy cập nhanh</AppText>
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            padding: layout.isCompact ? theme.spacing.xs : theme.spacing.sm,
            boxShadow: theme.shadow.card,
          }}
        >
          <QuickLinkCard href="/search/camera" icon="camera" title="Quét sách" />
          <QuickLinkCard href="/history" icon="history" title="Lịch sử" />
          <QuickLinkCard href="/notifications" icon="bell" title="Thông báo" />
        </View>
      </View>

      <View
        style={{
          gap: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.surface,
          padding: layout.surfacePadding,
          boxShadow: theme.shadow.card,
        }}
      >
        <AppText variant="headline">Hoạt động gần đây</AppText>
        {borrowedItems.slice(0, 2).map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="bodyStrong" numberOfLines={2}>
                {item.bookTitle}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {item.branchName} | Hạn trả: {item.dueDate}
              </AppText>
            </View>
            <StatusChip
              label={item.status === 'overdue' ? 'Quá hạn' : item.status === 'due-soon' ? 'Sắp đến hạn' : 'Đang mượn'}
              tone={item.status === 'overdue' ? 'danger' : item.status === 'due-soon' ? 'warning' : 'success'}
            />
          </View>
        ))}
      </View>
    </AppScrollScreen>
  );
}

function QuickLinkCard({
  href,
  icon,
  title,
}: {
  href: Href;
  icon: Parameters<typeof AppIcon>[0]['name'];
  title: string;
}) {
  const layout = useResponsiveLayout();

  return (
    <Link href={href} asChild>
      <Pressable style={{ flex: 1 }}>
        {({ pressed }) => (
          <View
            style={{
              minHeight: layout.isCompact ? 54 : 64,
              gap: layout.isCompact ? theme.spacing.xs : theme.spacing.sm,
              borderRadius: theme.radius.md,
              borderCurve: 'continuous',
              // backgroundColor: theme.colors.surfaceMuted,
              paddingHorizontal: layout.isCompact ? theme.spacing.xs : theme.spacing.sm,
              paddingVertical: layout.isCompact ? theme.spacing.sm : theme.spacing.md,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.82 : 1,
            }}
          >
            <View
              style={{
                width: layout.isCompact ? 10 : 17,
                height: layout.isCompact ? 10 : 17,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon
                name={icon}
                color={theme.colors.primary}
                size={layout.isCompact ? 17 : 20}
              />
            </View>
            <AppText
              variant="label"
              numberOfLines={2}
              style={{
                textAlign: 'center',
                fontSize: layout.isCompact ? 11 : 12,
                lineHeight: layout.isCompact ? 14 : 16,
              }}
            >
              {title}
            </AppText>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

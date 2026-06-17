import { Link, Stack, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { StatusChip } from '@/components/ui/status-chip';
import { BookCard } from '@/features/books/components/book-card';
import { BookCover } from '@/features/books/components/book-cover';
import { books, getBookById } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

export function BookDetailScreen() {
  const layout = useResponsiveLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = getBookById(id) ?? books[0];
  const similarBooks = books.filter((entry) => entry.id !== book.id).slice(0, 3);
  const similarCoverHeight = Math.round(layout.smallCarouselCardWidth * 1.39);

  const handleBorrowPress = () => {
    router.push({
      pathname: '/borrow/request',
      params: {
        bookId: book.id,
        intent: 'borrow',
        returnTo: `/books/${book.id}`,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: 'Chi tiết sách' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: layout.isCompact ? theme.spacing.sm : theme.spacing.md,
          paddingBottom: theme.spacing.xl,
          gap: layout.sectionGap,
        }}
      >
        <View style={{ alignItems: 'center', gap: layout.sectionGap }}>
          <BookCover
            uri={book.coverUrl}
            width={layout.detailCoverWidth}
            height={layout.detailCoverHeight}
            radius={20}
          />

          <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
            <AppText variant="display" style={{ textAlign: 'center', color: theme.colors.text }}>
              {book.title}
            </AppText>
            <AppText tone="muted">{book.author}</AppText>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <AppText tone="muted">{book.publisher}</AppText>
            <AppText tone="muted">•</AppText>
            <AppText tone="muted">{book.year}</AppText>
            <AppText tone="muted">•</AppText>
            <AppText
              tone="muted"
              style={{
                maxWidth: Math.min(layout.contentWidth - 40, 220),
                textAlign: 'center',
              }}
            >
              ISBN: {book.isbn}
            </AppText>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: theme.spacing.xs,
            }}
          >
            {book.categories.map((category) => (
              <StatusChip key={category} label={category} />
            ))}
            <StatusChip
              label={`Còn ${book.copiesAvailable} cuốn`}
              tone="success"
              iconName="check-circle"
            />
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="headline">Giới thiệu</AppText>
          <AppText tone="muted">{book.summary}</AppText>
        </View>

        <View
          style={{
            gap: theme.spacing.sm,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            padding: layout.surfacePadding,
            boxShadow: theme.shadow.card,
          }}
        >
          <AppText variant="headline">Thông tin thư viện</AppText>
          <DetailRow label="Vị trí" value={book.location} />
          <DetailRow label="Phân loại" value={book.categories.join(', ')} />
          <DetailRow label="Khả dụng" value={`${book.copiesAvailable} bản có thể mượn`} />
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <AppText variant="headline">Sách tương tự</AppText>
            <Link href="/books" asChild>
              <Pressable>
                <AppText variant="bodyStrong" tone="primary">
                  Xem thêm
                </AppText>
              </Pressable>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: layout.itemGap,
              paddingRight: layout.horizontalPadding,
            }}
          >
            {similarBooks.map((item) => (
              <View key={item.id} style={{ width: layout.smallCarouselCardWidth }}>
                <BookCard
                  book={item}
                  coverWidth={layout.smallCarouselCardWidth}
                  coverHeight={similarCoverHeight}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: theme.spacing.sm,
          paddingBottom: Math.max(layout.insets.bottom, theme.spacing.sm),
          boxShadow: '0px -10px 28px rgba(20, 25, 22, 0.06)',
        }}
      >
        <AppButton label="Mượn sách ngay" iconName="library" onPress={handleBorrowPress} />
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

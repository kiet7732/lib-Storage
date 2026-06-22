import { useState, useEffect } from 'react';
import { Link, Stack, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View, ActivityIndicator } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { StatusChip } from '@/components/ui/status-chip';
import { BookCard } from '@/features/books/components/book-card';
import { BookCover } from '@/features/books/components/book-cover';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { Book } from '@/services/library/library.types';

export function BookDetailScreen() {
  const layout = useResponsiveLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [book, setBook] = useState<Book | null>(null);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const similarCoverHeight = Math.round(layout.smallCarouselCardWidth * 1.39);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch book detail
      const res = await fetch(`http://localhost:8088/api/books/${id}`);
      if (!res.ok) throw new Error('Không tìm thấy sách này trong hệ thống');
      const item = await res.json();
      
      const mappedBook: Book = {
        id: item.id || "0-0",
        title: item.title || "0-0",
        author: item.author || "0-0",
        publisher: item.publisher || "0-0",
        year: item.year || 0,
        isbn: item.isbn || "0-0",
        coverUrl: item.coverUrl || "",
        categories: item.categories?.map((c: any) => c.label) || ["0-0"],
        summary: item.summary || "0-0",
        copiesAvailable: 0,
        location: "0-0"
      };
      
      setBook(mappedBook);

      // Fetch similar books (random 3 books)
      const similarRes = await fetch(`http://localhost:8088/api/books?size=3`);
      if (similarRes.ok) {
        const similarJson = await similarRes.json();
        if (similarJson.content) {
          const mappedSimilar: Book[] = similarJson.content
            .filter((sim: any) => sim.id !== id)
            .map((sim: any) => ({
              id: sim.id || "0-0",
              title: sim.title || "0-0",
              author: sim.author || "0-0",
              publisher: sim.publisher || "0-0",
              year: sim.year || 0,
              isbn: sim.isbn || "0-0",
              coverUrl: sim.coverUrl || "",
              categories: sim.categories?.map((c: any) => c.label) || ["0-0"],
              summary: sim.summary || "0-0",
              copiesAvailable: 0,
              location: "0-0"
            }));
          setSimilarBooks(mappedSimilar);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleBorrowPress = () => {
    if (!book) return;
    router.push({
      pathname: '/borrow/request',
      params: {
        bookId: book.id,
        intent: 'borrow',
        returnTo: `/books/${book.id}`,
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Stack.Screen options={{ title: 'Đang tải...' }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Stack.Screen options={{ title: 'Lỗi' }} />
        <AppText tone="danger">{error || 'Không tìm thấy sách'}</AppText>
      </View>
    );
  }

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
            <AppText tone="muted">{book.year === 0 ? "0-0" : book.year}</AppText>
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
              label={`Còn 0-0 cuốn`}
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
          <DetailRow label="Khả dụng" value={`0-0 bản có thể mượn`} />
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
                  statusLabel={"0-0"}
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

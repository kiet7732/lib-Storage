import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { BookCard } from '@/features/books/components/book-card';
import { Book } from '@/services/library/library.types';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic } from '@/utils/haptics';

const filters = ['Tất cả', 'Computers', 'Business', 'Fiction', 'Science', 'Technology'];
const PAGE_SIZE = 20;

export function BookListScreen() {
  const layout = useResponsiveLayout();

  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [booksData, setBooksData] = useState<Book[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const gridCoverHeight = Math.round(layout.gridItemWidth * 1.39);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch books
  const fetchBooks = async (pageIndex: number, filter: string, query: string, append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      let url = `http://localhost:8088/api/books?size=${PAGE_SIZE}&page=${pageIndex}`;

      const searchTerms = [];
      if (filter !== 'Tất cả') searchTerms.push(filter);
      if (query.trim()) searchTerms.push(query.trim());

      if (searchTerms.length > 0) {
        url += `&q=${encodeURIComponent(searchTerms.join(' '))}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();

      if (json && json.content) {
        // Shuffle array to show random books
        const shuffledContent = [...json.content].sort(() => Math.random() - 0.5);
        
        const mappedBooks: Book[] = shuffledContent.map((item: any) => ({
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
        }));

        if (append) {
          setBooksData(prev => [...prev, ...mappedBooks]);
        } else {
          setBooksData(mappedBooks);
        }

        setHasMore(!json.last && json.content.length > 0);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      if (!append) setBooksData([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset and fetch when filter or query changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchBooks(0, activeFilter, debouncedQuery, false);
  }, [activeFilter, debouncedQuery]);

  // Load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBooks(nextPage, activeFilter, debouncedQuery, true);
    }
  };

  return (
    <AppScrollScreen>
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="display" tone="primary">
          Danh mục sách
        </AppText>
        <AppText tone="muted">
          Tìm theo tên sách, tác giả, ISBN hoặc ngành học.
        </AppText>
      </View>

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
        }}
      >
        <AppIcon name="search" color={theme.colors.outline} />
        <TextInput
          placeholder="Tìm sách, tác giả, ISBN..."
          placeholderTextColor={theme.colors.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            flex: 1,
            fontFamily: theme.fonts.sansRegular,
            fontSize: layout.isCompact ? 15 : 16,
            color: theme.colors.text,
          }}
        />
        <Link href="/search/camera" asChild>
          <Pressable>
            <AppIcon name="camera" color={theme.colors.primary} />
          </Pressable>
        </Link>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: layout.itemGap - 2, paddingRight: layout.horizontalPadding }}
      >
        {filters.map((filter) => {
          const active = filter === activeFilter;

          return (
            <Pressable
              key={filter}
              onPress={async () => {
                await selectionHaptic();
                setActiveFilter(filter);
              }}
            >
              {({ pressed }) => (
                <View
                  style={{
                    borderRadius: theme.radius.pill,
                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    paddingHorizontal: layout.isCompact ? 14 : 16,
                    paddingVertical: layout.isCompact ? 9 : 10,
                    borderWidth: active ? 0 : 1,
                    borderColor: theme.colors.border,
                    opacity: pressed ? 0.74 : 1,
                  }}
                >
                  <AppText
                    variant="label"
                    style={{ color: active ? theme.colors.white : theme.colors.text }}
                  >
                    {filter}
                  </AppText>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* <View
        style={{
          borderRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.primary,
          padding: layout.surfacePadding,
          gap: theme.spacing.sm,
          boxShadow: theme.shadow.floating,
        }}
      >
        <AppText variant="label" style={{ color: '#ffcb8f' }}>
          BỘ SƯU TẬP GỢI Ý
        </AppText>
        <AppText variant="headline" selectable={false} style={{ color: '#9adac1' }}>
          8 đầu sách cho đề tài AI và UX semester này
        </AppText>
        <AppText style={{ color: '#d5efe4' }}>
          Tập hợp các đầu sách dễ đọc để demo và đủ thực tế để dùng làm phần nghiệp
          vụ cho đồ án.
        </AppText>
      </View> */}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: layout.itemGap }}>
        {booksData.map((book) => (
          <View key={book.id} style={{ width: layout.gridItemWidth }}>
            <BookCard
              book={book}
              coverHeight={gridCoverHeight}
              coverWidth={layout.gridItemWidth}
              statusLabel={"0-0"}
            />
          </View>
        ))}
      </View>

      {/* Pagination Load More */}
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
        {!loading && hasMore && booksData.length > 0 && (
          <AppButton label="Xem thêm" variant="secondary" onPress={handleLoadMore} />
        )}
        {!loading && !hasMore && booksData.length > 0 && (
          <AppText tone="muted">Đã tải hết sách.</AppText>
        )}
        {!loading && booksData.length === 0 && (
          <AppText tone="muted">Không tìm thấy sách nào.</AppText>
        )}
      </View>
    </AppScrollScreen>
  );
}

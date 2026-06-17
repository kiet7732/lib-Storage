import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { BookCard } from '@/features/books/components/book-card';
import { books } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic } from '@/utils/haptics';

const filters = ['Tất cả', 'AI', 'UX', 'Kỹ thuật'];

export function BookListScreen() {
  const layout = useResponsiveLayout();
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const filteredBooks = books.filter((book) =>
    activeFilter === 'Tất cả' ? true : book.categories.includes(activeFilter),
  );
  const gridCoverHeight = Math.round(layout.gridItemWidth * 1.39);

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

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: layout.itemGap - 2 }}>
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
      </View>

      <View
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
          Tập hợp các đầu sách dễ đẹp để demo và đủ thực tế để dùng làm phần nghiệp
          vụ cho đồ án.
        </AppText>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: layout.itemGap }}>
        {filteredBooks.map((book) => (
          <View key={book.id} style={{ width: layout.gridItemWidth }}>
            <BookCard
              book={book}
              coverHeight={gridCoverHeight}
              coverWidth={layout.gridItemWidth}
              statusLabel={
                book.copiesAvailable > 0
                  ? `Còn ${book.copiesAvailable} cuốn`
                  : 'Hết sách'
              }
            />
          </View>
        ))}
      </View>
    </AppScrollScreen>
  );
}

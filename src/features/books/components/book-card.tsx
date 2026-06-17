import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { StatusChip } from '@/components/ui/status-chip';
import type { Book } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

import { BookCover } from './book-cover';

type BookCardProps = {
  book: Book;
  coverHeight?: number;
  coverWidth?: number;
  layout?: 'vertical' | 'horizontal';
  statusLabel?: string;
};

export function BookCard({
  book,
  coverHeight,
  coverWidth,
  layout = 'vertical',
  statusLabel,
}: BookCardProps) {
  const responsive = useResponsiveLayout();
  const vertical = layout === 'vertical';
  const titleSlotHeight = vertical ? Math.round(24 * responsive.typeScale) * 2 : undefined;
  const authorSlotHeight = vertical ? Math.round(24 * responsive.typeScale) : undefined;
  const textBlockMinHeight = vertical
    ? (titleSlotHeight ?? 0) + (authorSlotHeight ?? 0) + 6
    : undefined;
  const metaBlockMinHeight = vertical
    ? textBlockMinHeight
      ? textBlockMinHeight + (statusLabel ? 52 : 0) + theme.spacing.sm
      : undefined
    : undefined;
  const resolvedCoverWidth = coverWidth
    ?? (vertical ? responsive.gridItemWidth : responsive.bookRowCoverWidth);
  const resolvedCoverHeight = coverHeight
    ?? (vertical
      ? Math.round(resolvedCoverWidth * 1.39)
      : responsive.bookRowCoverHeight);

  return (
    <Link href={{ pathname: '/books/[id]', params: { id: book.id } }} asChild>
      <Pressable>
        {({ pressed }) => (
          <View
            style={{
              flexDirection: vertical ? 'column' : 'row',
              gap: theme.spacing.md,
              minHeight: vertical ? resolvedCoverHeight + (metaBlockMinHeight ?? 0) : undefined,
              borderRadius: theme.radius.lg,
              borderCurve: 'continuous',
              backgroundColor: theme.colors.surface,
              padding: vertical ? 0 : theme.spacing.md,
              opacity: pressed ? 0.84 : 1,
            }}
          >
            <BookCover
              uri={book.coverUrl}
              width={resolvedCoverWidth}
              height={resolvedCoverHeight}
              radius={vertical ? theme.radius.md : 16}
            />
            <View
              style={{
                flex: 1,
                gap: 6,
                minHeight: metaBlockMinHeight,
                justifyContent: vertical ? 'space-between' : 'flex-start',
                paddingLeft: theme.spacing.md - 6,
              }}
            >
              <View style={{ gap: 6, minHeight: textBlockMinHeight}}>
                <View style={{ minHeight: titleSlotHeight, maxHeight: titleSlotHeight }}>
                  <AppText
                    variant={vertical ? 'bodyStrong' : 'title'}
                    numberOfLines={vertical ? 2 : 3}
                    ellipsizeMode="tail"
                    style={{ fontFamily: vertical ? theme.fonts.sansSemiBold : theme.fonts.sansBold }}
                  >
                    {book.title}
                  </AppText>
                </View>
                <View style={{ minHeight: authorSlotHeight, justifyContent: 'flex-start' }}>
                  <AppText tone="muted" numberOfLines={1} ellipsizeMode="tail">
                    {book.author}
                  </AppText>
                </View>
              </View>
              {statusLabel ? <StatusChip label={statusLabel} tone="success" /> : null}
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

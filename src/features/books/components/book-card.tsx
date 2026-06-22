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
  const resolvedCoverWidth = coverWidth ?? (vertical ? responsive.gridItemWidth : responsive.bookRowCoverWidth);
  const resolvedCoverHeight = coverHeight ?? (vertical ? Math.round(resolvedCoverWidth * 1.39) : responsive.bookRowCoverHeight);

  return (
    <Link href={{ pathname: '/books/[id]', params: { id: book.id } }} asChild>
      <Pressable>
        {({ pressed }) => (
          <View
            style={{
              flexDirection: vertical ? 'column' : 'row',
              width: vertical ? resolvedCoverWidth : '100%',
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              borderCurve: 'continuous',
              overflow: 'hidden',
              boxShadow: pressed ? theme.shadow.soft : '0px 8px 24px rgba(18, 25, 20, 0.08)',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.03)',
              transform: [{ scale: pressed ? 0.97 : 1 }],
              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <View style={{ position: 'relative' }}>
              <BookCover
                uri={book.coverUrl}
                width={vertical ? '100%' : resolvedCoverWidth}
                height={resolvedCoverHeight}
                radius={0}
              />
              
              {/* Overlay Status Chip */}
              {statusLabel && vertical && (
                <View style={{ position: 'absolute', top: 8, right: 8 }}>
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <AppText variant="label" style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '700' }}>
                      {statusLabel}
                    </AppText>
                  </View>
                </View>
              )}
            </View>

            <View
              style={{
                flex: 1,
                padding: 12,
                justifyContent: 'space-between',
              }}
            >
              <View style={{ gap: 4 }}>
                <AppText
                  variant="bodyStrong"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{
                    fontFamily: theme.fonts.sansSemiBold,
                    fontSize: 15,
                    lineHeight: 20,
                    color: theme.colors.text,
                  }}
                >
                  {book.title}
                </AppText>
                
                <AppText 
                  tone="muted" 
                  numberOfLines={1} 
                  ellipsizeMode="tail"
                  style={{ fontSize: 13 }}
                >
                  {book.author}
                </AppText>
              </View>

              {/* Horizontal Layout specific Status Chip */}
              {statusLabel && !vertical && (
                <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                  <StatusChip label={statusLabel} tone="success" />
                </View>
              )}
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

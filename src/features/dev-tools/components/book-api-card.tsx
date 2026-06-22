import { StyleSheet, View, Image } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { StatusChip } from '@/components/ui/status-chip';
import { theme } from '@/theme/theme';

export interface BookApiItem {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  coverUrl: string;
  categories: string[];
}

interface Props {
  book: BookApiItem;
}

export function BookApiCard({ book }: Props) {
  return (
    <View style={styles.card}>
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.cover} resizeMode="cover" />
      ) : (
        <View style={styles.placeholderCover} />
      )}
      <View style={styles.content}>
        <AppText variant="bodyStrong" style={styles.title} numberOfLines={2}>
          {book.title}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {book.author}
        </AppText>
        <AppText variant="label" tone="muted" numberOfLines={1}>
          {book.publisher} • {book.year > 0 ? book.year : 'N/A'}
        </AppText>
        <AppText variant="label" tone="muted" style={styles.isbn}>
          ISBN: {book.isbn}
        </AppText>

        {book.categories && book.categories.length > 0 && (
          <View style={styles.categories}>
            {book.categories.slice(0, 3).map((cat, idx) => (
              <StatusChip key={idx} label={cat} tone="neutral" />
            ))}
            {book.categories.length > 3 && (
              <StatusChip label={`+${book.categories.length - 3}`} tone="neutral" />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    boxShadow: theme.shadow.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cover: {
    width: 70,
    height: 100,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  },
  placeholderCover: {
    width: 70,
    height: 100,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  isbn: {
    marginTop: 2,
    fontFamily: theme.fonts.mono,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
    gap: 4,
  },
});

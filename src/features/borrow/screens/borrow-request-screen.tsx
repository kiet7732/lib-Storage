import { type Href, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { StatusChip } from '@/components/ui/status-chip';
import { BookCover } from '@/features/books/components/book-cover';
import { borrowedItems, getBookById, getBorrowedBook } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

type RequestIntent = 'borrow' | 'renew';

type SheetCopy = {
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  badgeTone: 'success' | 'warning' | 'neutral';
  badgeIcon: 'check-circle' | 'clock' | 'calendar';
  rows: Array<{ label: string; value: string }>;
  noteTitle: string;
  noteBody: string;
  noteBackground: string;
  noteIcon: 'info' | 'warning' | 'calendar';
  actionLabel: string;
  actionIcon: 'library' | 'calendar';
};

export function BorrowRequestScreen() {
  const layout = useResponsiveLayout();
  const params = useLocalSearchParams<{
    bookId?: string | string[];
    borrowId?: string | string[];
    intent?: string | string[];
    returnTo?: string | string[];
  }>();
  const bookId = readParam(params.bookId);
  const borrowId = readParam(params.borrowId);
  const intent = resolveIntent(readParam(params.intent));
  const returnTo = readParam(params.returnTo);
  const book = bookId ? getBookById(bookId) : undefined;
  const borrowedItem =
    intent === 'renew'
      ? (borrowId ? borrowedItems.find((item) => item.id === borrowId) : undefined) ??
        (bookId ? getBorrowedBook(bookId) : undefined)
      : undefined;

  const handleCloseSheet = () => {
    if (returnTo) {
      router.replace(returnTo as Href);
      return;
    }

    router.back();
  };

  if (!book) {
    return <MissingBookSheet onClose={handleCloseSheet} />;
  }

  const coverWidth = layout.isCompact ? 74 : 84;
  const coverHeight = Math.round(coverWidth * 1.42);
  const compactSectionGap = layout.isCompact ? theme.spacing.md : 18;
  const compactSurfacePadding = layout.isCompact ? theme.spacing.sm : theme.spacing.md;
  const nextDueDate = addDaysToDateLabel(borrowedItem?.dueDate, 7) ?? '29/10/2026';
  const sheetCopy: SheetCopy =
    intent === 'renew'
      ? {
          eyebrow: 'YÊU CẦU GIA HẠN',
          title: 'Gia hạn thêm 7 ngày',
          description:
            'Hệ thống sẽ kiểm tra lượt đặt trước trước khi xác nhận gia hạn cho cuốn sách này.',
          badge: borrowedItem?.note ?? 'Không phát sinh phí',
          badgeTone: borrowedItem?.note ? 'warning' : 'success',
          badgeIcon: borrowedItem?.note ? 'clock' : 'check-circle',
          rows: [
            { label: 'Hạn hiện tại', value: borrowedItem?.dueDate ?? '22/10/2026' },
            { label: 'Hạn mới dự kiến', value: nextDueDate },
            { label: 'Trạng thái xử lý', value: 'Tự động xác nhận nếu không có người chờ' },
          ],
          noteTitle: 'ĐIỀU KIỆN GIA HẠN',
          noteBody:
            'Mỗi đầu sách chỉ được gia hạn một lần và bạn cần gửi yêu cầu trước khi sách quá hạn.',
          noteBackground: theme.colors.surfaceTint,
          noteIcon: 'calendar',
          actionLabel: 'Gửi yêu cầu gia hạn',
          actionIcon: 'calendar',
        }
      : {
          eyebrow: 'YÊU CẦU MƯỢN SÁCH',
          title: 'Xác nhận đặt mượn',
          description:
            'Sách sẽ được giữ tại quầy trong 24 giờ kể từ lúc bạn gửi yêu cầu thành công.',
          badge: 'Có thể gia hạn 1 lần',
          badgeTone: 'success',
          badgeIcon: 'check-circle',
          rows: [
            { label: 'Nhận sách tại', value: 'Quầy số 2 - Thư viện trung tâm' },
            { label: 'Khung giờ nhận', value: 'Hôm nay, 14:00 - 17:00' },
            { label: 'Hạn trả tạm tính', value: '03/11/2026' },
          ],
          noteTitle: 'LƯU Ý KHI NHẬN SÁCH',
          noteBody:
            'Bạn cần đến quầy trong vòng 24 giờ. Sau thời gian này, yêu cầu sẽ tự động bị hủy.',
          noteBackground: '#fff4ea',
          noteIcon: 'warning',
          actionLabel: 'Gửi yêu cầu mượn',
          actionIcon: 'library',
        };

  return (
    <AppBottomSheet
      initialSnapIndex={1}
      minHeight={layout.isCompact ? 430 : 480}
      onClose={handleCloseSheet}
      snapPoints={layout.isCompact ? [0.94, 0.8, 0.66] : [0.92, 0.78, 0.62]}
      footer={
        <>
          <AppButton
            label={sheetCopy.actionLabel}
            iconName={sheetCopy.actionIcon}
            onPress={handleCloseSheet}
          />

          <Pressable onPress={handleCloseSheet}>
            {({ pressed }) => (
              <View style={{ alignItems: 'center', paddingVertical: 6, opacity: pressed ? 0.68 : 1 }}>
                <AppText variant="bodyStrong" tone="muted">
                  Để sau
                </AppText>
              </View>
            )}
          </Pressable>
        </>
      }
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.md,
          gap: compactSectionGap,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="label" tone="primary">
              {sheetCopy.eyebrow}
            </AppText>
            <AppText variant="headline">{sheetCopy.title}</AppText>
            <AppText tone="muted" numberOfLines={2}>
              {sheetCopy.description}
            </AppText>
          </View>

          <Pressable accessibilityLabel="Đóng" onPress={handleCloseSheet}>
            {({ pressed }) => (
              <View
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.radius.pill,
                  borderCurve: 'continuous',
                  backgroundColor: theme.colors.surfaceMuted,
                  opacity: pressed ? 0.72 : 1,
                }}
              >
                <AppIcon name="close" size={18} color={theme.colors.muted} />
              </View>
            )}
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: theme.spacing.md,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surfaceMuted,
            padding: compactSurfacePadding,
          }}
        >
          <BookCover uri={book.coverUrl} width={coverWidth} height={coverHeight} radius={16} />

          <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
            <StatusChip
              label={sheetCopy.badge}
              tone={sheetCopy.badgeTone}
              iconName={sheetCopy.badgeIcon}
            />
            <AppText
              variant="bodyStrong"
              numberOfLines={2}
              style={{ fontFamily: theme.fonts.sansBold }}
            >
              {book.title}
            </AppText>
            <AppText tone="muted" numberOfLines={1}>
              {book.author}
            </AppText>
          </View>
        </View>

        <View
          style={{
            gap: theme.spacing.md,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.background,
            padding: compactSurfacePadding,
            boxShadow: theme.shadow.soft,
          }}
        >
          {sheetCopy.rows.map((row) => (
            <Row key={row.label} label={row.label} value={row.value} />
          ))}
        </View>

        <View
          style={{
            gap: 8,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: sheetCopy.noteBackground,
            padding: compactSurfacePadding,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppIcon name={sheetCopy.noteIcon} size={18} color={theme.colors.primary} />
            <AppText variant="label" tone="muted">
              {sheetCopy.noteTitle}
            </AppText>
          </View>
          <AppText tone="muted" numberOfLines={3}>
            {sheetCopy.noteBody}
          </AppText>
        </View>
      </ScrollView>
    </AppBottomSheet>
  );
}

function MissingBookSheet({ onClose }: { onClose: () => void }) {
  return (
    <AppBottomSheet
      initialSnapIndex={2}
      minHeight={360}
      onClose={onClose}
      snapPoints={[0.72, 0.56, 0.42]}
      footer={<AppButton label="Đóng" iconName="close" onPress={onClose} />}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <View
          style={{
            width: 76,
            height: 76,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius.pill,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surfaceMuted,
          }}
        >
          <AppIcon name="library" size={30} color={theme.colors.primary} />
        </View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <AppText variant="headline" style={{ textAlign: 'center' }}>
            Không tìm thấy sách
          </AppText>
          <AppText tone="muted" style={{ textAlign: 'center' }}>
            Hãy quay lại danh sách và chọn lại đầu sách để tiếp tục thao tác.
          </AppText>
        </View>
      </View>
    </AppBottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveIntent(value?: string): RequestIntent {
  return value === 'renew' ? 'renew' : 'borrow';
}

function addDaysToDateLabel(value: string | undefined, days: number) {
  if (!value) {
    return undefined;
  }

  const [day, month, year] = value.split('/').map(Number);

  if (!day || !month || !year) {
    return undefined;
  }

  const nextDate = new Date(year, month - 1, day);
  nextDate.setDate(nextDate.getDate() + days);

  const formattedDay = String(nextDate.getDate()).padStart(2, '0');
  const formattedMonth = String(nextDate.getMonth() + 1).padStart(2, '0');

  return `${formattedDay}/${formattedMonth}/${nextDate.getFullYear()}`;
}

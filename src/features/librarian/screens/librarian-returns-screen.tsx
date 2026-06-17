import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { FilterSegmented } from '@/components/ui/filter-segmented';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { BookCover } from '@/features/books/components/book-cover';
import { librarianReturnItems, type LibrarianReturnItem } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic, successHaptic } from '@/utils/haptics';

import { LibrarianActionSheet } from '../components/librarian-action-sheet';
import { LibrarianEmptyState } from '../components/librarian-empty-state';
import { LibrarianFeedbackBanner } from '../components/librarian-feedback-banner';
import { LibrarianScreenShell } from '../components/librarian-screen-shell';

type ReturnQueueItem = LibrarianReturnItem & {
  reminderSent?: boolean;
  fineCollected?: boolean;
  returned?: boolean;
};

type Notice = {
  title: string;
  description: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
};

const initialReturnItems: ReturnQueueItem[] = librarianReturnItems.map((item) => ({ ...item }));

export function LibrarianReturnsScreen() {
  const layout = useResponsiveLayout();
  const stackActions = layout.contentWidth < 400;
  const coverWidth = layout.width < 460 ? 74 : 84;
  const coverHeight = Math.round(coverWidth * 1.42);

  const [activeBucket, setActiveBucket] = useState<'overdue' | 'dueToday'>('overdue');
  const [items, setItems] = useState<ReturnQueueItem[]>(initialReturnItems);
  const [selectedItem, setSelectedItem] = useState<ReturnQueueItem | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const visibleItems = useMemo(
    () => items.filter((item) => item.bucket === activeBucket && !item.returned),
    [activeBucket, items],
  );

  const totalFine = useMemo(
    () =>
      items
        .filter((item) => !item.returned)
        .reduce((sum, item) => sum + item.fineAmountValue, 0),
    [items],
  );

  const overdueCount = items.filter((item) => item.bucket === 'overdue' && !item.returned).length;
  const dueTodayCount = items.filter((item) => item.bucket === 'dueToday' && !item.returned).length;

  const handleReminder = async (item: ReturnQueueItem) => {
    await successHaptic();
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, reminderSent: true } : entry,
      ),
    );
    setNotice({
      title: `Đã nhắc ${item.studentName}`,
      description: 'Thông báo hạn trả đã được gửi vào luồng demo.',
      tone: 'info',
    });
  };

  const handleCollectFine = async (item: ReturnQueueItem) => {
    await successHaptic();

    if (item.fineAmountValue === 0) {
      setNotice({
        title: 'Không có khoản phạt cần thu',
        description: 'Phiếu này chỉ cần xác nhận trả đúng hạn.',
        tone: 'warning',
      });
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, fineCollected: true } : entry,
      ),
    );
    setNotice({
      title: `Đã thu ${item.fineAmount}`,
      description: `Khoản phạt của ${item.studentName} đã được đánh dấu là hoàn tất.`,
      tone: 'success',
    });
  };

  const handleConfirmReturn = async (item: ReturnQueueItem) => {
    await successHaptic();
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, returned: true } : entry,
      ),
    );
    setNotice({
      title: 'Đã xác nhận trả sách',
      description: `${item.studentName} đã hoàn tất thủ tục trả cho phiếu đang chọn.`,
      tone: 'success',
    });
    setSelectedItem(null);
  };

  return (
    <LibrarianScreenShell
      title="Trả sách"
      subtitle="Theo dõi phiếu quá hạn, nhắc lịch và xác nhận hoàn trả trực tiếp."
    >
      {notice ? (
        <LibrarianFeedbackBanner
          title={notice.title}
          description={notice.description}
          tone={notice.tone}
          onClose={() => setNotice(null)}
        />
      ) : null}

      <View
        style={{
          borderRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.lg,
          boxShadow: theme.shadow.card,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <AppText variant="label" tone="muted">
            TỔNG TIỀN PHẠT CHỜ THU
          </AppText>
          <AppText variant="display" tone="danger">
            {formatCurrency(totalFine)}
          </AppText>
          <AppText variant="caption" tone="muted">
            Dữ liệu lấy trực tiếp từ các phiếu mượn đang còn hiệu lực của hệ demo.
          </AppText>
        </View>

        <View
          style={{
            width: layout.width < 460 ? 64 : 70,
            height: layout.width < 460 ? 64 : 70,
            borderRadius: theme.radius.pill,
            backgroundColor: '#ffe3e0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name="money" size={28} color={theme.colors.danger} />
        </View>
      </View>

      <FilterSegmented
        items={[`Quá hạn (${overdueCount})`, `Đến hạn hôm nay (${dueTodayCount})`]}
        activeItem={
          activeBucket === 'overdue'
            ? `Quá hạn (${overdueCount})`
            : `Đến hạn hôm nay (${dueTodayCount})`
        }
        onChange={(value) => setActiveBucket(value.startsWith('Quá hạn') ? 'overdue' : 'dueToday')}
      />

      {visibleItems.length === 0 ? (
        <LibrarianEmptyState
          icon="check-circle"
          title="Không còn phiếu trong nhóm này"
          description="Mọi đầu việc ở nhóm hiện tại đã được hoàn tất hoặc chuyển trạng thái."
        />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {visibleItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={async () => {
                await selectionHaptic();
                setSelectedItem(item);
              }}
            >
              {({ pressed }) => (
                <View
                  style={{
                    borderRadius: theme.radius.lg,
                    borderCurve: 'continuous',
                    backgroundColor: theme.colors.surface,
                    padding: theme.spacing.md,
                    boxShadow: theme.shadow.card,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      item.bucket === 'overdue' ? theme.colors.danger : theme.colors.accent,
                    gap: theme.spacing.md,
                    opacity: pressed ? 0.84 : 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: layout.width < 460 ? 'column' : 'row',
                      justifyContent: 'space-between',
                      gap: theme.spacing.md,
                    }}
                  >
                    <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
                      <AppText variant="headline" numberOfLines={1}>
                        {item.studentName}
                      </AppText>
                      <AppText tone="muted" numberOfLines={2}>
                        SV: {item.studentId} • {item.residence}
                      </AppText>
                    </View>

                    <View
                      style={{
                        alignSelf: 'flex-start',
                        borderRadius: theme.radius.pill,
                        backgroundColor: item.bucket === 'overdue' ? '#ffd9d7' : '#ffe7d0',
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                      }}
                    >
                      <AppText
                        variant="label"
                        style={{
                          color: item.bucket === 'overdue' ? theme.colors.danger : '#8b4b08',
                        }}
                      >
                        {item.statusLabel}
                      </AppText>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: theme.spacing.md,
                      borderRadius: theme.radius.md,
                      borderCurve: 'continuous',
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                      padding: theme.spacing.sm,
                    }}
                  >
                    <BookCover
                      uri={item.coverUrl}
                      width={coverWidth}
                      height={coverHeight}
                      radius={14}
                    />

                    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                      <AppText variant="title" numberOfLines={2}>
                        {item.bookTitle}
                      </AppText>
                      <AppText tone="muted" numberOfLines={1}>
                        {item.bookAuthor}
                      </AppText>
                      <AppText tone="muted">Hạn trả: {item.dueDate}</AppText>
                      <AppText
                        variant="bodyStrong"
                        tone={item.fineAmountValue > 0 ? 'danger' : 'primary'}
                      >
                        Phạt: {item.fineAmount}
                      </AppText>
                    </View>
                  </View>

                  {item.reminderSent || item.fineCollected ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                      {item.reminderSent ? <StateChip label="Đã gửi nhắc nhở" tone="info" /> : null}
                      {item.fineCollected ? <StateChip label="Đã thu tiền phạt" tone="success" /> : null}
                    </View>
                  ) : null}

                  <View
                    style={{
                      flexDirection: stackActions ? 'column' : 'row',
                      gap: theme.spacing.sm,
                    }}
                  >
                    <ActionButton
                      label="Gửi nhắc nhở"
                      icon="bell"
                      variant="ghost"
                      onPress={() => handleReminder(item)}
                    />
                    <ActionButton
                      label="Thu tiền phạt"
                      icon="money"
                      variant="danger"
                      onPress={() => handleCollectFine(item)}
                    />
                    <ActionButton
                      label="Xác nhận trả"
                      icon="check-circle"
                      variant="primary"
                      onPress={() => handleConfirmReturn(item)}
                    />
                  </View>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}

      <LibrarianActionSheet
        visible={Boolean(selectedItem)}
        title={selectedItem?.studentName ?? 'Chi tiết phiếu trả'}
        subtitle={selectedItem ? `Hạn trả ${selectedItem.dueDate}` : undefined}
        onClose={() => setSelectedItem(null)}
        initialSnapIndex={1}
        minHeight={440}
        snapPoints={[0.9, 0.76, 0.62]}
        footer={<AppButton label="Đóng" variant="secondary" onPress={() => setSelectedItem(null)} />}
      >
        {selectedItem ? (
          <>
            <SheetRow label="Mã sinh viên" value={selectedItem.studentId} />
            <SheetRow label="Ngành" value={selectedItem.studentProgram} />
            <SheetRow label="Nơi ở" value={selectedItem.residence} />
            <SheetRow
              label="Nhóm xử lý"
              value={selectedItem.bucket === 'overdue' ? 'Quá hạn' : 'Đến hạn hôm nay'}
            />
            <SheetRow label="Mã bản sao" value={selectedItem.copyCode} />
            <SheetRow label="Tiền phạt" value={selectedItem.fineAmount} />
            <SheetRow
              label="Trạng thái phụ"
              value={
                [
                  selectedItem.reminderSent ? 'Đã gửi nhắc nhở' : null,
                  selectedItem.fineCollected ? 'Đã thu phạt' : null,
                ]
                  .filter(Boolean)
                  .join(' • ') || 'Chưa có thao tác phụ'
              }
            />
          </>
        ) : null}
      </LibrarianActionSheet>
    </LibrarianScreenShell>
  );
}

function StateChip({
  label,
  tone,
}: {
  label: string;
  tone: 'success' | 'info';
}) {
  const colors = {
    success: { background: '#e8f7ef', text: theme.colors.primary },
    info: { background: theme.colors.infoSoft, text: theme.colors.primary },
  }[tone];

  return (
    <View
      style={{
        borderRadius: theme.radius.pill,
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <AppText variant="label" style={{ color: colors.text }}>
        {label}
      </AppText>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  variant,
  onPress,
}: {
  label: string;
  icon: 'bell' | 'money' | 'check-circle';
  variant: 'ghost' | 'danger' | 'primary';
  onPress: () => void;
}) {
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            minHeight: 72,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: theme.radius.md,
            borderCurve: 'continuous',
            borderWidth: variant === 'ghost' ? 1 : 0,
            borderColor: variant === 'ghost' ? theme.colors.border : 'transparent',
            backgroundColor:
              variant === 'primary'
                ? theme.colors.primary
                : variant === 'danger'
                  ? theme.colors.danger
                  : theme.colors.surface,
            paddingHorizontal: theme.spacing.sm,
            opacity: pressed ? 0.84 : 1,
          }}
        >
          <AppIcon
            name={icon}
            size={18}
            color={variant === 'ghost' ? theme.colors.text : theme.colors.white}
          />
          <AppText
            variant="bodyStrong"
            tone={variant === 'ghost' ? 'text' : 'white'}
            numberOfLines={2}
            style={{ textAlign: 'center' }}
          >
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

function SheetRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

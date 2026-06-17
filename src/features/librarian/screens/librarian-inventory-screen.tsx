import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { FilterSegmented } from '@/components/ui/filter-segmented';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { BookCover } from '@/features/books/components/book-cover';
import {
  librarianInventoryItems,
  type InventoryStatus,
  type LibrarianInventoryItem,
} from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic, successHaptic } from '@/utils/haptics';

import { LibrarianActionSheet } from '../components/librarian-action-sheet';
import { LibrarianEmptyState } from '../components/librarian-empty-state';
import { LibrarianFeedbackBanner } from '../components/librarian-feedback-banner';
import { LibrarianScreenShell } from '../components/librarian-screen-shell';
import { LibrarianSearchField } from '../components/librarian-search-field';

type InventoryFilter = 'all' | InventoryStatus;

type Notice = {
  title: string;
  description: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
};

const filterOptions: Array<{ key: InventoryFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Sẵn sàng' },
  { key: 'borrowed', label: 'Đang mượn' },
  { key: 'damaged', label: 'Báo hỏng' },
];

export function LibrarianInventoryScreen() {
  const layout = useResponsiveLayout();
  const compactActions = layout.contentWidth < 390;
  const coverWidth = layout.width < 460 ? 82 : 74;
  const coverHeight = Math.round(coverWidth * 1.42);

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<InventoryFilter>('all');
  const [items, setItems] = useState<LibrarianInventoryItem[]>(librarianInventoryItems);
  const [selectedItem, setSelectedItem] = useState<LibrarianInventoryItem | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      if (activeFilter !== 'all' && item.status !== activeFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [item.copyCode, item.shelfCode, item.bookTitle, item.bookAuthor, item.branchName].some(
        (value) => value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [activeFilter, items, query]);

  const handleMoveShelf = async (item: LibrarianInventoryItem) => {
    await successHaptic();
    const nextShelfCode = getNextShelfCode(item.shelfCode);

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, shelfCode: nextShelfCode } : entry,
      ),
    );
    setNotice({
      title: `Đã chuyển kệ cho ${item.copyCode}`,
      description: `Bản sao đã được cập nhật sang vị trí ${nextShelfCode}.`,
      tone: 'info',
    });
  };

  const handleFlagDamaged = async (item: LibrarianInventoryItem) => {
    await successHaptic();

    if (item.status === 'damaged') {
      setNotice({
        title: `${item.copyCode} đã nằm trong danh sách bảo trì`,
        description: 'Bạn có thể mở chi tiết để xem lại tình trạng bản sao.',
        tone: 'warning',
      });
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              status: 'damaged',
              statusLabel: 'Báo hỏng',
              statusTone: 'danger',
            }
          : entry,
      ),
    );
    setNotice({
      title: `Đã gắn cờ hỏng cho ${item.copyCode}`,
      description: 'Bản sao đã được chuyển sang nhóm cần kiểm tra.',
      tone: 'danger',
    });
  };

  return (
    <LibrarianScreenShell
      title="Kho sách"
      subtitle="Tra cứu bản sao, đổi vị trí kệ và đánh dấu tình trạng ngay trong luồng demo."
    >
      {notice ? (
        <LibrarianFeedbackBanner
          title={notice.title}
          description={notice.description}
          tone={notice.tone}
          onClose={() => setNotice(null)}
        />
      ) : null}

      <View style={{ gap: theme.spacing.sm }}>
        <LibrarianSearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm tựa sách, tác giả, mã bản sao..."
          actionIcon={query ? 'close' : 'tune'}
          onActionPress={() => {
            if (query) {
              setQuery('');
            }
          }}
        />

        <FilterSegmented
          items={filterOptions.map((option) => option.label)}
          activeItem={filterOptions.find((option) => option.key === activeFilter)?.label ?? 'Tất cả'}
          onChange={(value) =>
            setActiveFilter(
              filterOptions.find((option) => option.label === value)?.key ?? 'all',
            )
          }
        />
      </View>

      <View
        style={{
          flexDirection: layout.width < 460 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: layout.width < 460 ? 'flex-start' : 'center',
          gap: theme.spacing.sm,
        }}
      >
        <AppText variant="headline">Kết quả ({visibleItems.length})</AppText>
        <AppText tone="muted">Đồng bộ từ dữ liệu bản sao và trạng thái phiếu mượn</AppText>
      </View>

      {visibleItems.length === 0 ? (
        <LibrarianEmptyState
          icon="inventory"
          title="Không tìm thấy bản sao"
          description="Thử đổi từ khóa hoặc chuyển sang nhóm trạng thái khác."
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
                    borderWidth: item.status === 'damaged' ? 1 : 0,
                    borderColor: item.status === 'damaged' ? '#f1c4bf' : 'transparent',
                    gap: theme.spacing.md,
                    opacity: pressed ? 0.84 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                    <BookCover
                      uri={item.coverUrl}
                      width={coverWidth}
                      height={coverHeight}
                      radius={14}
                    />

                    <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
                      <View style={{ gap: 4 }}>
                        <AppText variant="title" numberOfLines={2}>
                          {item.bookTitle}
                        </AppText>
                        <AppText tone="muted" numberOfLines={1}>
                          {item.bookAuthor}
                        </AppText>
                      </View>

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                        <StatusPill label={item.statusLabel} tone={item.statusTone} />
                        <MetaPill icon="barcode" label={item.copyCode} />
                        <MetaPill icon="library" label={item.shelfCode} />
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: compactActions ? 'column' : 'row',
                      gap: theme.spacing.sm,
                      paddingTop: theme.spacing.sm,
                      borderTopWidth: 1,
                      borderTopColor: theme.colors.surfaceMuted,
                    }}
                  >
                    <InventoryAction label="Cập nhật" onPress={() => setSelectedItem(item)} />
                    <InventoryAction label="Chuyển kệ" onPress={() => handleMoveShelf(item)} />
                    <InventoryAction
                      icon="warning"
                      danger
                      onPress={() => handleFlagDamaged(item)}
                    />
                  </View>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={async () => {
          await selectionHaptic();
          setShowCreateSheet(true);
        }}
        style={{
          position: 'absolute',
          right: layout.horizontalPadding,
          bottom: Math.max(layout.insets.bottom + 88, 108),
        }}
      >
        {({ pressed }) => (
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: theme.radius.lg,
              borderCurve: 'continuous',
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadow.floating,
              opacity: pressed ? 0.82 : 1,
            }}
          >
            <AppIcon name="add" size={26} color={theme.colors.white} strokeWidth={2.4} />
          </View>
        )}
      </Pressable>

      <LibrarianActionSheet
        visible={Boolean(selectedItem)}
        title={selectedItem?.copyCode ?? 'Chi tiết bản sao'}
        subtitle={selectedItem ? `Vị trí ${selectedItem.shelfCode}` : undefined}
        onClose={() => setSelectedItem(null)}
        initialSnapIndex={1}
        minHeight={420}
        snapPoints={[0.86, 0.72, 0.56]}
        footer={<AppButton label="Đóng" variant="secondary" onPress={() => setSelectedItem(null)} />}
      >
        {selectedItem ? (
          <>
            <SheetRow label="Tựa sách" value={selectedItem.bookTitle} />
            <SheetRow label="Tác giả" value={selectedItem.bookAuthor} />
            <SheetRow label="Chi nhánh" value={selectedItem.branchName} />
            <SheetRow label="Mã bản sao" value={selectedItem.copyCode} />
            <SheetRow label="Trạng thái" value={selectedItem.statusLabel} />
            <SheetRow label="Sẵn sàng / tổng số" value={`${selectedItem.availableCopies}/${selectedItem.totalCopies}`} />
          </>
        ) : null}
      </LibrarianActionSheet>

      <LibrarianActionSheet
        visible={showCreateSheet}
        title="Thêm bản sao mới"
        subtitle="Luồng demo để mô phỏng thao tác thêm inventory item."
        onClose={() => setShowCreateSheet(false)}
        initialSnapIndex={2}
        minHeight={360}
        snapPoints={[0.72, 0.56, 0.42]}
        footer={
          <AppButton
            label="Tạo bản sao demo"
            onPress={async () => {
              await successHaptic();
              setShowCreateSheet(false);
              setNotice({
                title: 'Đã tạo bản sao mới',
                description: 'Luồng demo đã ghi nhận thao tác thêm bản sao vào kho.',
                tone: 'success',
              });
            }}
          />
        }
      >
        <SheetRow label="Mẫu được chọn" value="Bản sao tiêu chuẩn cho kho học thuật" />
        <SheetRow label="Chi nhánh" value="Thư viện Trung tâm" />
        <SheetRow label="Trạng thái khởi tạo" value="Sẵn sàng" />
      </LibrarianActionSheet>
    </LibrarianScreenShell>
  );
}

function MetaPill({ icon, label }: { icon: 'barcode' | 'library'; label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.surfaceMuted,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <AppIcon name={icon} size={14} color={theme.colors.muted} />
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </View>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'success' | 'warning' | 'danger';
}) {
  const colors = {
    success: { background: '#c8f2df', text: theme.colors.primary },
    warning: { background: '#ffd9b8', text: '#7a4200' },
    danger: { background: '#ffd9d7', text: theme.colors.danger },
  }[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: theme.radius.pill,
        backgroundColor: colors.background,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <AppText variant="label" style={{ color: colors.text }}>
        {label}
      </AppText>
    </View>
  );
}

function InventoryAction({
  label,
  icon,
  danger,
  onPress,
}: {
  label?: string;
  icon?: 'warning';
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={{ flex: icon ? undefined : 1 }} onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            minWidth: icon ? 68 : undefined,
            minHeight: 54,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius.md,
            borderCurve: 'continuous',
            backgroundColor: danger ? '#ffe3e0' : theme.colors.surfaceMuted,
            paddingHorizontal: theme.spacing.sm,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          {icon ? (
            <AppIcon name={icon} color={theme.colors.danger} />
          ) : (
            <AppText variant="bodyStrong">{label}</AppText>
          )}
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

function getNextShelfCode(currentShelf: string) {
  const nextMap: Record<string, string> = {
    'Kệ A3-02': 'Kệ A3-03',
    'Kệ C1-05': 'Kệ C2-01',
    'Kệ B2-12': 'Kệ B1-07',
  };

  return nextMap[currentShelf] ?? 'Kệ A1-01';
}

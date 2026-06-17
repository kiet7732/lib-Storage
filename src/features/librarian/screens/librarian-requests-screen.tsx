import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { FilterSegmented } from '@/components/ui/filter-segmented';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { librarianProfile, librarianRequests, type LibrarianRequest } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic, successHaptic } from '@/utils/haptics';

import { LibrarianActionSheet } from '../components/librarian-action-sheet';
import { LibrarianEmptyState } from '../components/librarian-empty-state';
import { LibrarianFeedbackBanner } from '../components/librarian-feedback-banner';
import { LibrarianScreenShell } from '../components/librarian-screen-shell';
import { LibrarianSearchField } from '../components/librarian-search-field';

type Notice = {
  title: string;
  description: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
};

export function LibrarianRequestsScreen() {
  const layout = useResponsiveLayout();
  const stackActions = layout.contentWidth < 390;
  const compactAssignee = layout.width < 460;

  const [activeKind, setActiveKind] = useState<'borrow' | 'renew'>('borrow');
  const [query, setQuery] = useState('');
  const [requestItems, setRequestItems] = useState<LibrarianRequest[]>(librarianRequests);
  const [selectedRequest, setSelectedRequest] = useState<LibrarianRequest | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const requests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requestItems.filter((request) => {
      if (request.kind !== activeKind) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        request.taskCode,
        request.bookTitle,
        request.studentName,
        request.studentId,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [activeKind, query, requestItems]);

  const queueCounts = useMemo(
    () => ({
      borrow: requestItems.filter((item) => item.kind === 'borrow').length,
      renew: requestItems.filter((item) => item.kind === 'renew').length,
      pending: requestItems.filter((item) => item.status === 'pending').length,
      processing: requestItems.filter((item) => item.status === 'processing').length,
      staging: requestItems.filter((item) => item.status === 'staging').length,
    }),
    [requestItems],
  );

  const handleApprove = async (request: LibrarianRequest) => {
    await successHaptic();

    if (request.status === 'pending') {
      setRequestItems((current) =>
        current.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status: 'processing',
                statusLabel: 'Đang xử lý',
                accent: '#003527',
              }
            : item,
        ),
      );
      setNotice({
        title: `Đã duyệt ${request.taskCode}`,
        description: 'Yêu cầu đã được chuyển sang trạng thái đang xử lý.',
        tone: 'success',
      });
      return;
    }

    if (request.status === 'processing') {
      setRequestItems((current) => current.filter((item) => item.id !== request.id));
      setNotice({
        title: `Đã hoàn tất ${request.taskCode}`,
        description: 'Phiếu yêu cầu đã được xử lý xong và rời khỏi hộp thư.',
        tone: 'success',
      });
      return;
    }

    setRequestItems((current) => current.filter((item) => item.id !== request.id));
    setNotice({
      title: `Đã xếp kệ ${request.taskCode}`,
      description: 'Bản sao đã được đưa về hàng chờ phát cho sinh viên.',
      tone: 'info',
    });
  };

  const handleSecondaryAction = async (request: LibrarianRequest) => {
    if (request.status === 'pending') {
      await successHaptic();
      setRequestItems((current) => current.filter((item) => item.id !== request.id));
      setNotice({
        title: `Đã từ chối ${request.taskCode}`,
        description: 'Yêu cầu đã được loại khỏi danh sách chờ xử lý.',
        tone: 'danger',
      });
      return;
    }

    await selectionHaptic();
    setSelectedRequest(request);
  };

  return (
    <LibrarianScreenShell
      title="Yêu cầu"
      subtitle="Hộp thư công việc cần duyệt, rà soát và hoàn tất trong ca làm."
      aside={
        <View style={{ alignItems: 'flex-start', gap: 2 }}>
          <AppText variant="label" tone="muted">
            NGƯỜI XỬ LÝ
          </AppText>
          <AppText variant={compactAssignee ? 'title' : 'headline'}>
            {librarianProfile.fullName}
          </AppText>
        </View>
      }
    >
      {notice ? (
        <LibrarianFeedbackBanner
          title={notice.title}
          description={notice.description}
          tone={notice.tone}
          onClose={() => setNotice(null)}
        />
      ) : null}

      <LibrarianSearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm Task ID, mã sinh viên hoặc tên sách..."
        actionIcon={query ? 'close' : 'tune'}
        onActionPress={() => {
          if (query) {
            setQuery('');
            return;
          }

          setShowFilterSheet(true);
        }}
      />

      <FilterSegmented
        items={[`Mượn sách (${queueCounts.borrow})`, `Gia hạn (${queueCounts.renew})`]}
        activeItem={
          activeKind === 'borrow'
            ? `Mượn sách (${queueCounts.borrow})`
            : `Gia hạn (${queueCounts.renew})`
        }
        onChange={(value) => setActiveKind(value.startsWith('Mượn') ? 'borrow' : 'renew')}
      />

      {requests.length === 0 ? (
        <LibrarianEmptyState
          icon="task"
          title="Không có yêu cầu phù hợp"
          description="Thử đổi bộ lọc hoặc tìm bằng mã sinh viên, task code và tên sách."
        />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {requests.map((request) => (
            <View
              key={request.id}
              style={{
                borderRadius: theme.radius.lg,
                borderCurve: 'continuous',
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.md,
                boxShadow: theme.shadow.card,
                borderLeftWidth: 4,
                borderLeftColor: request.accent,
                gap: theme.spacing.md,
              }}
            >
              <View
                style={{
                  flexDirection: layout.width < 460 ? 'column' : 'row',
                  justifyContent: 'space-between',
                  gap: theme.spacing.sm,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    flex: 1,
                  }}
                >
                  <AppText variant="caption" tone="muted">
                    {request.taskCode}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    •
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {request.createdLabel}
                  </AppText>
                </View>

                <View
                  style={{
                    alignSelf: 'flex-start',
                    borderRadius: theme.radius.pill,
                    backgroundColor:
                      request.status === 'pending'
                        ? '#ffe8d4'
                        : request.status === 'processing'
                          ? '#e4f0eb'
                          : theme.colors.surfaceMuted,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                  }}
                >
                  <AppText variant="label" tone={request.status === 'staging' ? 'muted' : 'text'}>
                    {request.statusLabel}
                  </AppText>
                </View>
              </View>

              <View style={{ gap: theme.spacing.md }}>
                <AppText variant="headline" numberOfLines={2}>
                  {request.bookTitle}
                </AppText>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: theme.radius.pill,
                      backgroundColor: theme.colors.surfaceMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppText variant="bodyStrong" tone="muted">
                      {request.studentName
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join('')}
                    </AppText>
                  </View>

                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <AppText variant="title" numberOfLines={1}>
                      {request.studentName}
                    </AppText>
                    <AppText tone="muted">{request.studentId}</AppText>
                  </View>
                </View>
              </View>

              <View
                style={{
                  flexDirection: stackActions ? 'column' : 'row',
                  justifyContent: 'flex-end',
                  gap: theme.spacing.sm,
                  paddingTop: theme.spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.surfaceMuted,
                }}
              >
                <Pressable
                  style={{ flex: stackActions ? undefined : 1 }}
                  onPress={() => handleSecondaryAction(request)}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        minHeight: 48,
                        minWidth: 108,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: theme.radius.md,
                        borderCurve: 'continuous',
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        opacity: pressed ? 0.76 : 1,
                      }}
                    >
                      <AppText variant="bodyStrong">
                        {request.status === 'pending' ? 'Từ chối' : 'Chi tiết'}
                      </AppText>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  style={{ flex: stackActions ? undefined : 1.15 }}
                  onPress={() => handleApprove(request)}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        minHeight: 48,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        borderRadius: theme.radius.md,
                        borderCurve: 'continuous',
                        backgroundColor: theme.colors.primary,
                        opacity: pressed ? 0.84 : 1,
                      }}
                    >
                      <AppIcon name="check-circle" size={18} color={theme.colors.white} />
                      <AppText variant="bodyStrong" tone="white">
                        {request.status === 'pending'
                          ? 'Duyệt'
                          : request.status === 'processing'
                            ? 'Hoàn tất'
                            : 'Đã xếp kệ'}
                      </AppText>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <LibrarianActionSheet
        visible={showFilterSheet}
        title="Bộ lọc nhanh"
        subtitle="Tóm tắt trạng thái hiện tại của hộp thư yêu cầu."
        onClose={() => setShowFilterSheet(false)}
        initialSnapIndex={2}
        minHeight={360}
        snapPoints={[0.7, 0.56, 0.42]}
        footer={<AppButton label="Đóng" variant="secondary" onPress={() => setShowFilterSheet(false)} />}
      >
        <StatusBreakdown label="Đang chờ duyệt" value={queueCounts.pending} tone="warning" />
        <StatusBreakdown label="Đang xử lý" value={queueCounts.processing} tone="success" />
        <StatusBreakdown label="Chờ xếp giá" value={queueCounts.staging} tone="info" />
      </LibrarianActionSheet>

      <LibrarianActionSheet
        visible={Boolean(selectedRequest)}
        title={selectedRequest?.bookTitle ?? 'Chi tiết yêu cầu'}
        subtitle={selectedRequest ? `Task ${selectedRequest.taskCode}` : undefined}
        onClose={() => setSelectedRequest(null)}
        initialSnapIndex={1}
        minHeight={430}
        snapPoints={[0.9, 0.76, 0.62]}
        footer={<AppButton label="Đóng" variant="secondary" onPress={() => setSelectedRequest(null)} />}
      >
        {selectedRequest ? (
          <>
            <SheetRow
              label="Loại yêu cầu"
              value={selectedRequest.kind === 'borrow' ? 'Mượn sách' : 'Gia hạn'}
            />
            <SheetRow
              label="Sinh viên"
              value={`${selectedRequest.studentName} • ${selectedRequest.studentId}`}
            />
            <SheetRow label="Trạng thái" value={selectedRequest.statusLabel} />
            <SheetRow label="Tạo lúc" value={selectedRequest.createdLabel} />
            <View
              style={{
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surfaceMuted,
                padding: theme.spacing.md,
              }}
            >
              <AppText variant="bodyStrong">Gợi ý thao tác</AppText>
              <AppText tone="muted" style={{ marginTop: 6 }}>
                {selectedRequest.status === 'pending'
                  ? 'Kiểm tra tình trạng bản sao, sau đó duyệt để chuyển sang quy trình xử lý.'
                  : selectedRequest.status === 'processing'
                    ? 'Sau khi chuẩn bị đủ bản sao và xác nhận nghiệp vụ, có thể hoàn tất phiếu.'
                    : 'Yêu cầu đã được đưa sang khu vực staging, sẵn sàng cho bước bàn giao.'}
              </AppText>
            </View>
          </>
        ) : null}
      </LibrarianActionSheet>
    </LibrarianScreenShell>
  );
}

function StatusBreakdown({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'warning' | 'info';
}) {
  const palette = {
    success: { background: '#e7f6ee', text: theme.colors.primary },
    warning: { background: '#fff0de', text: '#8b4b08' },
    info: { background: theme.colors.infoSoft, text: theme.colors.primary },
  }[tone];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: theme.radius.md,
        backgroundColor: palette.background,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
      }}
    >
      <AppText variant="bodyStrong">{label}</AppText>
      <AppText variant="headline" style={{ color: palette.text }}>
        {value}
      </AppText>
    </View>
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

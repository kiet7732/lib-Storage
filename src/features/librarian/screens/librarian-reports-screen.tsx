import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import {
  librarianExportLogs,
  librarianReports,
  type LibrarianExportLog,
  type LibrarianReportItem,
} from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';
import { selectionHaptic, successHaptic } from '@/utils/haptics';

import { LibrarianActionSheet } from '../components/librarian-action-sheet';
import { LibrarianFeedbackBanner } from '../components/librarian-feedback-banner';
import { LibrarianScreenShell } from '../components/librarian-screen-shell';

type Notice = {
  title: string;
  description: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
};

export function LibrarianReportsScreen() {
  const layout = useResponsiveLayout();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [selectedReport, setSelectedReport] = useState<LibrarianReportItem | null>(null);
  const [selectedLog, setSelectedLog] = useState<LibrarianExportLog | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  return (
    <LibrarianScreenShell
      title="Báo cáo"
      subtitle="Xuất nhanh biểu mẫu vận hành, Jasper job và lịch sử file gần nhất."
      aside={
        <Pressable
          onPress={async () => {
            await selectionHaptic();
            setShowCreateSheet(true);
          }}
        >
          {({ pressed }) => (
            <View
              style={{
                minHeight: 48,
                minWidth: layout.isCompact ? 0 : 132,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: theme.radius.md,
                borderCurve: 'continuous',
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.spacing.md,
                opacity: pressed ? 0.84 : 1,
              }}
            >
              <AppIcon name="report" size={18} color={theme.colors.white} />
              <AppText variant="bodyStrong" tone="white">
                Tạo mới
              </AppText>
            </View>
          )}
        </Pressable>
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

      <View style={{ gap: theme.spacing.md }}>
        {librarianReports.map((report) => (
          <Pressable
            key={report.id}
            onPress={async () => {
              await selectionHaptic();
              setSelectedReport(report);
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
                  opacity: pressed ? 0.88 : 1,
                }}
              >
                <View
                  style={{
                    flexDirection: layout.isCompact ? 'column' : 'row',
                    alignItems: layout.isCompact ? 'flex-start' : 'flex-start',
                    justifyContent: 'space-between',
                    gap: theme.spacing.md,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: theme.spacing.md, flex: 1 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: theme.radius.pill,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.colors.surfaceTint,
                      }}
                    >
                      <AppIcon name={report.icon} color={theme.colors.primary} />
                    </View>

                    <View style={{ flex: 1, gap: 4 }}>
                      <AppText variant="headline">{report.title}</AppText>
                      <AppText tone="muted">{report.description}</AppText>
                    </View>
                  </View>

                  <View
                    style={{
                      alignSelf: layout.isCompact ? 'flex-start' : 'auto',
                      borderRadius: theme.radius.pill,
                      backgroundColor: theme.colors.surfaceMuted,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                    }}
                  >
                    <AppText variant="label" tone="muted">
                      {report.badge}
                    </AppText>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: theme.spacing.md,
                    paddingTop: theme.spacing.sm,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.surfaceMuted,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <AppText variant="caption" tone="muted">
                    Chạm để xem mẫu xuất
                  </AppText>
                  <AppIcon name="arrow-right" size={18} color={theme.colors.outline} />
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
          }}
        >
          <AppText variant="headline">Lịch sử xuất file</AppText>
          <AppText variant="bodyStrong" tone="primary">
            Jasper Queue
          </AppText>
        </View>

        <View
          style={{
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.colors.surface,
            overflow: 'hidden',
            boxShadow: theme.shadow.card,
          }}
        >
          {librarianExportLogs.map((item, index) => {
            const isWarning = item.statusTone === 'warning';

            return (
              <Pressable
                key={item.id}
                onPress={async () => {
                  await selectionHaptic();
                  setSelectedLog(item);
                }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.spacing.md,
                      padding: theme.spacing.md,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: theme.colors.surfaceMuted,
                      opacity: pressed ? 0.82 : 1,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: theme.radius.pill,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isWarning ? '#ffe7d0' : theme.colors.surfaceTint,
                      }}
                    >
                      <AppIcon
                        name={item.icon}
                        size={18}
                        color={isWarning ? theme.colors.accent : theme.colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="bodyStrong" numberOfLines={1}>
                        {item.fileName}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        {item.createdLabel}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        {item.ownerLabel}
                      </AppText>
                    </View>

                    <View
                      style={{
                        borderRadius: theme.radius.pill,
                        backgroundColor: isWarning ? '#ffe7d0' : '#dcebe5',
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                      }}
                    >
                      <AppText
                        variant="label"
                        style={{
                          color: isWarning ? '#7a4200' : theme.colors.primary,
                        }}
                      >
                        {item.statusLabel}
                      </AppText>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <LibrarianActionSheet
        visible={showCreateSheet}
        title="Tạo báo cáo mới"
        subtitle="Chọn mẫu Jasper để mô phỏng thao tác xuất file."
        onClose={() => setShowCreateSheet(false)}
        initialSnapIndex={1}
        minHeight={420}
        snapPoints={[0.88, 0.74, 0.58]}
        footer={
          <AppButton
            label="Xếp hàng job demo"
            onPress={async () => {
              await successHaptic();
              setShowCreateSheet(false);
              setNotice({
                title: 'Đã tạo job Jasper mới',
                description: 'Hệ thống demo đã ghi nhận tác vụ xuất báo cáo trong hàng chờ.',
                tone: 'success',
              });
            }}
          />
        }
      >
        {librarianReports.map((report) => (
          <View
            key={report.id}
            style={{
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surfaceMuted,
              padding: theme.spacing.md,
            }}
          >
            <AppText variant="bodyStrong">{report.title}</AppText>
            <AppText tone="muted" style={{ marginTop: 4 }}>
              {report.description}
            </AppText>
          </View>
        ))}
      </LibrarianActionSheet>

      <LibrarianActionSheet
        visible={Boolean(selectedReport)}
        title={selectedReport?.title ?? 'Chi tiết báo cáo'}
        subtitle={selectedReport?.badge}
        onClose={() => setSelectedReport(null)}
        initialSnapIndex={2}
        minHeight={360}
        snapPoints={[0.76, 0.58, 0.44]}
        footer={
          <AppButton
            label="Xuất file demo"
            onPress={async () => {
              await successHaptic();
              setNotice({
                title: `Đã khởi tạo ${selectedReport?.title ?? 'báo cáo'}`,
                description: 'File demo đang được xếp vào Jasper queue.',
                tone: 'success',
              });
              setSelectedReport(null);
            }}
          />
        }
      >
        {selectedReport ? (
          <>
            <SheetRow label="Tên mẫu" value={selectedReport.title} />
            <SheetRow label="Nhóm" value={selectedReport.badge} />
            <SheetRow label="Mô tả" value={selectedReport.description} />
          </>
        ) : null}
      </LibrarianActionSheet>

      <LibrarianActionSheet
        visible={Boolean(selectedLog)}
        title={selectedLog?.fileName ?? 'Nhật ký xuất file'}
        subtitle={selectedLog?.statusLabel}
        onClose={() => setSelectedLog(null)}
        initialSnapIndex={2}
        minHeight={360}
        snapPoints={[0.76, 0.58, 0.44]}
        footer={
          <AppButton
            label={selectedLog?.statusTone === 'warning' ? 'Làm mới trạng thái' : 'Đóng'}
            variant={selectedLog?.statusTone === 'warning' ? 'primary' : 'secondary'}
            onPress={async () => {
              if (selectedLog?.statusTone === 'warning') {
                await successHaptic();
                setNotice({
                  title: 'Đã yêu cầu làm mới trạng thái',
                  description: 'Luồng demo sẽ tiếp tục cập nhật Jasper queue ở lần kế tiếp.',
                  tone: 'info',
                });
              }
              setSelectedLog(null);
            }}
          />
        }
      >
        {selectedLog ? (
          <>
            <SheetRow label="Tên file" value={selectedLog.fileName} />
            <SheetRow label="Thời gian" value={selectedLog.createdLabel} />
            <SheetRow label="Nguồn tạo" value={selectedLog.ownerLabel} />
            <SheetRow label="Trạng thái" value={selectedLog.statusLabel} />
          </>
        ) : null}
      </LibrarianActionSheet>
    </LibrarianScreenShell>
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

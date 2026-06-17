import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppScrollScreen } from '@/components/ui/app-scroll-screen';
import { AppText } from '@/components/ui/app-text';
import { FilterSegmented } from '@/components/ui/filter-segmented';
import { StatusChip } from '@/components/ui/status-chip';
import { BookCover } from '@/features/books/components/book-cover';
import { borrowedItems, studentProfile } from '@/services/library';
import { useResponsiveLayout } from '@/theme/responsive';
import { theme } from '@/theme/theme';

const tabs = ['Sắp đến hạn', 'Quá hạn', 'Đã trả'];

export function MyLibraryScreen() {
  const layout = useResponsiveLayout();
  const [activeTab, setActiveTab] = useState('Sắp đến hạn');

  const handleRenewPress = (borrowId: string, bookId: string) => {
    router.push({
      pathname: '/borrow/request',
      params: {
        bookId,
        borrowId,
        intent: 'renew',
        returnTo: '/my-library',
      },
    });
  };

  const filteredItems =
    activeTab === 'Sắp đến hạn'
      ? borrowedItems.filter((item) => item.status === 'due-soon' || item.status === 'borrowed')
      : activeTab === 'Quá hạn'
        ? borrowedItems.filter((item) => item.status === 'overdue')
        : borrowedItems.filter((item) => item.status === 'returned');

  const compactCoverWidth = layout.contentWidth - layout.surfacePadding * 2;
  const compactCoverHeight = Math.round(compactCoverWidth * 1.24);

  return (
    <AppScrollScreen>
      <View
        style={{
          gap: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.primary,
          padding: layout.surfacePadding,
          boxShadow: theme.shadow.floating,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <AppIcon name="trophy" color="#ffcb8f" size={22} />
          <AppText variant="label" style={{ color: '#9adac1' }}>
            THÀNH TỰU ĐỌC
          </AppText>
        </View>
        <AppText variant="headline" selectable={false} style={{ color: '#9adac1' }}>
          Bạn đã đọc {studentProfile.booksRead} cuốn năm nay!
        </AppText>
        <AppText selectable={false} style={{ color: '#d5efe4' }}>
          Mục tiêu: {studentProfile.booksRead}/{studentProfile.yearlyGoal} cuốn. Cố lên nhé!
        </AppText>
        <View
          style={{
            height: 10,
            borderRadius: theme.radius.pill,
            backgroundColor: 'rgba(255,255,255,0.16)',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: '60%',
              height: '100%',
              backgroundColor: '#ffb469',
              borderRadius: theme.radius.pill,
            }}
          />
        </View>
      </View>

      <FilterSegmented items={tabs} activeItem={activeTab} onChange={setActiveTab} />

      <View style={{ gap: theme.spacing.lg }}>
        {filteredItems.map((item) => {
          const danger = item.status === 'overdue';

          return (
            <View
              key={item.id}
              style={{
                flexDirection: layout.isCompact ? 'column' : 'row',
                gap: theme.spacing.md,
                borderRadius: theme.radius.lg,
                borderCurve: 'continuous',
                backgroundColor: theme.colors.surface,
                padding: layout.isCompact ? theme.spacing.sm : theme.spacing.md,
                boxShadow: theme.shadow.card,
                borderWidth: danger ? 1 : 0,
                borderColor: danger ? '#f5b4af' : 'transparent',
              }}
            >
              <BookCover
                uri={item.bookCoverUrl}
                width={layout.isCompact ? compactCoverWidth : layout.bookRowCoverWidth}
                height={layout.isCompact ? compactCoverHeight : layout.bookRowCoverHeight + 6}
                radius={16}
              />

              <View style={{ flex: 1, gap: theme.spacing.sm }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: theme.spacing.md,
                  }}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText
                      variant="title"
                      numberOfLines={2}
                      style={{ fontFamily: theme.fonts.sansBold, minHeight: 58 }}
                    >
                      {item.bookTitle}
                    </AppText>
                    <AppText tone="muted" numberOfLines={1}>
                      {item.bookAuthor}
                    </AppText>
                    <AppText variant="caption" tone="muted" numberOfLines={1}>
                      {item.branchName} | {item.copyCode}
                    </AppText>
                  </View>
                  <AppIcon name="more" color={theme.colors.muted} />
                </View>

                {item.status === 'overdue' ? (
                  <StatusChip
                    label={item.note ?? 'Quá hạn'}
                    tone="danger"
                    solid
                    iconName="warning"
                  />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AppIcon name="clock" color={theme.colors.primary} size={18} />
                    <AppText variant="bodyStrong" tone="primary">
                      Hạn: {item.dueDate}
                    </AppText>
                  </View>
                )}

                {item.renewable ? (
                  <Pressable onPress={() => handleRenewPress(item.id, item.bookId)}>
                    {({ pressed }) => (
                      <View
                        style={{
                          alignSelf: 'flex-start',
                          borderRadius: theme.radius.md,
                          borderCurve: 'continuous',
                          backgroundColor: theme.colors.infoSoft,
                          paddingHorizontal: 18,
                          paddingVertical: 12,
                          opacity: pressed ? 0.74 : 1,
                        }}
                      >
                        <AppText variant="bodyStrong" tone="primary">
                          Gia hạn
                        </AppText>
                      </View>
                    )}
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <Link href="/history" asChild>
        <Pressable>
          <View
            style={{
              minHeight: layout.denseActionHeight,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.md,
              borderCurve: 'continuous',
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingVertical: 16,
            }}
          >
            <AppText variant="bodyStrong" tone="primary">
              Xem toàn bộ lịch sử
            </AppText>
          </View>
        </Pressable>
      </Link>
    </AppScrollScreen>
  );
}

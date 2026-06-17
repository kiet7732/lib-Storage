import type {
  Book,
  BorrowedItem,
  HistoryEvent,
  NotificationItem,
  StudentBorrowRequest,
  StudentLibrarySnapshot,
  StudentProfile,
} from '../library/library.types';
import type {
  LibrarianActivity,
  LibrarianExportLog,
  LibrarianInventoryItem,
  LibrarianProfile,
  LibrarianReportItem,
  LibrarianRequest,
  LibrarianReturnItem,
  LibrarianStat,
  LibrarianWorkspaceSnapshot,
} from '../library/librarian/types';

import { createQueryContext, type QueryContext } from './queries';

function findRequired<TItem>(
  items: TItem[],
  predicate: (item: TItem) => boolean,
  message: string,
) {
  const item = items.find(predicate);

  if (!item) {
    throw new Error(`[mock-db] ${message}`);
  }

  return item;
}

function formatCurrency(amount: number) {
  return `${amount.toLocaleString('vi-VN')}Ä‘`;
}

function formatDateToHistoryLabel(value: string) {
  const [day, month, year] = value.split('/').map(Number);

  if (!day || !month || !year) {
    return value;
  }

  return `${String(day).padStart(2, '0')} Thg ${String(month).padStart(2, '0')}, ${year}`;
}

function toStatusLabel(status: LibrarianRequest['status']) {
  return {
    pending: 'Chá» phÃª duyá»‡t',
    processing: 'Äang xá»­ lÃ½',
    staging: 'Chá» xáº¿p giÃ¡',
  }[status];
}

function toStatusAccent(status: LibrarianRequest['status']) {
  return {
    pending: '#fe932c',
    processing: '#003527',
    staging: '#d9ddd8',
  }[status];
}

function mapBook(ctx: QueryContext, bookId: string): Book {
  const record = ctx.getBookRecord(bookId);
  const copiesAvailable = record.copies.filter((copy) => copy.status === 'available').length;
  const firstCopy = record.copies[0];
  const branch = firstCopy ? ctx.getBranch(firstCopy.branchId) : undefined;

  return {
    id: record.book.id,
    title: record.book.title,
    author: record.book.author,
    publisher: record.book.publisher,
    year: record.book.year,
    isbn: record.book.isbn,
    categories: record.categories.map((category) => category.label),
    summary: record.book.summary,
    copiesAvailable,
    location: firstCopy && branch ? `${branch.name} - ${firstCopy.shelfCode}` : 'ChÆ°a phÃ¢n ká»‡',
    coverUrl: record.book.coverUrl,
  };
}

function mapStudentProfile(ctx: QueryContext): StudentProfile {
  const account = ctx.getStudentAccount(ctx.currentStudentUserId);
  const activeLoans = (ctx.loansByStudentUserId[ctx.currentStudentUserId] ?? []).filter(
    (loan) => loan.status !== 'returned',
  );

  return {
    userId: account.user.id,
    fullName: account.user.fullName,
    studentId: account.student.studentCode,
    faculty: account.student.faculty,
    program: account.student.program,
    campus: account.student.campus,
    residence: account.student.residence,
    avatarUrl: account.user.avatarUrl,
    booksRead: account.student.booksRead,
    currentlyBorrowed: activeLoans.length,
    yearlyGoal: account.student.yearlyGoal,
    currentBorrowLimit: account.student.currentBorrowLimit,
  };
}

function mapBorrowedItem(ctx: QueryContext, loanId: string): BorrowedItem {
  const joined = ctx.joinLoan(
    findRequired(ctx.database.loans, (entry) => entry.id === loanId, `Missing loan "${loanId}"`),
  );

  return {
    id: joined.loan.id,
    bookId: joined.loan.bookId,
    bookTitle: joined.bookRecord.book.title,
    bookAuthor: joined.bookRecord.book.author,
    bookCoverUrl: joined.bookRecord.book.coverUrl,
    copyId: joined.copy.id,
    copyCode: joined.copy.copyCode,
    branchId: joined.branch.id,
    branchName: joined.branch.name,
    dueDate: joined.loan.dueDate,
    status: joined.loan.status,
    renewable: joined.loan.renewable,
    fineAmount: joined.loan.fineAmount,
    note: joined.loan.note,
  };
}

function mapHistoryEvent(ctx: QueryContext, historyId: string): HistoryEvent {
  const history = findRequired(
    ctx.database.loanHistories,
    (entry) => entry.id === historyId,
    `Missing loan history "${historyId}"`,
  );
  const loan = findRequired(
    ctx.database.loans,
    (entry) => entry.id === history.loanId,
    `Missing loan "${history.loanId}" for history "${history.id}"`,
  );
  const book = ctx.getBookRecord(loan.bookId).book;

  const note =
    history.eventType === 'borrowed'
      ? `Hạn trả: ${formatDateToHistoryLabel(history.effectiveDueDate ?? loan.dueDate)}`
      : history.eventType === 'renewed'
        ? `Hạn trả mới: ${formatDateToHistoryLabel(history.effectiveDueDate ?? loan.dueDate)}`
        : history.note;

  return {
    id: history.id,
    loanId: history.loanId,
    bookId: loan.bookId,
    bookTitle: book.title,
    bookAuthor: book.author,
    bookCoverUrl: book.coverUrl,
    type: history.eventType,
    date: history.date,
    note,
  };
}

function mapStudentBorrowRequest(ctx: QueryContext, requestId: string): StudentBorrowRequest {
  const joined = ctx.joinBorrowRequest(
    findRequired(
      ctx.database.borrowRequests,
      (entry) => entry.id === requestId,
      `Missing borrow request "${requestId}"`,
    ),
  );

  return {
    id: joined.request.id,
    bookId: joined.request.bookId,
    loanId: joined.request.loanId,
    bookTitle: joined.bookRecord.book.title,
    requestType: joined.request.requestType,
    workflowStatus: joined.request.workflowStatus,
    createdLabel: joined.request.createdLabel,
    branchName: joined.branch.name,
    handledByName: joined.handledBy?.user.fullName,
  };
}

function mapNotification(item: QueryContext['database']['notifications'][number]): NotificationItem {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    timeLabel: item.timeLabel,
    amount: item.amount,
    relatedBookId: item.relatedBookId,
    relatedLoanId: item.relatedLoanId,
    relatedRequestId: item.relatedRequestId,
  };
}

export function selectStudentLibrarySnapshot(): StudentLibrarySnapshot {
  const ctx = createQueryContext();
  const books = ctx.database.books.map((book) => mapBook(ctx, book.id));
  const borrowedItems = (ctx.loansByStudentUserId[ctx.currentStudentUserId] ?? []).map((loan) =>
    mapBorrowedItem(ctx, loan.id),
  );
  const currentLoanIds = new Set(borrowedItems.map((item) => item.id));
  const historyEvents = ctx.database.loanHistories
    .filter((entry) => currentLoanIds.has(entry.loanId))
    .map((entry) => mapHistoryEvent(ctx, entry.id));
  const notifications = ctx.database.notifications
    .filter((entry) => entry.userId === ctx.currentStudentUserId)
    .map(mapNotification);
  const borrowRequests = (ctx.requestsByStudentUserId[ctx.currentStudentUserId] ?? []).map((entry) =>
    mapStudentBorrowRequest(ctx, entry.id),
  );

  return {
    studentProfile: mapStudentProfile(ctx),
    books,
    recommendedBookIds: ctx.database.recommendations
      .filter((entry) => entry.userId === ctx.currentStudentUserId)
      .sort((left, right) => left.rank - right.rank)
      .map((entry) => entry.bookId),
    borrowedItems,
    historyEvents,
    notifications,
    borrowRequests,
  };
}

function mapLibrarianProfile(ctx: QueryContext): LibrarianProfile {
  const account = ctx.getLibrarianAccount(ctx.currentLibrarianUserId);

  return {
    userId: account.user.id,
    fullName: account.user.fullName,
    employeeId: account.librarian.employeeCode,
    avatarUrl: account.user.avatarUrl,
    branchId: account.branch.id,
    branchName: account.branch.name,
    branchAddress: account.branch.address,
    shiftLabel: account.librarian.shiftLabel,
  };
}

function mapLibrarianRequest(ctx: QueryContext, requestId: string): LibrarianRequest {
  const joined = ctx.joinBorrowRequest(
    findRequired(
      ctx.database.borrowRequests,
      (entry) => entry.id === requestId,
      `Missing borrow request "${requestId}"`,
    ),
  );
  const availableCopies = joined.bookRecord.copies.filter((copy) => copy.status === 'available').length;
  const status = joined.request.workflowStatus as LibrarianRequest['status'];

  return {
    id: joined.request.id,
    taskCode: joined.request.id.toUpperCase().replace('REQUEST-', 'TASK-'),
    createdLabel: joined.request.createdLabel,
    bookId: joined.request.bookId,
    loanId: joined.request.loanId,
    bookTitle: joined.bookRecord.book.title,
    studentUserId: joined.studentAccount.user.id,
    studentName: joined.studentAccount.user.fullName,
    studentId: joined.studentAccount.student.studentCode,
    studentAvatarUrl: joined.studentAccount.user.avatarUrl,
    studentProgram: joined.studentAccount.student.program,
    kind: joined.request.requestType,
    status,
    statusLabel: toStatusLabel(status),
    accent: toStatusAccent(status),
    branchId: joined.branch.id,
    branchName: joined.branch.name,
    handledByName: joined.handledBy?.user.fullName,
    availableCopies,
  };
}

function mapInventoryItem(ctx: QueryContext, copyId: string): LibrarianInventoryItem {
  const copy = findRequired(
    ctx.database.bookCopies,
    (entry) => entry.id === copyId,
    `Missing book copy "${copyId}"`,
  );
  const bookRecord = ctx.getBookRecord(copy.bookId);
  const branch = ctx.getBranch(copy.branchId);
  const totalCopies = bookRecord.copies.length;
  const availableCopies = bookRecord.copies.filter((entry) => entry.status === 'available').length;

  return {
    id: copy.id,
    bookId: copy.bookId,
    bookTitle: bookRecord.book.title,
    bookAuthor: bookRecord.book.author,
    coverUrl: bookRecord.book.coverUrl,
    copyCode: copy.copyCode,
    shelfCode: copy.shelfCode,
    branchId: branch.id,
    branchName: branch.name,
    status:
      copy.status === 'damaged'
        ? 'damaged'
        : copy.status === 'borrowed'
          ? 'borrowed'
          : 'available',
    statusLabel:
      copy.status === 'damaged'
        ? 'BÃ¡o há»ng'
        : copy.status === 'borrowed'
          ? 'Äang mÆ°á»£n'
          : 'Sáºµn sÃ ng',
    statusTone:
      copy.status === 'damaged'
        ? 'danger'
        : copy.status === 'borrowed'
          ? 'warning'
          : 'success',
    totalCopies,
    availableCopies,
  };
}

function mapReturnItem(ctx: QueryContext, loanId: string): LibrarianReturnItem | null {
  const joined = ctx.joinLoan(
    findRequired(ctx.database.loans, (entry) => entry.id === loanId, `Missing loan "${loanId}"`),
  );

  if (joined.loan.status === 'returned') {
    return null;
  }

  const bucket =
    joined.loan.status === 'overdue'
      ? 'overdue'
      : joined.loan.note?.toLowerCase().includes('hÃ´m nay')
        ? 'dueToday'
        : null;

  if (!bucket) {
    return null;
  }

  return {
    id: joined.loan.id,
    loanId: joined.loan.id,
    bookId: joined.loan.bookId,
    bookTitle: joined.bookRecord.book.title,
    bookAuthor: joined.bookRecord.book.author,
    coverUrl: joined.bookRecord.book.coverUrl,
    copyId: joined.copy.id,
    copyCode: joined.copy.copyCode,
    branchId: joined.branch.id,
    branchName: joined.branch.name,
    studentUserId: joined.studentAccount.user.id,
    studentName: joined.studentAccount.user.fullName,
    studentId: joined.studentAccount.student.studentCode.replace('SV', ''),
    studentAvatarUrl: joined.studentAccount.user.avatarUrl,
    studentProgram: joined.studentAccount.student.program,
    residence: joined.studentAccount.student.residence,
    dueDate: joined.loan.dueDate,
    bucket,
    statusLabel: bucket === 'overdue' ? joined.loan.note ?? 'QuÃ¡ háº¡n' : 'Äáº¿n háº¡n hÃ´m nay',
    fineAmount: formatCurrency(joined.loan.fineAmount ?? 0),
    fineAmountValue: joined.loan.fineAmount ?? 0,
    note: joined.loan.note,
  };
}

function mapActivity(ctx: QueryContext, activityId: string): LibrarianActivity {
  const activity = findRequired(
    ctx.database.activityLogs,
    (entry) => entry.id === activityId,
    `Missing activity log "${activityId}"`,
  );
  const actor = activity.actorUserId ? ctx.usersById.get(activity.actorUserId) : undefined;

  return {
    id: activity.id,
    actorUserId: activity.actorUserId,
    actorName: actor?.fullName,
    title: activity.title,
    note: activity.note,
    timeLabel: activity.timeLabel,
    icon: activity.icon,
    tone: activity.tone,
    relatedBookId: activity.relatedBookId,
    relatedLoanId: activity.relatedLoanId,
    relatedRequestId: activity.relatedRequestId,
  };
}

function mapExportLog(ctx: QueryContext, jobId: string): LibrarianExportLog {
  const job = findRequired(
    ctx.database.reportJobs,
    (entry) => entry.id === jobId,
    `Missing report job "${jobId}"`,
  );
  const owner = ctx.getUser(job.createdByUserId);

  return {
    id: job.id,
    templateId: job.templateId,
    fileName: job.fileName,
    createdByUserId: owner.id,
    createdLabel: job.createdLabel,
    ownerLabel: `Táº¡o bá»Ÿi ${owner.fullName}`,
    ownerName: owner.fullName,
    statusLabel: job.statusLabel,
    statusTone: job.statusTone,
    icon: job.icon,
  };
}

export function selectLibrarianWorkspaceSnapshot(): LibrarianWorkspaceSnapshot {
  const ctx = createQueryContext();
  const librarianReturnItems = ctx.database.loans
    .map((loan) => mapReturnItem(ctx, loan.id))
    .filter((value): value is LibrarianReturnItem => Boolean(value))
    .filter((item) => item.branchId === ctx.currentBranchId);
  const librarianRequests = ctx.database.borrowRequests
    .filter((entry) => ['pending', 'processing', 'staging'].includes(entry.workflowStatus))
    .filter((entry) => entry.branchId === ctx.currentBranchId)
    .map((entry) => mapLibrarianRequest(ctx, entry.id));
  const librarianInventoryItems = ctx.database.bookCopies
    .filter((entry) => entry.branchId === ctx.currentBranchId)
    .filter((entry) => ['available', 'borrowed', 'damaged'].includes(entry.status))
    .map((entry) => mapInventoryItem(ctx, entry.id));

  return {
    librarianProfile: mapLibrarianProfile(ctx),
    librarianStats: [
      {
        id: 'pending-borrow',
        label: 'YÃªu cáº§u mÆ°á»£n',
        value: librarianRequests.filter((entry) => entry.kind === 'borrow').length,
        icon: 'task',
        tone: 'primary',
      },
      {
        id: 'pending-renew',
        label: 'YÃªu cáº§u gia háº¡n',
        value: librarianRequests.filter((entry) => entry.kind === 'renew').length,
        icon: 'history',
        tone: 'warning',
      },
      {
        id: 'overdue',
        label: 'SÃ¡ch quÃ¡ háº¡n',
        value: librarianReturnItems.filter((entry) => entry.bucket === 'overdue').length,
        icon: 'warning',
        tone: 'danger',
      },
      {
        id: 'returned',
        label: 'Äáº¿n háº¡n hÃ´m nay',
        value: librarianReturnItems.filter((entry) => entry.bucket === 'dueToday').length,
        icon: 'calendar',
        tone: 'neutral',
      },
    ],
    librarianActivities: ctx.database.activityLogs
      .filter((entry) => entry.branchId === ctx.currentBranchId)
      .map((entry) => mapActivity(ctx, entry.id)),
    librarianRequests,
    librarianInventoryItems,
    librarianReturnItems,
    librarianReports: ctx.database.reportTemplates.map<LibrarianReportItem>((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      badge: entry.badge,
      icon: entry.icon,
    })),
    librarianExportLogs: ctx.database.reportJobs.map((entry) => mapExportLog(ctx, entry.id)),
  };
}

export function selectBooks(): Book[] {
  return selectStudentLibrarySnapshot().books;
}

export function selectStudentProfile(): StudentProfile {
  return selectStudentLibrarySnapshot().studentProfile;
}

export function selectRecommendedBookIds() {
  return selectStudentLibrarySnapshot().recommendedBookIds;
}

export function selectBorrowedItems(): BorrowedItem[] {
  return selectStudentLibrarySnapshot().borrowedItems;
}

export function selectHistoryEvents(): HistoryEvent[] {
  return selectStudentLibrarySnapshot().historyEvents;
}

export function selectNotifications(): NotificationItem[] {
  return selectStudentLibrarySnapshot().notifications;
}

export function selectStudentBorrowRequests(): StudentBorrowRequest[] {
  return selectStudentLibrarySnapshot().borrowRequests;
}

export function selectLibrarianProfile(): LibrarianProfile {
  return selectLibrarianWorkspaceSnapshot().librarianProfile;
}

export function selectLibrarianStats(): LibrarianStat[] {
  return selectLibrarianWorkspaceSnapshot().librarianStats;
}

export function selectLibrarianActivities(): LibrarianActivity[] {
  return selectLibrarianWorkspaceSnapshot().librarianActivities;
}

export function selectLibrarianRequests(): LibrarianRequest[] {
  return selectLibrarianWorkspaceSnapshot().librarianRequests;
}

export function selectLibrarianInventoryItems(): LibrarianInventoryItem[] {
  return selectLibrarianWorkspaceSnapshot().librarianInventoryItems;
}

export function selectLibrarianReturnItems(): LibrarianReturnItem[] {
  return selectLibrarianWorkspaceSnapshot().librarianReturnItems;
}

export function selectLibrarianReports(): LibrarianReportItem[] {
  return selectLibrarianWorkspaceSnapshot().librarianReports;
}

export function selectLibrarianExportLogs(): LibrarianExportLog[] {
  return selectLibrarianWorkspaceSnapshot().librarianExportLogs;
}


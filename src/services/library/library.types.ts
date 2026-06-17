export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  categories: string[];
  summary: string;
  copiesAvailable: number;
  location: string;
  coverUrl: string;
}

export type BorrowStatus = 'due-soon' | 'overdue' | 'borrowed' | 'returned';

export interface BorrowedItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string;
  copyId: string;
  copyCode: string;
  branchId: string;
  branchName: string;
  dueDate: string;
  status: BorrowStatus;
  renewable: boolean;
  fineAmount?: number;
  note?: string;
}

export type HistoryEventType = 'borrowed' | 'returned' | 'renewed' | 'late-return';

export interface HistoryEvent {
  id: string;
  loanId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string;
  type: HistoryEventType;
  date: string;
  note: string;
}

export type NotificationType = 'success' | 'warning' | 'danger' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeLabel: string;
  amount?: string;
  relatedBookId?: string;
  relatedLoanId?: string;
  relatedRequestId?: string;
}

export interface StudentProfile {
  userId: string;
  fullName: string;
  studentId: string;
  faculty: string;
  program: string;
  campus: string;
  residence: string;
  avatarUrl: string;
  booksRead: number;
  currentlyBorrowed: number;
  yearlyGoal: number;
  currentBorrowLimit: number;
}

export interface StudentBorrowRequest {
  id: string;
  bookId: string;
  loanId?: string;
  bookTitle: string;
  requestType: 'borrow' | 'renew';
  workflowStatus: 'pending' | 'processing' | 'staging' | 'completed' | 'rejected';
  createdLabel: string;
  branchName: string;
  handledByName?: string;
}

export interface StudentLibrarySnapshot {
  studentProfile: StudentProfile;
  books: Book[];
  recommendedBookIds: string[];
  borrowedItems: BorrowedItem[];
  historyEvents: HistoryEvent[];
  notifications: NotificationItem[];
  borrowRequests: StudentBorrowRequest[];
}

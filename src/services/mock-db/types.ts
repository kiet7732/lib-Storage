export type RoleCode = 'student' | 'librarian' | 'admin';

export interface TableDefinition {
  description: string;
  primaryKey: string;
  columns: readonly string[];
}

export interface RoleRow {
  id: string;
  code: RoleCode;
  name: string;
}

export interface UserRow {
  id: string;
  roleId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  status: 'active' | 'inactive';
}

export interface BranchRow {
  id: string;
  name: string;
  campus: string;
  address: string;
}

export interface StudentRow {
  id: string;
  userId: string;
  studentCode: string;
  faculty: string;
  program: string;
  campus: string;
  residence: string;
  yearlyGoal: number;
  booksRead: number;
  currentBorrowLimit: number;
}

export interface LibrarianRow {
  id: string;
  userId: string;
  employeeCode: string;
  branchId: string;
  shiftLabel: string;
}

export interface BookRow {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  summary: string;
  coverUrl: string;
}

export interface CategoryRow {
  id: string;
  label: string;
}

export interface BookCategoryRow {
  id: string;
  bookId: string;
  categoryId: string;
}

export interface BookCopyRow {
  id: string;
  bookId: string;
  branchId: string;
  copyCode: string;
  shelfCode: string;
  status: 'available' | 'borrowed' | 'reserved' | 'damaged';
}

export interface RecommendationRow {
  id: string;
  userId: string;
  bookId: string;
  rank: number;
}

export interface BorrowRequestRow {
  id: string;
  studentUserId: string;
  bookId: string;
  loanId?: string;
  branchId: string;
  requestType: 'borrow' | 'renew';
  workflowStatus: 'pending' | 'processing' | 'staging' | 'completed' | 'rejected';
  createdLabel: string;
  handledByUserId?: string;
}

export interface LoanRow {
  id: string;
  studentUserId: string;
  copyId: string;
  bookId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'due-soon' | 'overdue' | 'borrowed' | 'returned';
  renewable: boolean;
  fineAmount?: number;
  note?: string;
}

export interface LoanHistoryRow {
  id: string;
  loanId: string;
  bookId: string;
  eventType: 'borrowed' | 'returned' | 'renewed' | 'late-return';
  date: string;
  note: string;
  effectiveDueDate?: string;
}

export interface NotificationRow {
  id: string;
  userId: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timeLabel: string;
  amount?: string;
  relatedBookId?: string;
  relatedLoanId?: string;
  relatedRequestId?: string;
}

export interface ActivityLogRow {
  id: string;
  branchId: string;
  actorUserId?: string;
  title: string;
  note: string;
  timeLabel: string;
  icon: 'check-circle' | 'history' | 'warning';
  tone: 'primary' | 'warning' | 'danger';
  relatedBookId?: string;
  relatedLoanId?: string;
  relatedRequestId?: string;
}

export interface ReportTemplateRow {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: 'history' | 'warning' | 'money' | 'report';
}

export interface ReportJobRow {
  id: string;
  templateId: string;
  fileName: string;
  createdByUserId: string;
  createdLabel: string;
  statusLabel: string;
  statusTone: 'success' | 'warning';
  icon: 'report' | 'warning' | 'history';
}

export interface MockDatabaseTables {
  roles: RoleRow[];
  users: UserRow[];
  branches: BranchRow[];
  students: StudentRow[];
  librarians: LibrarianRow[];
  books: BookRow[];
  categories: CategoryRow[];
  bookCategories: BookCategoryRow[];
  bookCopies: BookCopyRow[];
  recommendations: RecommendationRow[];
  borrowRequests: BorrowRequestRow[];
  loans: LoanRow[];
  loanHistories: LoanHistoryRow[];
  notifications: NotificationRow[];
  activityLogs: ActivityLogRow[];
  reportTemplates: ReportTemplateRow[];
  reportJobs: ReportJobRow[];
}

export type LibrarianRequestKind = 'borrow' | 'renew';

export type LibrarianRequestStatus = 'pending' | 'processing' | 'staging';

export interface LibrarianProfile {
  userId: string;
  fullName: string;
  employeeId: string;
  avatarUrl: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  shiftLabel: string;
}

export interface LibrarianStat {
  id: string;
  label: string;
  value: number;
  icon: 'task' | 'history' | 'warning' | 'calendar';
  tone?: 'primary' | 'warning' | 'danger' | 'neutral';
}

export interface LibrarianActivity {
  id: string;
  actorUserId?: string;
  actorName?: string;
  title: string;
  note: string;
  timeLabel: string;
  icon: 'check-circle' | 'history' | 'warning';
  tone?: 'primary' | 'warning' | 'danger';
  relatedBookId?: string;
  relatedLoanId?: string;
  relatedRequestId?: string;
}

export interface LibrarianRequest {
  id: string;
  taskCode: string;
  createdLabel: string;
  bookId: string;
  loanId?: string;
  bookTitle: string;
  studentUserId: string;
  studentName: string;
  studentId: string;
  studentAvatarUrl: string;
  studentProgram: string;
  kind: LibrarianRequestKind;
  status: LibrarianRequestStatus;
  statusLabel: string;
  accent: string;
  branchId: string;
  branchName: string;
  handledByName?: string;
  availableCopies: number;
}

export type InventoryStatus = 'available' | 'borrowed' | 'damaged';

export interface LibrarianInventoryItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  copyCode: string;
  shelfCode: string;
  branchId: string;
  branchName: string;
  status: InventoryStatus;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'danger';
  totalCopies: number;
  availableCopies: number;
}

export interface LibrarianReturnItem {
  id: string;
  loanId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  copyId: string;
  copyCode: string;
  branchId: string;
  branchName: string;
  studentUserId: string;
  studentName: string;
  studentId: string;
  studentAvatarUrl: string;
  studentProgram: string;
  residence: string;
  dueDate: string;
  bucket: 'overdue' | 'dueToday';
  statusLabel: string;
  fineAmount: string;
  fineAmountValue: number;
  note?: string;
}

export interface LibrarianReportItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: 'history' | 'warning' | 'money' | 'report';
}

export interface LibrarianExportLog {
  id: string;
  templateId: string;
  fileName: string;
  createdByUserId: string;
  createdLabel: string;
  ownerLabel: string;
  ownerName: string;
  statusLabel: string;
  statusTone: 'success' | 'warning';
  icon: 'report' | 'warning' | 'history';
}

export interface LibrarianWorkspaceSnapshot {
  librarianProfile: LibrarianProfile;
  librarianStats: LibrarianStat[];
  librarianActivities: LibrarianActivity[];
  librarianRequests: LibrarianRequest[];
  librarianInventoryItems: LibrarianInventoryItem[];
  librarianReturnItems: LibrarianReturnItem[];
  librarianReports: LibrarianReportItem[];
  librarianExportLogs: LibrarianExportLog[];
}

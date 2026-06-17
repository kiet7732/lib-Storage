import {
  selectStudentLibrarySnapshot,
} from '@/services/mock-db';

export const studentLibrarySnapshot = selectStudentLibrarySnapshot();
export const {
  studentProfile,
  books,
  recommendedBookIds,
  borrowedItems,
  historyEvents,
  notifications,
  borrowRequests: studentBorrowRequests,
} = studentLibrarySnapshot;

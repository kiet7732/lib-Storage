import {
  selectLibrarianWorkspaceSnapshot,
} from '@/services/mock-db';

export const librarianWorkspaceSnapshot = selectLibrarianWorkspaceSnapshot();
export const {
  librarianProfile,
  librarianStats,
  librarianActivities,
  librarianRequests,
  librarianInventoryItems,
  librarianReturnItems,
  librarianReports,
  librarianExportLogs,
} = librarianWorkspaceSnapshot;

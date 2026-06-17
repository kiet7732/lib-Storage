import { demoSession, mockDatabase } from './database';
import type {
  BookCategoryRow,
  BookCopyRow,
  BookRow,
  BorrowRequestRow,
  BranchRow,
  CategoryRow,
  LibrarianRow,
  LoanRow,
  MockDatabaseTables,
  RoleRow,
  StudentRow,
  UserRow,
} from './types';

type JoinedStudentAccount = {
  role: RoleRow;
  user: UserRow;
  student: StudentRow;
};

type JoinedLibrarianAccount = {
  role: RoleRow;
  user: UserRow;
  librarian: LibrarianRow;
  branch: BranchRow;
};

type JoinedBookRecord = {
  book: BookRow;
  categories: CategoryRow[];
  copies: BookCopyRow[];
};

type JoinedLoanRecord = {
  loan: LoanRow;
  studentAccount: JoinedStudentAccount;
  copy: BookCopyRow;
  branch: BranchRow;
  bookRecord: JoinedBookRecord;
};

type JoinedBorrowRequestRecord = {
  request: BorrowRequestRow;
  studentAccount: JoinedStudentAccount;
  branch: BranchRow;
  bookRecord: JoinedBookRecord;
  handledBy?: JoinedLibrarianAccount;
};

function invariant<T>(value: T | null | undefined, message: string): T {
  if (value == null) {
    throw new Error(`[mock-db] ${message}`);
  }

  return value;
}

function groupBy<TItem, TKey extends string>(
  items: TItem[],
  getKey: (item: TItem) => TKey,
) {
  return items.reduce<Record<TKey, TItem[]>>((accumulator, item) => {
    const key = getKey(item);

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(item);
    return accumulator;
  }, {} as Record<TKey, TItem[]>);
}

export function createQueryContext(database: MockDatabaseTables = mockDatabase) {
  const rolesById = new Map(database.roles.map((role) => [role.id, role] as const));
  const usersById = new Map(database.users.map((user) => [user.id, user] as const));
  const branchesById = new Map(database.branches.map((branch) => [branch.id, branch] as const));
  const studentsByUserId = new Map(database.students.map((student) => [student.userId, student] as const));
  const librariansByUserId = new Map(database.librarians.map((librarian) => [librarian.userId, librarian] as const));
  const booksById = new Map(database.books.map((book) => [book.id, book] as const));
  const categoriesById = new Map(database.categories.map((category) => [category.id, category] as const));
  const copiesById = new Map(database.bookCopies.map((copy) => [copy.id, copy] as const));
  const templatesById = new Map(database.reportTemplates.map((template) => [template.id, template] as const));

  const bookCategoriesByBookId = groupBy(database.bookCategories, (entry) => entry.bookId);
  const copiesByBookId = groupBy(database.bookCopies, (entry) => entry.bookId);
  const loansByStudentUserId = groupBy(database.loans, (entry) => entry.studentUserId);
  const requestsByStudentUserId = groupBy(database.borrowRequests, (entry) => entry.studentUserId);

  const getRole = (roleId: string) =>
    invariant(rolesById.get(roleId), `Missing role "${roleId}"`);

  const getUser = (userId: string) =>
    invariant(usersById.get(userId), `Missing user "${userId}"`);

  const getBranch = (branchId: string) =>
    invariant(branchesById.get(branchId), `Missing branch "${branchId}"`);

  const getStudentAccount = (userId: string): JoinedStudentAccount => {
    const user = getUser(userId);
    const student = invariant(
      studentsByUserId.get(userId),
      `Missing student profile for user "${userId}"`,
    );

    return {
      role: getRole(user.roleId),
      user,
      student,
    };
  };

  const getLibrarianAccount = (userId: string): JoinedLibrarianAccount => {
    const user = getUser(userId);
    const librarian = invariant(
      librariansByUserId.get(userId),
      `Missing librarian profile for user "${userId}"`,
    );

    return {
      role: getRole(user.roleId),
      user,
      librarian,
      branch: getBranch(librarian.branchId),
    };
  };

  const getBookRecord = (bookId: string): JoinedBookRecord => {
    const book = invariant(booksById.get(bookId), `Missing book "${bookId}"`);
    const categoryLinks = bookCategoriesByBookId[bookId] ?? [];
    const categories = categoryLinks
      .map((entry: BookCategoryRow) => categoriesById.get(entry.categoryId))
      .filter((value): value is CategoryRow => Boolean(value));

    return {
      book,
      categories,
      copies: copiesByBookId[bookId] ?? [],
    };
  };

  const joinLoan = (loan: LoanRow): JoinedLoanRecord => {
    const copy = invariant(copiesById.get(loan.copyId), `Missing copy "${loan.copyId}"`);

    return {
      loan,
      studentAccount: getStudentAccount(loan.studentUserId),
      copy,
      branch: getBranch(copy.branchId),
      bookRecord: getBookRecord(loan.bookId),
    };
  };

  const joinBorrowRequest = (request: BorrowRequestRow): JoinedBorrowRequestRecord => ({
    request,
    studentAccount: getStudentAccount(request.studentUserId),
    branch: getBranch(request.branchId),
    bookRecord: getBookRecord(request.bookId),
    handledBy: request.handledByUserId
      ? getLibrarianAccount(request.handledByUserId)
      : undefined,
  });

  return {
    database,
    currentStudentUserId: demoSession.studentUserId,
    currentLibrarianUserId: demoSession.librarianUserId,
    currentBranchId: demoSession.branchId,
    rolesById,
    usersById,
    branchesById,
    studentsByUserId,
    librariansByUserId,
    booksById,
    categoriesById,
    copiesById,
    templatesById,
    bookCategoriesByBookId,
    copiesByBookId,
    loansByStudentUserId,
    requestsByStudentUserId,
    getRole,
    getUser,
    getBranch,
    getStudentAccount,
    getLibrarianAccount,
    getBookRecord,
    joinLoan,
    joinBorrowRequest,
  };
}

export type QueryContext = ReturnType<typeof createQueryContext>;
export type {
  JoinedBookRecord,
  JoinedBorrowRequestRecord,
  JoinedLibrarianAccount,
  JoinedLoanRecord,
  JoinedStudentAccount,
};

import type { MockDatabaseTables, RoleCode, UserRow } from './types';

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[mock-db] ${message}`);
  }
}

function getRoleCodeByUser(
  usersById: Map<string, UserRow>,
  rolesById: Map<string, RoleCode>,
  userId: string,
) {
  const user = usersById.get(userId);

  invariant(user, `Missing user "${userId}"`);

  const roleCode = rolesById.get(user.roleId);
  invariant(roleCode, `Missing role "${user.roleId}" for user "${userId}"`);

  return roleCode;
}

function assertUnique<TItem>(
  items: TItem[],
  getKey: (item: TItem) => string,
  label: string,
) {
  const seen = new Set<string>();

  for (const item of items) {
    const key = getKey(item);
    invariant(!seen.has(key), `${label} has duplicate key "${key}"`);
    seen.add(key);
  }
}

export function assertMockDatabaseIntegrity(database: MockDatabaseTables) {
  const rolesById = new Map(database.roles.map((role) => [role.id, role.code] as const));
  const usersById = new Map(database.users.map((user) => [user.id, user] as const));
  const branchesById = new Map(database.branches.map((branch) => [branch.id, branch] as const));
  const booksById = new Map(database.books.map((book) => [book.id, book] as const));
  const categoriesById = new Map(database.categories.map((category) => [category.id, category] as const));
  const copiesById = new Map(database.bookCopies.map((copy) => [copy.id, copy] as const));
  const templatesById = new Map(database.reportTemplates.map((template) => [template.id, template] as const));
  const loansById = new Map(database.loans.map((loan) => [loan.id, loan] as const));
  const requestsById = new Map(database.borrowRequests.map((request) => [request.id, request] as const));
  const activeLoans = database.loans.filter((loan) => loan.status !== 'returned');

  assertUnique(database.roles, (item) => item.id, 'roles');
  assertUnique(database.users, (item) => item.id, 'users');
  assertUnique(database.users, (item) => item.email, 'users.email');
  assertUnique(database.branches, (item) => item.id, 'branches');
  assertUnique(database.students, (item) => item.id, 'students');
  assertUnique(database.students, (item) => item.userId, 'students.userId');
  assertUnique(database.students, (item) => item.studentCode, 'students.studentCode');
  assertUnique(database.librarians, (item) => item.id, 'librarians');
  assertUnique(database.librarians, (item) => item.userId, 'librarians.userId');
  assertUnique(database.librarians, (item) => item.employeeCode, 'librarians.employeeCode');
  assertUnique(database.books, (item) => item.id, 'books');
  assertUnique(database.books, (item) => item.isbn, 'books.isbn');
  assertUnique(database.categories, (item) => item.id, 'categories');
  assertUnique(database.bookCategories, (item) => item.id, 'bookCategories');
  assertUnique(
    database.bookCategories,
    (item) => `${item.bookId}:${item.categoryId}`,
    'bookCategories.bookId:categoryId',
  );
  assertUnique(database.bookCopies, (item) => item.id, 'bookCopies');
  assertUnique(database.bookCopies, (item) => item.copyCode, 'bookCopies.copyCode');
  assertUnique(database.recommendations, (item) => item.id, 'recommendations');
  assertUnique(
    database.recommendations,
    (item) => `${item.userId}:${item.rank}`,
    'recommendations.userId:rank',
  );
  assertUnique(database.borrowRequests, (item) => item.id, 'borrowRequests');
  assertUnique(database.loans, (item) => item.id, 'loans');
  assertUnique(database.loanHistories, (item) => item.id, 'loanHistories');
  assertUnique(database.notifications, (item) => item.id, 'notifications');
  assertUnique(database.activityLogs, (item) => item.id, 'activityLogs');
  assertUnique(database.reportTemplates, (item) => item.id, 'reportTemplates');
  assertUnique(database.reportJobs, (item) => item.id, 'reportJobs');

  for (const user of database.users) {
    invariant(rolesById.has(user.roleId), `User "${user.id}" references missing role "${user.roleId}"`);
  }

  for (const student of database.students) {
    invariant(usersById.has(student.userId), `Student "${student.id}" references missing user "${student.userId}"`);
    invariant(
      getRoleCodeByUser(usersById, rolesById, student.userId) === 'student',
      `Student "${student.id}" must reference a student user`,
    );
  }

  for (const librarian of database.librarians) {
    invariant(usersById.has(librarian.userId), `Librarian "${librarian.id}" references missing user "${librarian.userId}"`);
    invariant(
      getRoleCodeByUser(usersById, rolesById, librarian.userId) === 'librarian',
      `Librarian "${librarian.id}" must reference a librarian user`,
    );
    invariant(branchesById.has(librarian.branchId), `Librarian "${librarian.id}" references missing branch "${librarian.branchId}"`);
  }

  for (const entry of database.bookCategories) {
    invariant(booksById.has(entry.bookId), `BookCategory "${entry.id}" references missing book "${entry.bookId}"`);
    invariant(categoriesById.has(entry.categoryId), `BookCategory "${entry.id}" references missing category "${entry.categoryId}"`);
  }

  for (const copy of database.bookCopies) {
    invariant(booksById.has(copy.bookId), `BookCopy "${copy.id}" references missing book "${copy.bookId}"`);
    invariant(branchesById.has(copy.branchId), `BookCopy "${copy.id}" references missing branch "${copy.branchId}"`);
  }

  for (const recommendation of database.recommendations) {
    invariant(usersById.has(recommendation.userId), `Recommendation "${recommendation.id}" references missing user "${recommendation.userId}"`);
    invariant(booksById.has(recommendation.bookId), `Recommendation "${recommendation.id}" references missing book "${recommendation.bookId}"`);
  }

  for (const request of database.borrowRequests) {
    invariant(usersById.has(request.studentUserId), `Borrow request "${request.id}" references missing student user "${request.studentUserId}"`);
    invariant(
      getRoleCodeByUser(usersById, rolesById, request.studentUserId) === 'student',
      `Borrow request "${request.id}" must reference a student user`,
    );
    invariant(booksById.has(request.bookId), `Borrow request "${request.id}" references missing book "${request.bookId}"`);
    invariant(branchesById.has(request.branchId), `Borrow request "${request.id}" references missing branch "${request.branchId}"`);

    if (request.handledByUserId) {
      invariant(usersById.has(request.handledByUserId), `Borrow request "${request.id}" references missing handler "${request.handledByUserId}"`);
      invariant(
        getRoleCodeByUser(usersById, rolesById, request.handledByUserId) === 'librarian',
        `Borrow request "${request.id}" handler must be a librarian`,
      );
    }

    if (request.requestType === 'renew') {
      invariant(request.loanId, `Renew request "${request.id}" must reference a loan`);

      const loan = loansById.get(request.loanId);
      invariant(loan, `Renew request "${request.id}" references missing loan "${request.loanId}"`);
      invariant(loan.studentUserId === request.studentUserId, `Renew request "${request.id}" student does not match loan "${loan.id}"`);
      invariant(loan.bookId === request.bookId, `Renew request "${request.id}" book does not match loan "${loan.id}"`);
      invariant(loan.status !== 'returned', `Renew request "${request.id}" cannot target returned loan "${loan.id}"`);

      const copy = copiesById.get(loan.copyId);
      invariant(copy, `Renew request "${request.id}" loan "${loan.id}" references missing copy "${loan.copyId}"`);
      invariant(copy.branchId === request.branchId, `Renew request "${request.id}" branch does not match loan copy "${copy.id}"`);
    }
  }

  for (const loan of database.loans) {
    invariant(usersById.has(loan.studentUserId), `Loan "${loan.id}" references missing student user "${loan.studentUserId}"`);
    invariant(
      getRoleCodeByUser(usersById, rolesById, loan.studentUserId) === 'student',
      `Loan "${loan.id}" must reference a student user`,
    );
    invariant(booksById.has(loan.bookId), `Loan "${loan.id}" references missing book "${loan.bookId}"`);

    const copy = copiesById.get(loan.copyId);
    invariant(copy, `Loan "${loan.id}" references missing copy "${loan.copyId}"`);
    invariant(copy.bookId === loan.bookId, `Loan "${loan.id}" book "${loan.bookId}" does not match copy "${loan.copyId}"`);

    if (loan.status !== 'returned') {
      invariant(copy.status === 'borrowed', `Active loan "${loan.id}" requires borrowed copy "${copy.id}"`);
    }
  }

  for (const copy of database.bookCopies) {
    if (copy.status !== 'borrowed') {
      continue;
    }

    const linkedActiveLoan = activeLoans.find((loan) => loan.copyId === copy.id);
    invariant(linkedActiveLoan, `Borrowed copy "${copy.id}" must have an active loan`);
  }

  for (const history of database.loanHistories) {
    const loan = loansById.get(history.loanId);
    invariant(loan, `Loan history "${history.id}" references missing loan "${history.loanId}"`);
    invariant(booksById.has(history.bookId), `Loan history "${history.id}" references missing book "${history.bookId}"`);
    invariant(loan.bookId === history.bookId, `Loan history "${history.id}" book "${history.bookId}" does not match loan "${history.loanId}"`);

    if (history.eventType === 'borrowed' || history.eventType === 'renewed') {
      invariant(history.effectiveDueDate, `Loan history "${history.id}" must store effectiveDueDate for "${history.eventType}"`);
    }
  }

  for (const notification of database.notifications) {
    invariant(usersById.has(notification.userId), `Notification "${notification.id}" references missing user "${notification.userId}"`);

    if (notification.relatedBookId) {
      invariant(booksById.has(notification.relatedBookId), `Notification "${notification.id}" references missing book "${notification.relatedBookId}"`);
    }

    if (notification.relatedLoanId) {
      const loan = loansById.get(notification.relatedLoanId);
      invariant(loan, `Notification "${notification.id}" references missing loan "${notification.relatedLoanId}"`);
      invariant(loan.studentUserId === notification.userId, `Notification "${notification.id}" must point to a loan of user "${notification.userId}"`);

      if (notification.relatedBookId) {
        invariant(loan.bookId === notification.relatedBookId, `Notification "${notification.id}" book does not match loan "${loan.id}"`);
      }
    }

    if (notification.relatedRequestId) {
      const request = requestsById.get(notification.relatedRequestId);
      invariant(request, `Notification "${notification.id}" references missing request "${notification.relatedRequestId}"`);
      invariant(request.studentUserId === notification.userId, `Notification "${notification.id}" must point to a request of user "${notification.userId}"`);

      if (notification.relatedBookId) {
        invariant(request.bookId === notification.relatedBookId, `Notification "${notification.id}" book does not match request "${request.id}"`);
      }
    }
  }

  for (const activity of database.activityLogs) {
    invariant(branchesById.has(activity.branchId), `Activity "${activity.id}" references missing branch "${activity.branchId}"`);

    if (activity.actorUserId) {
      invariant(usersById.has(activity.actorUserId), `Activity "${activity.id}" references missing actor "${activity.actorUserId}"`);
    }

    if (activity.relatedBookId) {
      invariant(booksById.has(activity.relatedBookId), `Activity "${activity.id}" references missing book "${activity.relatedBookId}"`);
    }

    if (activity.relatedLoanId) {
      const loan = loansById.get(activity.relatedLoanId);
      invariant(loan, `Activity "${activity.id}" references missing loan "${activity.relatedLoanId}"`);

      if (activity.relatedBookId) {
        invariant(loan.bookId === activity.relatedBookId, `Activity "${activity.id}" book does not match loan "${loan.id}"`);
      }
    }

    if (activity.relatedRequestId) {
      const request = requestsById.get(activity.relatedRequestId);
      invariant(request, `Activity "${activity.id}" references missing request "${activity.relatedRequestId}"`);

      if (activity.relatedBookId) {
        invariant(request.bookId === activity.relatedBookId, `Activity "${activity.id}" book does not match request "${request.id}"`);
      }
    }
  }

  for (const job of database.reportJobs) {
    invariant(templatesById.has(job.templateId), `Report job "${job.id}" references missing template "${job.templateId}"`);
    invariant(usersById.has(job.createdByUserId), `Report job "${job.id}" references missing creator "${job.createdByUserId}"`);
  }
}

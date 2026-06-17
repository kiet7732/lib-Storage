import {
  books,
  borrowedItems,
  historyEvents,
  notifications,
  recommendedBookIds,
  studentBorrowRequests,
  studentLibrarySnapshot,
  studentProfile,
} from './library.mock';

export {
  books,
  borrowedItems,
  historyEvents,
  notifications,
  recommendedBookIds,
  studentBorrowRequests,
  studentLibrarySnapshot,
  studentProfile,
};

export function getBookById(id: string) {
  return books.find((book) => book.id === id);
}

export function getBorrowedBook(bookId: string) {
  return borrowedItems.find((item) => item.bookId === bookId);
}

export function getRecommendedBooks() {
  return recommendedBookIds
    .map((id) => books.find((book) => book.id === id))
    .filter(Boolean);
}

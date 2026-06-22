package com.libstorage.backend.feature.books;

import com.libstorage.backend.domain.book.Book;
import com.libstorage.backend.domain.book.BookRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public Page<Book> searchBooks(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return bookRepository.findAll(pageable);
        }
        return bookRepository.searchBooksByKeyword(query, pageable);
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Book not found"));
    }
}

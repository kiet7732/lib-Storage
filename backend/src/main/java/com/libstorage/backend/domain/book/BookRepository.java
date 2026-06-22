package com.libstorage.backend.domain.book;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, String> {

    Optional<Book> findByIsbn(String isbn);

    Optional<Book> findBySourceVolumeId(String sourceVolumeId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "categories")
    org.springframework.data.domain.Page<Book> findAll(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT b FROM Book b LEFT JOIN b.categories c WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.label) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "categories")
    org.springframework.data.domain.Page<Book> searchBooksByKeyword(@org.springframework.data.repository.query.Param("keyword") String keyword, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "categories")
    Optional<Book> findById(String id);
}

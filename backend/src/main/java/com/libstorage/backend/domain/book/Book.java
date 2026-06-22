package com.libstorage.backend.domain.book;

import com.libstorage.backend.domain.category.Category;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(
        name = "books",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_books_isbn", columnNames = "isbn"),
                @UniqueConstraint(name = "uk_books_source_volume_id", columnNames = "sourceVolumeId")
        }
)
public class Book {

    @Id
    @Column(nullable = false, length = 160)
    private String id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 300)
    private String author;

    @Column(nullable = false, length = 255)
    private String publisher;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, length = 32)
    private String isbn;

    @Column(nullable = false, length = 5000)
    private String summary;

    @Column(nullable = false, length = 1000)
    private String coverUrl;

    @Column(nullable = false, length = 100)
    private String source;

    @Column(nullable = false, length = 120)
    private String sourceVolumeId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "book_categories",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new LinkedHashSet<>();

    public Book() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSourceVolumeId() {
        return sourceVolumeId;
    }

    public void setSourceVolumeId(String sourceVolumeId) {
        this.sourceVolumeId = sourceVolumeId;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }
}

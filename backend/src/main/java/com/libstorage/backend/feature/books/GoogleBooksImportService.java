package com.libstorage.backend.feature.books;

import com.libstorage.backend.common.SlugUtils;
import com.libstorage.backend.config.GoogleBooksProperties;
import com.libstorage.backend.domain.book.Book;
import com.libstorage.backend.domain.book.BookRepository;
import com.libstorage.backend.domain.category.Category;
import com.libstorage.backend.domain.category.CategoryRepository;
import com.libstorage.backend.feature.books.dto.BookImportItemResponse;
import com.libstorage.backend.feature.books.dto.BookImportResponse;
import com.libstorage.backend.feature.books.google.GoogleBooksResponse;
import java.time.Year;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GoogleBooksImportService {

    private static final int GOOGLE_MAX_RESULTS = 50;
    private static final String GOOGLE_SOURCE = "google_books";

    private final RestClient restClient;
    private final GoogleBooksProperties properties;
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public GoogleBooksImportService(
            RestClient restClient,
            GoogleBooksProperties properties,
            BookRepository bookRepository,
            CategoryRepository categoryRepository
    ) {
        this.restClient = restClient;
        this.properties = properties;
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public BookImportResponse importRandomBooks(int requestedCount) {
        int safeCount = Math.max(1, Math.min(requestedCount, 100));
        List<String> shuffledQueries = new ArrayList<>(properties.getRandomQueries());
        Collections.shuffle(shuffledQueries);

        Set<String> seenIsbns = new LinkedHashSet<>();
        List<Book> importedBooks = new ArrayList<>();

        for (String query : shuffledQueries) {
            if (importedBooks.size() >= safeCount) {
                break;
            }

            int startIndex = ThreadLocalRandom.current().nextInt(0, 81);
            GoogleBooksResponse response = fetchBooks(query, startIndex);

            if (response == null || response.items() == null || response.items().isEmpty()) {
                continue;
            }

            for (GoogleBooksResponse.GoogleBookItem item : response.items()) {
                if (importedBooks.size() >= safeCount) {
                    break;
                }

                Optional<BookCandidate> candidate = toCandidate(item);

                if (candidate.isEmpty()) {
                    continue;
                }

                BookCandidate value = candidate.get();

                if (!seenIsbns.add(value.isbn())) {
                    continue;
                }

                if (bookRepository.findByIsbn(value.isbn()).isPresent()) {
                    continue;
                }

                Book saved = bookRepository.save(toEntity(value));
                importedBooks.add(saved);
            }
        }

        List<BookImportItemResponse> items = importedBooks.stream()
                .map(this::toResponse)
                .toList();

        return new BookImportResponse(
                safeCount,
                importedBooks.size(),
                (int) bookRepository.count(),
                items
        );
    }

    private GoogleBooksResponse fetchBooks(String query, int startIndex) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(properties.getBaseUrl() + "/volumes")
                .queryParam("q", query)
                .queryParam("printType", "books")
                .queryParam("langRestrict", "en")
                .queryParam("maxResults", GOOGLE_MAX_RESULTS)
                .queryParam("startIndex", startIndex);

        if (properties.getApiKey() != null && !properties.getApiKey().isBlank()) {
            builder.queryParam("key", properties.getApiKey());
        }

        return restClient.get()
                .uri(builder.build(true).toUri())
                .retrieve()
                .body(GoogleBooksResponse.class);
    }

    private Optional<BookCandidate> toCandidate(GoogleBooksResponse.GoogleBookItem item) {
        if (item == null || item.volumeInfo() == null) {
            return Optional.empty();
        }

        GoogleBooksResponse.VolumeInfo info = item.volumeInfo();
        String title = trim(info.title());
        String author = joinAuthors(info.authors());
        String publisher = trim(info.publisher());
        Integer year = parseYear(info.publishedDate());
        String isbn = extractIsbn(info.industryIdentifiers());
        String summary = sanitizeSummary(info.description());
        String coverUrl = extractCoverUrl(info.imageLinks());
        List<String> categories = sanitizeCategories(info.categories());

        if (title == null || author == null || publisher == null || year == null || isbn == null
                || summary == null || coverUrl == null || categories.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(new BookCandidate(
                item.id(),
                title,
                author,
                publisher,
                year,
                isbn,
                summary,
                coverUrl,
                categories
        ));
    }

    private Book toEntity(BookCandidate candidate) {
        Book book = new Book();
        book.setId(buildBookId(candidate.title(), candidate.isbn()));
        book.setTitle(candidate.title());
        book.setAuthor(candidate.author());
        book.setPublisher(candidate.publisher());
        book.setYear(candidate.year());
        book.setIsbn(candidate.isbn());
        book.setSummary(candidate.summary());
        book.setCoverUrl(candidate.coverUrl());
        book.setSource(GOOGLE_SOURCE);
        book.setSourceVolumeId(candidate.volumeId());
        book.setCategories(resolveCategories(candidate.categories()));
        return book;
    }

    private Set<Category> resolveCategories(Collection<String> rawCategories) {
        Set<Category> categories = new LinkedHashSet<>();

        for (String rawCategory : rawCategories) {
            String label = trim(rawCategory);

            if (label == null) {
                continue;
            }

            Category category = categoryRepository.findByLabelIgnoreCase(label)
                    .orElseGet(() -> categoryRepository.save(new Category(
                            "cat-" + SlugUtils.toSlug(label),
                            label
                    )));
            categories.add(category);
        }

        return categories;
    }

    private BookImportItemResponse toResponse(Book book) {
        List<String> categories = book.getCategories().stream()
                .map(Category::getLabel)
                .sorted(String::compareToIgnoreCase)
                .toList();

        return new BookImportItemResponse(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getPublisher(),
                book.getYear(),
                book.getIsbn(),
                book.getCoverUrl(),
                categories
        );
    }

    private String buildBookId(String title, String isbn) {
        String base = SlugUtils.toSlug(title);
        String suffix = isbn.replaceAll("[^0-9Xx]", "");
        return base + "-" + suffix;
    }

    private String joinAuthors(List<String> authors) {
        if (authors == null || authors.isEmpty()) {
            return null;
        }

        return authors.stream()
                .map(this::trim)
                .filter(value -> value != null && !value.isBlank())
                .reduce((left, right) -> left + ", " + right)
                .orElse(null);
    }

    private Integer parseYear(String publishedDate) {
        String value = trim(publishedDate);

        if (value == null || value.length() < 4) {
            return null;
        }

        try {
            int year = Integer.parseInt(value.substring(0, 4));
            int currentYear = Year.now().getValue();
            return year > 0 && year <= currentYear ? year : null;
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String extractIsbn(List<GoogleBooksResponse.IndustryIdentifier> identifiers) {
        if (identifiers == null || identifiers.isEmpty()) {
            return null;
        }

        Optional<String> isbn13 = identifiers.stream()
                .filter(identifier -> "ISBN_13".equalsIgnoreCase(identifier.type()))
                .map(GoogleBooksResponse.IndustryIdentifier::identifier)
                .map(this::trim)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();

        if (isbn13.isPresent()) {
            return isbn13.get();
        }

        return identifiers.stream()
                .filter(identifier -> "ISBN_10".equalsIgnoreCase(identifier.type()))
                .map(GoogleBooksResponse.IndustryIdentifier::identifier)
                .map(this::trim)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }

    private String sanitizeSummary(String description) {
        String value = trim(description);

        if (value == null) {
            return null;
        }

        String sanitized = value
                .replaceAll("<[^>]+>", " ")
                .replaceAll("\\s+", " ")
                .trim();

        return sanitized.isBlank() ? null : sanitized;
    }

    private String extractCoverUrl(GoogleBooksResponse.ImageLinks imageLinks) {
        if (imageLinks == null) {
            return null;
        }

        String thumbnail = trim(imageLinks.thumbnail());
        String smallThumbnail = trim(imageLinks.smallThumbnail());
        String selected = thumbnail != null ? thumbnail : smallThumbnail;

        if (selected == null) {
            return null;
        }

        return selected.replace("http://", "https://");
    }

    private List<String> sanitizeCategories(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            return List.of();
        }

        return categories.stream()
                .map(this::trim)
                .filter(value -> value != null && !value.isBlank())
                .map(value -> {
                    String[] parts = value.split("/");
                    return trim(parts[parts.length - 1]);
                })
                .filter(value -> value != null && !value.isBlank())
                .map(value -> value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1))
                .distinct()
                .toList();
    }

    private String trim(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private record BookCandidate(
            String volumeId,
            String title,
            String author,
            String publisher,
            Integer year,
            String isbn,
            String summary,
            String coverUrl,
            List<String> categories
    ) {
    }
}

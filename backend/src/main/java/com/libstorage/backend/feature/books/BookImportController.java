package com.libstorage.backend.feature.books;

import com.libstorage.backend.feature.books.dto.BookImportResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/dev/books")
public class BookImportController {

    private final GoogleBooksImportService googleBooksImportService;

    public BookImportController(GoogleBooksImportService googleBooksImportService) {
        this.googleBooksImportService = googleBooksImportService;
    }

    @PostMapping("/import/random")
    public BookImportResponse importRandomBooks(
            @RequestParam(defaultValue = "50")
            @Min(1)
            @Max(100)
            int count
    ) {
        return googleBooksImportService.importRandomBooks(count);
    }
}

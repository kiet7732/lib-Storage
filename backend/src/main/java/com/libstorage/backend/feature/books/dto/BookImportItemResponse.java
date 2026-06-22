package com.libstorage.backend.feature.books.dto;

import java.util.List;

public record BookImportItemResponse(
        String id,
        String title,
        String author,
        String publisher,
        Integer year,
        String isbn,
        String coverUrl,
        List<String> categories
) {
}

package com.libstorage.backend.feature.books.dto;

import java.util.List;

public record BookImportResponse(
        int requested,
        int imported,
        int totalStored,
        List<BookImportItemResponse> items
) {
}

package com.libstorage.backend.feature.books.google;

import java.util.List;

public record GoogleBooksResponse(
        List<GoogleBookItem> items
) {

    public record GoogleBookItem(
            String id,
            VolumeInfo volumeInfo
    ) {
    }

    public record VolumeInfo(
            String title,
            List<String> authors,
            String publisher,
            String publishedDate,
            String description,
            List<String> categories,
            List<IndustryIdentifier> industryIdentifiers,
            ImageLinks imageLinks
    ) {
    }

    public record IndustryIdentifier(
            String type,
            String identifier
    ) {
    }

    public record ImageLinks(
            String smallThumbnail,
            String thumbnail
    ) {
    }
}

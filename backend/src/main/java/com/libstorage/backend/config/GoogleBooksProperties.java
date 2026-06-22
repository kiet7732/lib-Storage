package com.libstorage.backend.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.google-books")
public class GoogleBooksProperties {

    private String baseUrl = "https://www.googleapis.com/books/v1";
    private String apiKey;
    private List<String> randomQueries = new ArrayList<>(List.of(
            "software engineering",
            "clean code",
            "design patterns",
            "machine learning",
            "deep learning",
            "data science",
            "algorithms",
            "computer networks",
            "operating systems",
            "database systems",
            "ux design",
            "product management",
            "cloud computing",
            "cyber security",
            "web development",
            "mobile development",
            "distributed systems",
            "artificial intelligence",
            "business analysis",
            "digital transformation"
    ));

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public List<String> getRandomQueries() {
        return randomQueries;
    }

    public void setRandomQueries(List<String> randomQueries) {
        this.randomQueries = randomQueries;
    }
}

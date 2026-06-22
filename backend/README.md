# Lib Storage Backend

Spring Boot backend module for:

- PostgreSQL persistence
- Keycloak JWT validation
- Book import from Google Books API

Run locally:

```bash
mvn spring-boot:run
```

Import random books:

```bash
curl -X POST "http://localhost:8088/api/dev/books/import/random?count=50"
```

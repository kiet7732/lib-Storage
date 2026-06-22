package com.libstorage.backend.domain.category;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {

    Optional<Category> findByLabelIgnoreCase(String label);
}

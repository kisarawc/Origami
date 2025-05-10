package com.origami.repository;

import com.origami.model.Badge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BadgeRepository extends MongoRepository<Badge, String> {
    // Add custom query methods if needed
} 
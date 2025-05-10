package com.origami.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.origami.model.Tutorial;

@Repository
public interface TutorialRepository extends MongoRepository<Tutorial, String> {
    // Custom query methods can be added here if needed

    List<Tutorial> findByAuthorUsername(String username);
} 
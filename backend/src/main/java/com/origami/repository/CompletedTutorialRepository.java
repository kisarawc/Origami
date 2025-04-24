package com.origami.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.origami.model.CompletedTutorial;

@Repository
public interface CompletedTutorialRepository extends MongoRepository<CompletedTutorial, String> {
    Optional<CompletedTutorial> findByUserUsernameAndTutorialId(String userUsername, String tutorialId);
    List<CompletedTutorial> findByUserUsername(String userUsername);
    boolean existsByUserUsernameAndTutorialId(String userUsername, String tutorialId);
} 
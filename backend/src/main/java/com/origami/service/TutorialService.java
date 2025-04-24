package com.origami.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.origami.model.Tutorial;
import com.origami.model.User;
import com.origami.repository.TutorialRepository;
import com.origami.repository.UserRepository;

@Service
public class TutorialService {
    
    private static final Logger logger = LoggerFactory.getLogger(TutorialService.class);
    
    @Autowired
    private TutorialRepository tutorialRepository;
    
    @Autowired
    private UserRepository userRepository;

    public List<Tutorial> getAllTutorials() {
        try {
            logger.info("Fetching all tutorials");
            List<Tutorial> tutorials = tutorialRepository.findAll();
            logger.info("Successfully fetched {} tutorials", tutorials.size());
            return tutorials;
        } catch (Exception e) {
            logger.error("Error fetching tutorials: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch tutorials: " + e.getMessage());
        }
    }

    public Optional<Tutorial> getTutorialById(String id) {
        return tutorialRepository.findById(id);
    }

    public Tutorial createTutorial(Tutorial tutorial) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            tutorial.setAuthorUsername(user.getUsername());
            tutorial.setCreatedAt(LocalDateTime.now());
            tutorial.setUpdatedAt(LocalDateTime.now());
            
            return tutorialRepository.save(tutorial);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create tutorial: " + e.getMessage());
        }
    }

    public Tutorial updateTutorial(String id, Tutorial tutorial) {
        try {
            Optional<Tutorial> existingTutorial = tutorialRepository.findById(id);
            if (existingTutorial.isPresent()) {
                Tutorial updatedTutorial = existingTutorial.get();
                updatedTutorial.setTitle(tutorial.getTitle());
                updatedTutorial.setDescription(tutorial.getDescription());
                updatedTutorial.setDifficulty(tutorial.getDifficulty());
                updatedTutorial.setCategory(tutorial.getCategory());
                updatedTutorial.setTags(tutorial.getTags());
                updatedTutorial.setFinalImage(tutorial.getFinalImage());
                updatedTutorial.setStepImages(tutorial.getStepImages());
                updatedTutorial.setUpdatedAt(LocalDateTime.now());
                return tutorialRepository.save(updatedTutorial);
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update tutorial: " + e.getMessage());
        }
    }

    public void deleteTutorial(String id) {
        try {
            tutorialRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete tutorial: " + e.getMessage());
        }
    }

    public List<Tutorial> findByAuthorUsername(String username) {
        return tutorialRepository.findByAuthorUsername(username);
    }
} 
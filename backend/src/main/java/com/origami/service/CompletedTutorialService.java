package com.origami.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.origami.model.CompletedTutorial;
import com.origami.repository.CompletedTutorialRepository;
import com.origami.repository.TutorialRepository;

@Service
public class CompletedTutorialService {
    
    private static final Logger logger = LoggerFactory.getLogger(CompletedTutorialService.class);
    
    @Autowired
    private CompletedTutorialRepository completedTutorialRepository;
    
    @Autowired
    private TutorialRepository tutorialRepository;

    public CompletedTutorial markTutorialAsCompleted(String tutorialId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Check if tutorial exists
            if (!tutorialRepository.existsById(tutorialId)) {
                throw new RuntimeException("Tutorial not found");
            }
            
            // Check if already completed
            if (completedTutorialRepository.existsByUserUsernameAndTutorialId(username, tutorialId)) {
                throw new RuntimeException("Tutorial already completed");
            }
            
            CompletedTutorial completedTutorial = new CompletedTutorial();
            completedTutorial.setUserUsername(username);
            completedTutorial.setTutorialId(tutorialId);
            completedTutorial.setCompletedAt(LocalDateTime.now());
            
            return completedTutorialRepository.save(completedTutorial);
        } catch (Exception e) {
            logger.error("Error marking tutorial as completed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to mark tutorial as completed: " + e.getMessage());
        }
    }

    public boolean isTutorialCompleted(String tutorialId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Check if tutorial exists
            if (!tutorialRepository.existsById(tutorialId)) {
                throw new RuntimeException("Tutorial not found");
            }
            
            return completedTutorialRepository.existsByUserUsernameAndTutorialId(username, tutorialId);
        } catch (Exception e) {
            logger.error("Error checking tutorial completion status: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to check tutorial completion status: " + e.getMessage());
        }
    }

    public List<CompletedTutorial> getCompletedTutorials() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return completedTutorialRepository.findByUserUsername(username);
        } catch (Exception e) {
            logger.error("Error fetching completed tutorials: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch completed tutorials: " + e.getMessage());
        }
    }
} 
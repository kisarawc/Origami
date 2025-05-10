package com.origami.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.origami.model.Tutorial;
import com.origami.service.TutorialService;

@RestController
@RequestMapping("/api/v1/tutorials")
@CrossOrigin(origins = "http://localhost:5173")
public class TutorialController {

    private static final Logger logger = LoggerFactory.getLogger(TutorialController.class);

    @Autowired
    private TutorialService tutorialService;

    @GetMapping
    public ResponseEntity<List<Tutorial>> getAllTutorials() {
        try {
            logger.info("Received request to fetch all tutorials");
            List<Tutorial> tutorials = tutorialService.getAllTutorials();
            logger.info("Successfully retrieved {} tutorials", tutorials.size());
            return ResponseEntity.ok(tutorials);
        } catch (Exception e) {
            logger.error("Error in getAllTutorials endpoint: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tutorial> getTutorialById(@PathVariable String id) {
        return tutorialService.getTutorialById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Tutorial> createTutorial(@RequestBody Tutorial tutorial) {
        return ResponseEntity.ok(tutorialService.createTutorial(tutorial));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Tutorial> updateTutorial(@PathVariable String id, @RequestBody Tutorial tutorial) {
        Tutorial updatedTutorial = tutorialService.updateTutorial(id, tutorial);
        return updatedTutorial != null ? ResponseEntity.ok(updatedTutorial) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTutorial(@PathVariable String id) {
        tutorialService.deleteTutorial(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-tutorials")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Tutorial>> getMyTutorials() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(tutorialService.findByAuthorUsername(username));
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Tutorial>> getTutorialsByUsername(@PathVariable String username) {
        try {
            logger.info("Fetching tutorials for user: {}", username);
            List<Tutorial> tutorials = tutorialService.findByAuthorUsername(username);
            logger.info("Found {} tutorials for user {}", tutorials.size(), username);
            return ResponseEntity.ok(tutorials);
        } catch (Exception e) {
            logger.error("Error fetching tutorials for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
package com.origami.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.origami.model.CompletedTutorial;
import com.origami.service.CompletedTutorialService;

@RestController
@RequestMapping("/api/v1/completed-tutorials")
@CrossOrigin(origins = "http://localhost:5173")
public class CompletedTutorialController {

    private static final Logger logger = LoggerFactory.getLogger(CompletedTutorialController.class);

    @Autowired
    private CompletedTutorialService completedTutorialService;

    @PostMapping("/{tutorialId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markTutorialAsCompleted(@PathVariable String tutorialId) {
        try {
            CompletedTutorial completedTutorial = completedTutorialService.markTutorialAsCompleted(tutorialId);
            return ResponseEntity.ok(completedTutorial);
        } catch (RuntimeException e) {
            logger.error("Error in markTutorialAsCompleted endpoint: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in markTutorialAsCompleted endpoint: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body("An unexpected error occurred");
        }
    }

    @GetMapping("/{tutorialId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> isTutorialCompleted(@PathVariable String tutorialId) {
        try {
            boolean isCompleted = completedTutorialService.isTutorialCompleted(tutorialId);
            return ResponseEntity.ok(isCompleted);
        } catch (RuntimeException e) {
            logger.error("Error in isTutorialCompleted endpoint: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in isTutorialCompleted endpoint: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body("An unexpected error occurred");
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCompletedTutorials() {
        try {
            return ResponseEntity.ok(completedTutorialService.getCompletedTutorials());
        } catch (RuntimeException e) {
            logger.error("Error in getCompletedTutorials endpoint: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in getCompletedTutorials endpoint: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body("An unexpected error occurred");
        }
    }
} 
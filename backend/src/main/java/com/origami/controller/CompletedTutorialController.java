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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.origami.dto.ImageComparisonRequest;
import com.origami.dto.ImageComparisonResponse;
import com.origami.model.CompletedTutorial;
import com.origami.service.CompletedTutorialService;

import java.util.List;

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

    /**
     * Get all completed tutorials for the social feed
     * @return List of all completed tutorials
     */
    @GetMapping("/feed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllCompletedTutorials() {
        try {
            return ResponseEntity.ok(completedTutorialService.getAllCompletedTutorials());
        } catch (RuntimeException e) {
            logger.error("Error in getAllCompletedTutorials endpoint: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in getAllCompletedTutorials endpoint: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body("An unexpected error occurred");
        }
    }

    /**
     * Get completed tutorials by username
     * @param username Username to get completed tutorials for
     * @return List of completed tutorials for the specified user
     */
    @GetMapping("/user/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCompletedTutorialsByUsername(@PathVariable String username) {
        try {
            logger.info("Fetching completed tutorials for user: {}", username);
            List<CompletedTutorial> completedTutorials = completedTutorialService.getCompletedTutorialsByUsername(username);
            logger.info("Found {} completed tutorials for user {}", completedTutorials.size(), username);
            return ResponseEntity.ok(completedTutorials);
        } catch (RuntimeException e) {
            logger.error("Error in getCompletedTutorialsByUsername endpoint: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in getCompletedTutorialsByUsername endpoint: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body("An unexpected error occurred");
        }
    }

    /**
     * Compare user's uploaded image with the tutorial's final image
     * @param tutorialId Tutorial ID
     * @param request Request containing the user's uploaded image
     * @return Response with match result and similarity score
     */
    @PostMapping(path = "/{tutorialId}/compare", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> compareImages(@PathVariable("tutorialId") String tutorialId, @RequestBody ImageComparisonRequest request) {
        try {
            logger.info("Received image comparison request for tutorial ID: {}", tutorialId);

            if (request == null) {
                logger.error("Request body is null");
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("Request body is required");
            }

            if (request.getUserImage() == null || request.getUserImage().isEmpty()) {
                logger.error("User image is null or empty");
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("User image is required");
            }

            ImageComparisonResponse response = completedTutorialService.compareImages(tutorialId, request.getUserImage());
            logger.info("Image comparison completed with result: isMatch={}, score={}", response.isMatch(), response.getSimilarityScore());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error in compareImages endpoint: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in compareImages endpoint: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body("An unexpected error occurred: " + e.getMessage());
        }
    }
}
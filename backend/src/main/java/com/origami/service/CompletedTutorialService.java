package com.origami.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.origami.dto.ImageComparisonResponse;
import com.origami.model.CompletedTutorial;
import com.origami.model.Tutorial;
import com.origami.repository.CompletedTutorialRepository;
import com.origami.repository.TutorialRepository;

@Service
public class CompletedTutorialService {

    private static final Logger logger = LoggerFactory.getLogger(CompletedTutorialService.class);

    @Autowired
    private CompletedTutorialRepository completedTutorialRepository;

    @Autowired
    private TutorialRepository tutorialRepository;

    @Autowired
    private SimpleImageComparisonService imageComparisonService;

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

            // Get the tutorial to get its details
            Tutorial tutorial = tutorialRepository.findById(tutorialId)
                .orElseThrow(() -> new RuntimeException("Tutorial not found"));

            CompletedTutorial completedTutorial = new CompletedTutorial();
            completedTutorial.setUserUsername(username);
            completedTutorial.setTutorialId(tutorialId);
            completedTutorial.setTutorialTitle(tutorial.getTitle());
            completedTutorial.setTutorialDifficulty(tutorial.getDifficulty());
            completedTutorial.setTutorialCategory(tutorial.getCategory());
            completedTutorial.setTutorialAuthorUsername(tutorial.getAuthorUsername());
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

    /**
     * Compare user's uploaded image with the tutorial's final image
     * @param tutorialId Tutorial ID
     * @param userImageBase64 User's uploaded image as Base64 string
     * @return ImageComparisonResponse with match result and similarity score
     */
    public ImageComparisonResponse compareImages(String tutorialId, String userImageBase64) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            // Check if tutorial exists
            Tutorial tutorial = tutorialRepository.findById(tutorialId)
                .orElseThrow(() -> new RuntimeException("Tutorial not found"));

            // Get the tutorial's final image
            String finalImageBase64 = tutorial.getFinalImage();
            if (finalImageBase64 == null || finalImageBase64.isEmpty()) {
                throw new RuntimeException("Tutorial does not have a final image");
            }

            // Compare the images using the simple comparison service
            double similarityScore = imageComparisonService.compareImages(finalImageBase64, userImageBase64);
            boolean isMatch = imageComparisonService.isMatch(similarityScore);

            logger.info("Image comparison result: similarity={}, isMatch={}, tutorial={}, user={}",
                    similarityScore, isMatch, tutorialId, username);

            // Only save completion if it's a true match (meets the threshold in SimpleImageComparisonService)
            // We no longer allow high similarity to count as a match
            boolean shouldSaveCompletion = isMatch;

            // The response match result should exactly match our isMatch determination
            boolean responseIsMatch = isMatch;

            // Save the completion only if it meets our criteria
            if (shouldSaveCompletion && !completedTutorialRepository.existsByUserUsernameAndTutorialId(username, tutorialId)) {
                CompletedTutorial completedTutorial = new CompletedTutorial();
                completedTutorial.setUserUsername(username);
                completedTutorial.setTutorialId(tutorialId);
                completedTutorial.setTutorialTitle(tutorial.getTitle());
                completedTutorial.setTutorialDifficulty(tutorial.getDifficulty());
                completedTutorial.setTutorialCategory(tutorial.getCategory());
                completedTutorial.setTutorialAuthorUsername(tutorial.getAuthorUsername());
                completedTutorial.setCompletionImage(userImageBase64);
                completedTutorial.setCompletedAt(LocalDateTime.now());
                completedTutorialRepository.save(completedTutorial);

                logger.info("Tutorial completion saved with similarity score: {}", similarityScore);
            } else {
                logger.info("Tutorial completion not saved due to low similarity: {}. isMatch={}", similarityScore, isMatch);

                // Check if the tutorial is already marked as completed
                boolean alreadyCompleted = completedTutorialRepository.existsByUserUsernameAndTutorialId(username, tutorialId);
                if (alreadyCompleted) {
                    logger.info("Tutorial is already marked as completed in the database for user: {}, tutorial: {}",
                                username, tutorialId);
                }
            }

            // Return the adjusted match result
            return new ImageComparisonResponse(responseIsMatch, similarityScore);
        } catch (Exception e) {
            logger.error("Error comparing images: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to compare images: " + e.getMessage());
        }
    }

    /**
     * Get all completed tutorials for the social feed
     * @return List of all completed tutorials
     */
    public List<CompletedTutorial> getAllCompletedTutorials() {
        try {
            return completedTutorialRepository.findAll();
        } catch (Exception e) {
            logger.error("Error fetching all completed tutorials: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch all completed tutorials: " + e.getMessage());
        }
    }

    /**
     * Get completed tutorials by username
     * @param username Username to get completed tutorials for
     * @return List of completed tutorials for the specified user
     */
    public List<CompletedTutorial> getCompletedTutorialsByUsername(String username) {
        try {
            logger.info("Fetching completed tutorials for user: {}", username);
            List<CompletedTutorial> completedTutorials = completedTutorialRepository.findByUserUsername(username);
            logger.info("Found {} completed tutorials for user {}", completedTutorials.size(), username);
            return completedTutorials;
        } catch (Exception e) {
            logger.error("Error fetching completed tutorials for user {}: {}", username, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch completed tutorials for user: " + e.getMessage());
        }
    }
}
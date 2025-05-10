package com.origami.service;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * An improved image comparison service that uses multiple techniques for better accuracy
 */
@Service
public class SimpleImageComparisonService {

    private static final Logger logger = LoggerFactory.getLogger(SimpleImageComparisonService.class);
    private static final double SIMILARITY_THRESHOLD = 0.65; // 65% similarity threshold - must match frontend
    private static final int RESIZE_WIDTH = 200;
    private static final int RESIZE_HEIGHT = 200;
    private static final int HISTOGRAM_BINS = 64; // Number of bins for histogram comparison

    /**
     * Compare two images and return a similarity score
     * @param referenceImageBase64 Base64 encoded reference image
     * @param userImageBase64 Base64 encoded user image
     * @return Similarity score between 0 and 1
     */
    public double compareImages(String referenceImageBase64, String userImageBase64) {
        try {
            // Remove data URL prefix if present
            String cleanedReferenceImage = cleanBase64(referenceImageBase64);
            String cleanedUserImage = cleanBase64(userImageBase64);

            // Convert Base64 to BufferedImage
            BufferedImage referenceImage = base64ToBufferedImage(cleanedReferenceImage);
            BufferedImage userImage = base64ToBufferedImage(cleanedUserImage);

            if (referenceImage == null || userImage == null) {
                logger.error("Failed to convert Base64 to BufferedImage");
                return 0.0;
            }

            // Resize images to the same dimensions for comparison
            BufferedImage resizedReferenceImage = resizeImage(referenceImage, RESIZE_WIDTH, RESIZE_HEIGHT);
            BufferedImage resizedUserImage = resizeImage(userImage, RESIZE_WIDTH, RESIZE_HEIGHT);

            // Convert to grayscale for edge detection
            BufferedImage grayReferenceImage = convertToGrayscale(resizedReferenceImage);
            BufferedImage grayUserImage = convertToGrayscale(resizedUserImage);

            // Apply edge detection
            BufferedImage edgeReferenceImage = detectEdges(grayReferenceImage);
            BufferedImage edgeUserImage = detectEdges(grayUserImage);

            // Calculate similarity using multiple methods and combine the results
            double histogramSimilarity = compareHistograms(resizedReferenceImage, resizedUserImage);
            double edgeSimilarity = compareEdgeImages(edgeReferenceImage, edgeUserImage);
            double colorSimilarity = compareAverageColors(resizedReferenceImage, resizedUserImage);

            // Weight the different similarity measures
            // Edge similarity is important for origami shape comparison, but we'll be more lenient
            // Reduce edge weight and increase color/histogram weights for better matching
            double weightedSimilarity = (histogramSimilarity * 0.2) + (edgeSimilarity * 0.6) + (colorSimilarity * 0.2);

            logger.info("Similarity scores - Histogram: {}, Edge: {}, Color: {}, Weighted: {}",
                    histogramSimilarity, edgeSimilarity, colorSimilarity, weightedSimilarity);

            return weightedSimilarity;
        } catch (Exception e) {
            logger.error("Error comparing images: {}", e.getMessage(), e);
            return 0.0;
        }
    }

    /**
     * Check if the similarity score is above the threshold
     * @param similarityScore Similarity score between 0 and 1
     * @return true if the score is above the threshold
     */
    public boolean isMatch(double similarityScore) {
        boolean result = similarityScore >= SIMILARITY_THRESHOLD;
        logger.info("Checking if similarity score {} is a match (threshold: {}): {}",
                    Math.round(similarityScore * 100),
                    Math.round(SIMILARITY_THRESHOLD * 100),
                    result);
        return result;
    }

    /**
     * Clean Base64 string by removing data URL prefix if present
     * @param base64 Base64 encoded string
     * @return Cleaned Base64 string
     */
    private String cleanBase64(String base64) {
        if (base64 == null) {
            return "";
        }
        if (base64.contains(",")) {
            return base64.split(",")[1];
        }
        return base64;
    }

    /**
     * Convert Base64 string to BufferedImage
     * @param base64 Base64 encoded string
     * @return BufferedImage
     */
    private BufferedImage base64ToBufferedImage(String base64) {
        try {
            byte[] imageBytes = Base64.getDecoder().decode(base64);
            ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes);
            return ImageIO.read(bis);
        } catch (IOException e) {
            logger.error("Error converting Base64 to BufferedImage: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Resize an image to the specified width and height
     * @param original Original image
     * @param width Target width
     * @param height Target height
     * @return Resized image
     */
    private BufferedImage resizeImage(BufferedImage original, int width, int height) {
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.drawImage(original, 0, 0, width, height, null);
        g.dispose();
        return resized;
    }

    /**
     * Convert an image to grayscale
     * @param image Input image
     * @return Grayscale image
     */
    private BufferedImage convertToGrayscale(BufferedImage image) {
        BufferedImage result = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = result.createGraphics();
        g.drawImage(image, 0, 0, null);
        g.dispose();
        return result;
    }

    /**
     * Apply edge detection to an image using a simple Sobel filter
     * @param image Input grayscale image
     * @return Edge-detected image
     */
    private BufferedImage detectEdges(BufferedImage image) {
        // Simple Sobel edge detection
        float[] sobelX = {
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        };

        float[] sobelY = {
            -1, -2, -1,
             0,  0,  0,
             1,  2,  1
        };

        BufferedImage resultX = applyConvolution(image, sobelX);
        BufferedImage resultY = applyConvolution(image, sobelY);

        // Combine X and Y gradients
        BufferedImage result = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_BYTE_GRAY);

        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int gx = new Color(resultX.getRGB(x, y)).getRed();
                int gy = new Color(resultY.getRGB(x, y)).getRed();

                // Calculate gradient magnitude
                int magnitude = (int) Math.min(255, Math.sqrt(gx * gx + gy * gy));

                // Apply threshold to create binary edge image
                // Use a lower threshold to be more lenient with edge detection
                int edgeValue = magnitude > 30 ? 255 : 0;

                Color edgeColor = new Color(edgeValue, edgeValue, edgeValue);
                result.setRGB(x, y, edgeColor.getRGB());
            }
        }

        return result;
    }

    /**
     * Apply convolution to an image
     * @param image Input image
     * @param kernel Convolution kernel
     * @return Convolved image
     */
    private BufferedImage applyConvolution(BufferedImage image, float[] kernel) {
        Kernel k = new Kernel(3, 3, kernel);
        ConvolveOp op = new ConvolveOp(k, ConvolveOp.EDGE_NO_OP, null);
        return op.filter(image, null);
    }

    /**
     * Compare edge-detected images
     * @param img1 First edge image
     * @param img2 Second edge image
     * @return Similarity score between 0 and 1
     */
    private double compareEdgeImages(BufferedImage img1, BufferedImage img2) {
        int width = img1.getWidth();
        int height = img1.getHeight();
        int matchingPixels = 0;
        int totalEdgePixels = 0;
        int edgePixelsInRef = 0;
        int edgePixelsInUser = 0;

        // First pass: count edge pixels in both images
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                boolean isEdgeInRef = new Color(img1.getRGB(x, y)).getRed() > 128;
                boolean isEdgeInUser = new Color(img2.getRGB(x, y)).getRed() > 128;

                if (isEdgeInRef) edgePixelsInRef++;
                if (isEdgeInUser) edgePixelsInUser++;

                // If both are edges or both are not edges
                if (isEdgeInRef == isEdgeInUser) {
                    matchingPixels++;
                }

                // Count total edge pixels for IoU calculation
                if (isEdgeInRef || isEdgeInUser) {
                    totalEdgePixels++;
                }
            }
        }

        // Calculate basic pixel matching ratio
        double pixelMatchRatio = (double) matchingPixels / (width * height);

        // Calculate edge count similarity (penalize if edge counts differ significantly)
        double edgeCountRatio = 0.0;
        if (edgePixelsInRef > 0 && edgePixelsInUser > 0) {
            edgeCountRatio = Math.min(edgePixelsInRef, edgePixelsInUser) /
                             (double) Math.max(edgePixelsInRef, edgePixelsInUser);
        }

        // Calculate Intersection over Union for edges
        double iou = 0.0;
        if (totalEdgePixels > 0) {
            int intersection = matchingPixels - ((width * height) - totalEdgePixels);
            if (intersection < 0) intersection = 0;
            iou = (double) intersection / totalEdgePixels;
        }

        // Combine metrics with more balanced weights to be more lenient
        // Reduce emphasis on IoU which is stricter for shape matching
        return (pixelMatchRatio * 0.4) + (edgeCountRatio * 0.3) + (iou * 0.3);
    }

    /**
     * Compare images using color histograms
     * @param img1 First image
     * @param img2 Second image
     * @return Similarity score between 0 and 1
     */
    private double compareHistograms(BufferedImage img1, BufferedImage img2) {
        // Calculate histograms
        int[] hist1 = calculateHistogram(img1);
        int[] hist2 = calculateHistogram(img2);

        // Calculate histogram intersection
        double intersection = 0;
        double sum1 = 0;
        double sum2 = 0;

        for (int i = 0; i < hist1.length; i++) {
            intersection += Math.min(hist1[i], hist2[i]);
            sum1 += hist1[i];
            sum2 += hist2[i];
        }

        // Normalize the intersection
        if (sum1 == 0 || sum2 == 0) {
            return 0.0;
        }

        return (2 * intersection) / (sum1 + sum2);
    }

    /**
     * Calculate color histogram for an image
     * @param img Input image
     * @return Histogram as an array
     */
    private int[] calculateHistogram(BufferedImage img) {
        int[] histogram = new int[HISTOGRAM_BINS];
        int width = img.getWidth();
        int height = img.getHeight();

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                Color color = new Color(img.getRGB(x, y));

                // Calculate bin index (simplified RGB binning)
                int r = color.getRed() * 4 / 256;   // 0-3
                int g = color.getGreen() * 4 / 256; // 0-3
                int b = color.getBlue() * 4 / 256;  // 0-3

                int bin = (r * 16) + (g * 4) + b;
                histogram[bin]++;
            }
        }

        return histogram;
    }

    /**
     * Compare images by average color
     * @param img1 First image
     * @param img2 Second image
     * @return Similarity score between 0 and 1
     */
    private double compareAverageColors(BufferedImage img1, BufferedImage img2) {
        // Calculate average RGB values for both images
        int[] avgColor1 = calculateAverageColor(img1);
        int[] avgColor2 = calculateAverageColor(img2);

        // Calculate color distance (Euclidean distance in RGB space)
        double distance = Math.sqrt(
            Math.pow(avgColor1[0] - avgColor2[0], 2) +
            Math.pow(avgColor1[1] - avgColor2[1], 2) +
            Math.pow(avgColor1[2] - avgColor2[2], 2)
        );

        // Normalize distance to a similarity score between 0 and 1
        // Max possible distance in RGB space is sqrt(255^2 + 255^2 + 255^2) = 441.67
        double maxDistance = Math.sqrt(3 * Math.pow(255, 2));
        double similarity = 1 - (distance / maxDistance);

        return similarity;
    }

    /**
     * Calculate the average RGB values for an image
     * @param img Image
     * @return Array of average RGB values [r, g, b]
     */
    private int[] calculateAverageColor(BufferedImage img) {
        long sumR = 0, sumG = 0, sumB = 0;
        int width = img.getWidth();
        int height = img.getHeight();
        int pixelCount = width * height;

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int rgb = img.getRGB(x, y);
                Color color = new Color(rgb);

                sumR += color.getRed();
                sumG += color.getGreen();
                sumB += color.getBlue();
            }
        }

        return new int[] {
            (int)(sumR / pixelCount),
            (int)(sumG / pixelCount),
            (int)(sumB / pixelCount)
        };
    }
}

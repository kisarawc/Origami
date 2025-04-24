package com.origami.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Data;

@Data
@Document(collection = "tutorials")
public class Tutorial {
    @Id
    private String id;
    private String title;
    private String description;
    private String difficulty;
    private String category;
    private List<String> tags;
    
    @Field("final_image")
    private String finalImage;  // Base64 encoded image
    
    @Field("step_images")
    private List<String> stepImages;  // List of Base64 encoded images
    
    @Field("author_username")
    private String authorUsername;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
} 
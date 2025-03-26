package com.origami.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "tutorials")
public class Tutorial {
    @Id
    private String id;
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private List<Step> steps = new ArrayList<>();
    private List<String> materials = new ArrayList<>();
    private Integer timeEstimate;
    
    @DBRef
    private User author;
    
    @DBRef
    private List<User> likes = new ArrayList<>();
    
    private List<Comment> comments = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Data
class Step {
    private Integer stepNumber;
    private String description;
    private String image;
}

@Data
class Comment {
    @DBRef
    private User user;
    private String text;
    private LocalDateTime createdAt;
} 
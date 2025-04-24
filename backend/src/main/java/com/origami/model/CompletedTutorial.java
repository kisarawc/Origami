package com.origami.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Data;

@Data
@Document(collection = "completed_tutorials")
public class CompletedTutorial {
    @Id
    private String id;
    
    @Field("user_username")
    private String userUsername;
    
    @Field("tutorial_id")
    private String tutorialId;
    
    @Field("completed_at")
    private LocalDateTime completedAt;
} 
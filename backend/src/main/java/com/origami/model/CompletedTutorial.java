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

    @Field("tutorial_title")
    private String tutorialTitle;

    @Field("tutorial_difficulty")
    private String tutorialDifficulty;

    @Field("tutorial_category")
    private String tutorialCategory;

    @Field("tutorial_author_username")
    private String tutorialAuthorUsername;

    @Field("completion_image")
    private String completionImage;

    @Field("completed_at")
    private LocalDateTime completedAt;
}
package com.origami.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "follow_requests")
public class FollowRequest {
    @Id
    private String id;
    private String followerId; // ObjectId of the follower
    private String followerUsername; // For display purposes
    private String followerAvatar; // For display purposes
    private String followedId; // ObjectId of the followed user
    private String status; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 
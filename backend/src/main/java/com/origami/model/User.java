package com.origami.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private String name;
    private String bio;
    private String avatarUrl;
    private UserStats stats;
    private List<Badge> badges;
    private List<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 
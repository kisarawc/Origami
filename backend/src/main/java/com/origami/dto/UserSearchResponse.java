package com.origami.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSearchResponse {
    private String id;
    private String username;
    private String name;
    private String avatarUrl;
    private String bio;
} 
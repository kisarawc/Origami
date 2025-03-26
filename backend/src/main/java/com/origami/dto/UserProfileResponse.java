package com.origami.dto;

import com.origami.model.Badge;
import com.origami.model.UserStats;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String username;
    private String name;
    private String bio;
    private String avatarUrl;
    private UserStats stats;
    private List<Badge> badges;
} 
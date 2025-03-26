package com.origami.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStats {
    private int creationsCount;
    private int followersCount;
    private int followingCount;
} 
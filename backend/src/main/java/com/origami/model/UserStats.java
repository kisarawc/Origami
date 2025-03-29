package com.origami.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStats {
    private int creations;
    private int followers;
    private int following;
    private int likes;
    private int comments;
    private int shares;
} 
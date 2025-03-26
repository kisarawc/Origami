package com.origami.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {
    private String id;
    private String name;
    private String icon;
    private String description;
    private LocalDateTime earnedAt;
} 
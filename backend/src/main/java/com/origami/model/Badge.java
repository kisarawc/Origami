package com.origami.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "badges")
public class Badge {
    @Id
    private String id;
    private String name;
    private String icon;
    private String description;
    private BadgeCriteria criteria;
    private LocalDateTime earnedAt;

    @Data
    public static class Criteria {
        private String type;
        private int count;
    }
} 
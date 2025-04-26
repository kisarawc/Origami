package com.origami.model;

import java.time.LocalDateTime;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document
public class Comment {
    @Id
    private String id;
    private ObjectId postId; 
    private ObjectId createdBy;
    private LocalDateTime createdDate;
    private String text;
    
}
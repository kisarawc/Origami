package com.origami.model;

import java.util.Date;
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
public class Notification {

    @Id
    private String id;

    private ObjectId recipientId;   // User who receives the notification
    private ObjectId triggeredBy;   // User who caused the notification
    private String type;            // e.g. "comment", "like", etc.
    private String message;
    private ObjectId postId;        // Related post (optional)
    private ObjectId commentId;
    
    private Boolean read;           // ✅ status: read/unread
    private Date createdDate;

    private String username;        // Triggering user's name
}

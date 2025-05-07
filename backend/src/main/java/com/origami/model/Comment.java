package com.origami.model;

import java.time.LocalDateTime;
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
public class Comment {
    @Id
    private String id;
    private ObjectId postId; 
    private ObjectId createdBy;
    private Date createdDate;
    private String text;
    private ObjectId parentCommentId; // ✅ NEW: for nested comments (replies)
    private int likeCount; // ✅ NEW: Track number of likes
    private String username; // ✅ NEW: Store username
    private String userAvatar; // ✅ NEW: Store user avatar URL

    // ✅ NEW: Getter and setter for likeCount
    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }
}

package com.origami.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private String id;
    private String title;
    private String description;
    private List<String> imageUrls;
    private String videoUrl;
    private String userName;
    private String avatarUrl;
    private Date createdAt;
    private Date updatedAt;

    
}

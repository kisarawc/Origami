package com.origami.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.origami.dto.PostResponse;
import com.origami.model.Post;
import com.origami.model.User;
import com.origami.repository.PostRepository;
import com.origami.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;


    public List<PostResponse> getAllPosts(String currentUserId) {
        List<Post> posts = postRepository.findAll();
        return posts.stream().map(post -> {
            User user = userRepository.findById(post.getUserId()).orElse(null);
            return PostResponse.builder()
                    .id(post.getId())
                    .title(post.getTitle())
                    .description(post.getDescription())
                    .imageUrls(post.getImageUrls())
                    .videoUrl(post.getVideoUrl())
                    .userName(user != null ? user.getUsername() : "Unknown User")
                    .avatarUrl(user != null ? user.getAvatarUrl() : "")
                    .createdAt(post.getCreatedAt())
                    .updatedAt(post.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }
   
    public PostResponse getPostResponseById(String id, String currentUserId) {
        Post post = getPostById(id);
        User user = userRepository.findById(post.getUserId()).orElse(null);
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .imageUrls(post.getImageUrls())
                .videoUrl(post.getVideoUrl())
                .userName(user != null ? user.getUsername() : "Unknown User")
                .avatarUrl(user != null ? user.getAvatarUrl() : "")
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    public UserRepository getUserRepository() {
        return userRepository;
    }


    
    public Post getPostById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }

    public List<Post> getPostsByUserId(String userId) {
        return postRepository.findByUserId(userId);
    }

    public Post createPostWithMedia(String username, String title, String description, List<MultipartFile> images, MultipartFile video)
    throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + username));

        List<String> imageUrls = new ArrayList<>();
        String videoUrl = null;

        try {
            if (images != null && images.size() > 0) {
                if (images.size() > 3) {
                    throw new RuntimeException("Cannot upload more than 3 images.");
                }
                for (MultipartFile image : images) {
                    var fileId = gridFsTemplate.store(image.getInputStream(), image.getOriginalFilename(), image.getContentType());
                    imageUrls.add("http://localhost:8081/api/v1/posts/media/" + fileId.toString());
                }
            }

            if (video != null) {
                var videoId = gridFsTemplate.store(video.getInputStream(), video.getOriginalFilename(), video.getContentType());
                videoUrl = "http://localhost:8081/api/v1/posts/media/" + videoId.toString();
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload media files.", e);
        }

        Post post = Post.builder()
                .userId(user.getId())
                .userName(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .title(title)
                .description(description)
                .imageUrls(imageUrls)
                .videoUrl(videoUrl)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        return postRepository.save(post);
    }

    public ResponseEntity<?> getMediaById(String id) {
        try {
            GridFSFile file = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(id)));

            if (file == null) {
                return ResponseEntity.notFound().build();
            }

            GridFsResource resource = gridFsOperations.getResource(file);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(resource.getContentType() != null ?
                    MediaType.parseMediaType(resource.getContentType()) :
                    MediaType.APPLICATION_OCTET_STREAM);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new InputStreamResource(resource.getInputStream()));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to load media: " + e.getMessage());
        }
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }
} 


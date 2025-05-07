package com.origami.controller;

import com.origami.dto.PostResponse;
import com.origami.model.Post;
import com.origami.model.User;
import com.origami.service.PostService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;;

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(Authentication authentication) {
        String username = authentication.getName();
        User user = postService.getUserRepository().findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(postService.getAllPosts(user.getId()));
    }

    

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable String id, Authentication authentication) {
        String username = authentication.getName();
        User user = postService.getUserRepository().findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(postService.getPostResponseById(id, user.getId()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    @PostMapping("/upload")
    public ResponseEntity<Post> createPostWithMedia(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(required = false) MultipartFile video,
            Authentication authentication
    )throws IOException {
        String username = authentication.getName();
        Post createdPost = postService.createPostWithMedia(username, title, description, images, video);
        return ResponseEntity.ok(createdPost);
    }

   

    @GetMapping("/media/{id}")
    public ResponseEntity<?> getMedia(@PathVariable String id) {
        return postService.getMediaById(id);
     }

     
     @PutMapping("/{id}")
    public ResponseEntity<Post> updatePostWithMedia(
            @PathVariable String id,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(required = false) MultipartFile video
    ) {
        Post updatedPost = postService.updatePostWithMedia(id, title, description, images, video);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

} 


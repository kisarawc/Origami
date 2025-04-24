package com.origami.service;

import com.origami.model.Post;
import com.origami.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

   

    public Post getPostById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public Post updatePost(String id, Post post) {
        Post existingPost = getPostById(id);
        existingPost.setTitle(post.getTitle());
        existingPost.setDescription(post.getDescription());
        existingPost.setImageUrls(post.getImageUrls());
        existingPost.setVideoUrl(post.getVideoUrl());
        return postRepository.save(existingPost);
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }
} 


package com.origami.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.origami.model.Comment;
import com.origami.service.CommentService;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    CommentService commentService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public Comment createComment(@RequestBody Comment comment) {
        return commentService.createComment(comment);
    }

    @GetMapping("/fetch/all")
    public List<Comment> getAllComment() {
        return commentService.getAllComment();
    }

    @GetMapping("/fetch/{id}")
    public Comment getCommentById(@PathVariable("id") String id) {
        return commentService.getCommentById(id);
    }

    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable("postId") String postId) {
        return commentService.getCommentsByPostId(postId);
    }

    @GetMapping("/user/{userId}")
    public List<Comment> getCommentsByUserId(@PathVariable("userId") String userId) {
        return commentService.getCommentsByUserId(new ObjectId(userId));
    }

    @PutMapping("/update")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Comment updateComment(@RequestBody Comment comment) {
        return commentService.updateComment(comment);
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable("id") String id) {
        commentService.deleteComment(id);
    }

    // ✅ NEW: Get the user ID who created a specific comment
    @GetMapping("/user-id/{id}")
    public Map<String, String> getUserIdByCommentId(@PathVariable("id") String id) {
        Comment comment = commentService.getCommentById(id);

        if (comment != null && comment.getCreatedBy() != null) {
            Map<String, String> response = new HashMap<>();
            response.put("userId", comment.getCreatedBy().toHexString());
            return response;
        } else {
            throw new RuntimeException("Comment not found or createdBy is missing");
        }
    }

    // ✅✅ NEW: Get Replies for a Comment
    @GetMapping("/replies/{parentCommentId}")
    public List<Comment> getReplies(@PathVariable("parentCommentId") String parentCommentId) {
        return commentService.getReplies(new ObjectId(parentCommentId));
    }

    // ✅ NEW: Get user information for a specific comment
    @GetMapping("/user-info/{commentId}")
    public Map<String, String> getUserInfoByCommentId(@PathVariable("commentId") String commentId) {
        return commentService.getUserInfoByCommentId(commentId);
    }

    // ✅ NEW: Like a comment
    @PostMapping("/{commentId}/like")
    @ResponseStatus(HttpStatus.OK)
    public void likeComment(@PathVariable("commentId") String commentId) {
        commentService.likeComment(commentId);
    }

    // ✅ NEW: Unlike a comment
    @PostMapping("/{commentId}/unlike")
    @ResponseStatus(HttpStatus.OK)
    public void unlikeComment(@PathVariable("commentId") String commentId) {
        commentService.unlikeComment(commentId);
    }
}

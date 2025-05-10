package com.origami.service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.origami.exception.CommentNotFoundException;
import com.origami.model.Comment;
import com.origami.model.User;
import com.origami.repository.CommentRepository;
import com.origami.service.UserService;

@Service
public class CommentService {

    @Autowired
    CommentRepository commentRepository;

    @Autowired
    UserService userService;

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public List<Comment> getAllComment() {
        return commentRepository.findAll();
    }

    public Comment getCommentById(String id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new CommentNotFoundException("Id not found"));
    }

    public Comment updateComment(Comment updatedComment) {
        Comment existingComment = commentRepository.findById(updatedComment.getId())
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

        // Only update the text
        if (updatedComment.getText() != null) {
            existingComment.setText(updatedComment.getText());
        }

        return commentRepository.save(existingComment);
    }

    public void deleteComment(String id) {
        commentRepository.deleteById(id);
    }

    public List<Comment> getCommentsByPostId(String postId) {
        List<Comment> comments = commentRepository.findByPostId(new ObjectId(postId));
        // Sort comments by createdDate in descending order (newest first)
        comments.sort((c1, c2) -> c2.getCreatedDate().compareTo(c1.getCreatedDate()));
        return comments;
    }

    public List<Comment> getCommentsByUserId(ObjectId userId) {
        return commentRepository.findByCreatedBy(userId);
    }

    // ✅✅ NEW: Get replies for a given parent comment
    public List<Comment> getReplies(ObjectId parentCommentId) {
        List<Comment> replies = commentRepository.findByParentCommentId(parentCommentId);
        // Sort replies by createdDate in descending order (newest first)
        replies.sort((r1, r2) -> r2.getCreatedDate().compareTo(r1.getCreatedDate()));
        return replies;
    }

    // ✅ NEW: Get user information for a specific comment
    public Map<String, String> getUserInfoByCommentId(String commentId) {
        Comment comment = getCommentById(commentId);
        if (comment == null || comment.getCreatedBy() == null) {
            throw new RuntimeException("Comment not found or createdBy is missing");
        }

        User user = userService.getUserById(comment.getCreatedBy().toHexString());
        Map<String, String> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        return response;
    }

    // ✅ NEW: Like a comment
    public void likeComment(String commentId) {
        Comment comment = getCommentById(commentId);
        if (comment == null) {
            throw new RuntimeException("Comment not found");
        }
        
        // Increment like count
        comment.setLikeCount(comment.getLikeCount() + 1);
        commentRepository.save(comment);
    }

    // ✅ NEW: Unlike a comment
    public void unlikeComment(String commentId) {
        Comment comment = getCommentById(commentId);
        if (comment == null) {
            throw new RuntimeException("Comment not found");
        }
        
        // Decrement like count, but don't go below 0
        int currentLikes = comment.getLikeCount();
        comment.setLikeCount(Math.max(0, currentLikes - 1));
        commentRepository.save(comment);
    }
}

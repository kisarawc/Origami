package com.origami.service;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.origami.exception.CommentNotFoundException;
import com.origami.model.Comment;
import com.origami.repository.CommentRepository;


@Service
public class CommentService {

    @Autowired
    CommentRepository commentRepository;

    public Comment createComment(Comment comment) {
       return commentRepository.save(comment);
    }

    public List<Comment> getAllComment(){
        return commentRepository.findAll();
    }

    public Comment getCommentById(String id) {
        return commentRepository.findById(id).orElseThrow(()-> new CommentNotFoundException("Id not found"));
    }

    public void deleteComment(String id) {
        commentRepository.deleteById(id);
    }

    public List<Comment> getCommentsByPostId(String postId) {
        return commentRepository.findByPostId(new ObjectId(postId));
    }
    
}
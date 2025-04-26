package com.origami.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.origami.model.Comment;
import com.origami.service.CommentService;


@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    CommentService commentService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public Comment createComment(@RequestBody Comment comment){
        return commentService.createComment(comment);
    }

    @GetMapping("/fetch/all")
    public List<Comment> getAllComment(){
        return commentService.getAllComment();
    }

    @GetMapping("/fetch/{id}")
    public Comment getCommentById(@PathVariable("id") String id){
        return commentService.getCommentById(id);
    }

    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable("postId") String postId) {
        return commentService.getCommentsByPostId(postId);
    }

    @PutMapping("/update")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Comment updateComment(@RequestBody Comment comment){
        return commentService.createComment(comment);
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void deleteComment(@PathVariable("id") String id){
        commentService.deleteComment(id);
    }
}
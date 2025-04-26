package com.origami.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.origami.model.Comment;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByPostId(ObjectId objectId);
    // You can add custom query methods here if needed
}

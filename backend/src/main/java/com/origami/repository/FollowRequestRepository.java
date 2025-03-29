package com.origami.repository;

import com.origami.model.FollowRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRequestRepository extends MongoRepository<FollowRequest, String> {
    Optional<FollowRequest> findByFollowerIdAndFollowedId(String followerId, String followedId);
    List<FollowRequest> findByFollowedIdAndStatus(String followedId, String status);
    List<FollowRequest> findByFollowerIdAndStatus(String followerId, String status);
    boolean existsByFollowerIdAndFollowedIdAndStatus(String followerId, String followedId, String status);
} 
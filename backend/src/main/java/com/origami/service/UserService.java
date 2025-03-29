package com.origami.service;

import com.origami.model.User;
import com.origami.model.UserStats;
import com.origami.model.Badge;
import com.origami.repository.UserRepository;
import com.origami.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.origami.model.FollowRequest;
import com.origami.repository.FollowRequestRepository;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final FollowRequestRepository followRequestRepository;
    private final PasswordEncoder passwordEncoder;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
    
    public User createUser(String username, String password, String email) {
        User user = User.builder()
            .username(username)
            .password(passwordEncoder.encode(password))
            .email(email)
            .name(username) // Default name is username
            .bio("Hello! I'm new to Origami World! 🎯")
            .stats(UserStats.builder()
                .creations(0)
                .followers(0)
                .following(0)
                .build())
            .badges(new ArrayList<>(Arrays.asList(
                Badge.builder()
                    .id("welcome")
                    .name("Welcome")
                    .icon("👋")
                    .description("Joined Origami World")
                    .earnedAt(LocalDateTime.now())
                    .build()
            )))
            .roles(Arrays.asList("ROLE_USER"))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        return userRepository.save(user);
    }
    
    public User updateUser(String id, User user) {
        User existingUser = getUserById(id);
        
        if (!existingUser.getEmail().equals(user.getEmail()) && 
            userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        
        if (!existingUser.getUsername().equals(user.getUsername()) && 
            userRepository.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }
        
        user.setId(id);
        return userRepository.save(user);
    }
    
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User updateProfile(String username, UserProfileResponse updateRequest) {
        User user = findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(updateRequest.getUsername());
        user.setEmail(updateRequest.getEmail());
        user.setBio(updateRequest.getBio());
        user.setAvatarUrl(updateRequest.getAvatarUrl());

        return userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> searchUsers(String query, String currentUsername) {
        return userRepository.findByUsernameContainingOrNameContainingIgnoreCase(query, query)
            .stream()
            .filter(user -> !user.getUsername().equals(currentUsername))
            .toList();
    }

    public boolean isFollowing(String followerUsername, String followedUsername) {
        User follower = getUserByUsername(followerUsername);
        User followed = getUserByUsername(followedUsername);
        return follower.getFollowing().contains(followed.getId());
    }

    public void followUser(String followerUsername, String followedUsername) {
        User follower = getUserByUsername(followerUsername);
        User followed = getUserByUsername(followedUsername);

        if (follower.getId().equals(followed.getId())) {
            throw new RuntimeException("Cannot follow yourself");
        }

        if (!follower.getFollowing().contains(followed.getId())) {
            follower.getFollowing().add(followed.getId());
            followed.getFollowers().add(follower.getId());
            
            // Update stats
            follower.getStats().setFollowing(follower.getStats().getFollowing() + 1);
            followed.getStats().setFollowers(followed.getStats().getFollowers() + 1);
            
            userRepository.save(follower);
            userRepository.save(followed);
        }
    }

    public void unfollowUser(String followerUsername, String followedUsername) {
        User follower = userRepository.findByUsername(followerUsername)
            .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findByUsername(followedUsername)
            .orElseThrow(() -> new RuntimeException("Followed user not found"));

        // Ensure stats are initialized
        if (follower.getStats() == null) {
            follower.setStats(UserStats.builder()
                .creations(0)
                .followers(0)
                .following(0)
                .build());
        }
        if (followed.getStats() == null) {
            followed.setStats(UserStats.builder()
                .creations(0)
                .followers(0)
                .following(0)
                .build());
        }

        // Remove the follow relationship using ObjectIds
        follower.getFollowing().remove(followed.getId());
        followed.getFollowers().remove(follower.getId());

        // Update stats
        follower.getStats().setFollowing(Math.max(0, follower.getStats().getFollowing() - 1));
        followed.getStats().setFollowers(Math.max(0, followed.getStats().getFollowers() - 1));

        // Save both users
        userRepository.save(follower);
        userRepository.save(followed);
    }

    public void sendFollowRequest(String followerUsername, String followedUsername) {
        // Get follower's information
        User follower = userRepository.findByUsername(followerUsername)
            .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findByUsername(followedUsername)
            .orElseThrow(() -> new RuntimeException("Followed user not found"));

        // Check if request already exists
        if (followRequestRepository.existsByFollowerIdAndFollowedIdAndStatus(follower.getId(), followed.getId(), "PENDING")) {
            throw new RuntimeException("Follow request already sent");
        }

        // Create new follow request
        FollowRequest request = FollowRequest.builder()
            .followerId(follower.getId())
            .followerUsername(follower.getUsername())
            .followerAvatar(follower.getProfilePicture())
            .followedId(followed.getId())
            .status("PENDING")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        followRequestRepository.save(request);
    }

    public void acceptFollowRequest(String requestId) {
        FollowRequest request = followRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Follow request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Follow request is not pending");
        }

        // Update request status
        request.setStatus("ACCEPTED");
        request.setUpdatedAt(LocalDateTime.now());
        followRequestRepository.save(request);

        // Update user relationships using ObjectIds
        User follower = userRepository.findById(request.getFollowerId())
            .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findById(request.getFollowedId())
            .orElseThrow(() -> new RuntimeException("Followed user not found"));

        // Initialize stats if null
        if (follower.getStats() == null) {
            follower.setStats(UserStats.builder()
                .creations(0)
                .followers(0)
                .following(0)
                .build());
        }
        if (followed.getStats() == null) {
            followed.setStats(UserStats.builder()
                .creations(0)
                .followers(0)
                .following(0)
                .build());
        }

        follower.getFollowing().add(followed.getId());
        followed.getFollowers().add(follower.getId());

        // Update stats
        follower.getStats().setFollowing(follower.getStats().getFollowing() + 1);
        followed.getStats().setFollowers(followed.getStats().getFollowers() + 1);

        userRepository.save(follower);
        userRepository.save(followed);
    }

    public void rejectFollowRequest(String requestId) {
        FollowRequest request = followRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Follow request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Follow request is not pending");
        }

        request.setStatus("REJECTED");
        request.setUpdatedAt(LocalDateTime.now());
        followRequestRepository.save(request);
    }

    public List<FollowRequest> getPendingFollowRequests(String username) {
        User user = getUserByUsername(username);
        return followRequestRepository.findByFollowedIdAndStatus(user.getId(), "PENDING");
    }

    public boolean hasPendingFollowRequest(String followerUsername, String followedUsername) {
        User follower = getUserByUsername(followerUsername);
        User followed = getUserByUsername(followedUsername);
        return followRequestRepository.existsByFollowerIdAndFollowedIdAndStatus(follower.getId(), followed.getId(), "PENDING");
    }
} 
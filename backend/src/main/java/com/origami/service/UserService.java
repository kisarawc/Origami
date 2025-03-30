package com.origami.service;

import com.origami.model.User;
import com.origami.model.UserStats;
import com.origami.model.Badge;
import com.origami.model.BadgeCriteria;
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
    private final BadgeService badgeService;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
    
    public User createUser(String username, String password, String email, String role) {
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
            .badges(new ArrayList<>()) // Initialize with empty badges list
            .role("user") // Set single role string
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
    
    public void deleteUser(String username) {
        User user = findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Delete all follow requests where this user is either follower or followed
        followRequestRepository.deleteByFollowerIdOrFollowedId(user.getId(), user.getId());

        // Remove this user from other users' followers/following lists
        List<User> followers = userRepository.findByFollowersContaining(user.getId());
        List<User> following = userRepository.findByFollowingContaining(user.getId());

        for (User follower : followers) {
            follower.getFollowing().remove(user.getId());
            if (follower.getStats() != null) {
                follower.getStats().setFollowing(Math.max(0, follower.getStats().getFollowing() - 1));
            }
        }

        for (User followed : following) {
            followed.getFollowers().remove(user.getId());
            if (followed.getStats() != null) {
                followed.getStats().setFollowers(Math.max(0, followed.getStats().getFollowers() - 1));
            }
        }

        userRepository.saveAll(followers);
        userRepository.saveAll(following);

        // Finally, delete the user
        userRepository.deleteById(user.getId());
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
        return userRepository.findByUsernameContainingIgnoreCase(query)
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
            .followerAvatar(follower.getAvatarUrl())
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

    public void checkAndAssignBadges(String username) {
        User user = getUserByUsername(username);
        List<Badge> allBadges = badgeService.getAllBadges();
        List<String> userBadgeIds = user.getBadges().stream()
            .map(Badge::getId)
            .toList();

        for (Badge badge : allBadges) {
            // Skip if user already has this badge
            if (userBadgeIds.contains(badge.getId())) {
                continue;
            }

            // Check if user meets badge criteria
            if (meetsBadgeCriteria(user, badge.getCriteria())) {
                // Create a copy of the badge with current earnedAt date
                Badge earnedBadge = Badge.builder()
                    .id(badge.getId())
                    .name(badge.getName())
                    .icon(badge.getIcon())
                    .description(badge.getDescription())
                    .criteria(badge.getCriteria())
                    .earnedAt(LocalDateTime.now())
                    .build();
                
                // Add badge to user's badges
                user.getBadges().add(earnedBadge);
                userRepository.save(user);
            }
        }
    }

    private boolean meetsBadgeCriteria(User user, BadgeCriteria criteria) {
        return switch (criteria.getType()) {
            case "followers" -> user.getStats().getFollowers() >= criteria.getCount();
            case "created_tutorials" -> user.getStats().getCreations() >= criteria.getCount();
            case "completed_tutorials" -> user.getStats().getCompletedTutorials() >= criteria.getCount();
            case "likes_received" -> user.getStats().getLikesReceived() >= criteria.getCount();
            case "comments_made" -> user.getStats().getCommentsMade() >= criteria.getCount();
            case "days_active" -> {
                long daysActive = java.time.temporal.ChronoUnit.DAYS.between(
                    user.getCreatedAt(),
                    java.time.LocalDateTime.now()
                );
                yield daysActive >= criteria.getCount();
            }
            default -> false;
        };
    }
} 
package com.origami.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.origami.dto.UserProfileResponse;
import com.origami.dto.UserSearchResponse;
import com.origami.model.FollowRequest;
import com.origami.model.User;
import com.origami.security.JwtService;
import com.origami.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(
            @RequestParam String query,
            Authentication authentication) {
        String currentUsername = authentication.getName();
        List<User> users = userService.searchUsers(query, currentUsername);
        
        List<UserSearchResponse> response = users.stream()
            .map(user -> UserSearchResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .build())
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable String username,
            Authentication authentication) {
        String currentUsername = authentication.getName();
        User user = userService.getUserByUsername(username);
        boolean isFollowing = userService.isFollowing(currentUsername, username);
        
        UserProfileResponse response = UserProfileResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .name(user.getName())
            .email(user.getEmail())
            .bio(user.getBio())
            .avatarUrl(user.getAvatarUrl())
            .stats(user.getStats())
            .badges(user.getBadges())
            .isFollowing(isFollowing)
            .build();
            
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<?> sendFollowRequest(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String followerUsername = userDetails.getUsername();
            User followedUser = userService.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            if (followerUsername.equals(followedUser.getUsername())) {
                return ResponseEntity.badRequest().body("Cannot follow yourself");
            }

            // Check if already following
            if (userService.isFollowing(followerUsername, username)) {
                return ResponseEntity.badRequest().body("Already following this user");
            }

            // Check if there's a pending request
            if (userService.hasPendingFollowRequest(followerUsername, username)) {
                return ResponseEntity.badRequest().body("Follow request already sent");
            }

            userService.sendFollowRequest(followerUsername, username);
            return ResponseEntity.ok().body("Follow request sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{username}/follow")
    public ResponseEntity<?> unfollowUser(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String followerId = userDetails.getUsername();
            User followedUser = userService.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            if (followerId.equals(followedUser.getUsername())) {
                return ResponseEntity.badRequest().body("Cannot unfollow yourself");
            }

            userService.unfollowUser(followerId, username);
            return ResponseEntity.ok().body("Successfully unfollowed user");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{username}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String username,
            @RequestBody UserProfileResponse updateRequest,
            Authentication authentication) {
        
        // Check if the authenticated user is updating their own profile
        if (!authentication.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Get the current user
        User currentUser = userService.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if username is being changed and if it's already taken
        if (!currentUser.getUsername().equals(updateRequest.getUsername())) {
            if (userService.existsByUsername(updateRequest.getUsername())) {
                Map<String, String> errors = new HashMap<>();
                errors.put("username", "Username is already taken");
                return ResponseEntity.badRequest().body(errors);
            }
        }

        // Check if email is being changed and if it's already taken
        if (!currentUser.getEmail().equals(updateRequest.getEmail())) {
            if (userService.existsByEmail(updateRequest.getEmail())) {
                Map<String, String> errors = new HashMap<>();
                errors.put("email", "Email is already taken");
                return ResponseEntity.badRequest().body(errors);
            }
        }

        // If all validations pass, update the user
        User updatedUser = userService.updateProfile(username, updateRequest);
        UserProfileResponse response = UserProfileResponse.builder()
            .id(updatedUser.getId())
            .username(updatedUser.getUsername())
            .email(updatedUser.getEmail())
            .name(updatedUser.getName())
            .bio(updatedUser.getBio())
            .avatarUrl(updatedUser.getAvatarUrl())
            .stats(updatedUser.getStats())
            .badges(updatedUser.getBadges())
            .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/follow-requests")
    public ResponseEntity<List<FollowRequest>> getPendingFollowRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<FollowRequest> requests = userService.getPendingFollowRequests(userDetails.getUsername());
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/follow-requests/{requestId}/accept")
    public ResponseEntity<?> acceptFollowRequest(
            @PathVariable String requestId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.acceptFollowRequest(requestId);
            return ResponseEntity.ok().body("Follow request accepted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/follow-requests/{requestId}/reject")
    public ResponseEntity<?> rejectFollowRequest(
            @PathVariable String requestId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.rejectFollowRequest(requestId);
            return ResponseEntity.ok().body("Follow request rejected");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{username}/follow-request-status")
    public ResponseEntity<?> getFollowRequestStatus(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String followerId = userDetails.getUsername();
            User followedUser = userService.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            if (followerId.equals(followedUser.getUsername())) {
                return ResponseEntity.ok(Map.of("status", "own_profile"));
            }

            if (userService.isFollowing(followerId, username)) {
                return ResponseEntity.ok(Map.of("status", "following"));
            }

            if (userService.hasPendingFollowRequest(followerId, username)) {
                return ResponseEntity.ok(Map.of("status", "pending"));
            }

            return ResponseEntity.ok(Map.of("status", "not_following"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(
            @PathVariable String username,
            Authentication authentication) {
        // Check if the authenticated user is deleting their own profile
        if (!authentication.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            userService.deleteUser(username);
            return ResponseEntity.ok().body("Profile deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
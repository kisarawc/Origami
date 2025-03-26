package com.origami.controller;

import com.origami.model.User;
import com.origami.service.UserService;
import com.origami.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable String username) {
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        UserProfileResponse response = UserProfileResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .name(user.getName())
            .bio(user.getBio())
            .avatarUrl(user.getAvatarUrl())
            .stats(user.getStats())
            .badges(user.getBadges())
            .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{username}")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable String username,
            @RequestBody UserProfileResponse updateRequest,
            Authentication authentication) {
        
        // Check if the authenticated user is updating their own profile
        if (!authentication.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User updatedUser = userService.updateProfile(username, updateRequest);
        UserProfileResponse response = UserProfileResponse.builder()
            .id(updatedUser.getId())
            .username(updatedUser.getUsername())
            .name(updatedUser.getName())
            .bio(updatedUser.getBio())
            .avatarUrl(updatedUser.getAvatarUrl())
            .stats(updatedUser.getStats())
            .badges(updatedUser.getBadges())
            .build();

        return ResponseEntity.ok(response);
    }
} 
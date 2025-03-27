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

import java.util.ArrayList;
import java.util.Arrays;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
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
                .creationsCount(0)
                .followersCount(0)
                .followingCount(0)
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

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElse(null);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User updateProfile(String username, UserProfileResponse updateRequest) {
        User user = findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        user.setUsername(updateRequest.getUsername());
        user.setEmail(updateRequest.getEmail());
        user.setBio(updateRequest.getBio());
        user.setAvatarUrl(updateRequest.getAvatarUrl());

        return userRepository.save(user);
    }
} 
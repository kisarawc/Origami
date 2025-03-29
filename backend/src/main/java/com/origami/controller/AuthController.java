package com.origami.controller;

import com.origami.model.User;
import com.origami.repository.UserRepository;
import com.origami.security.JwtService;
import com.origami.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.get("username"), request.get("password"))
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", userDetails.getUsername());
            response.put("message", "Login successful");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid username or password");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(403).body("Invalid token format");
            }

            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            
            if (username != null && userRepository.findByUsername(username).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("username", username);
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.status(403).body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Token verification failed");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String email = request.get("email");
            String role = request.get("role");

            // Password validation
            if (password == null || password.length() < 4) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password must be at least 4 characters long");
                return ResponseEntity.badRequest().body(response);
            }

            if (userRepository.existsByUsername(username)) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }
            if (userRepository.existsByEmail(email)) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userService.createUser(username, password, email, role);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account created successfully! Please log in.");
            response.put("username", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 
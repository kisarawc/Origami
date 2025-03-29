package com.origami.security;

import com.origami.model.User;
import com.origami.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        log.info("OAuth2 authentication success");
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        log.info("OAuth2 user details - Email: {}, Name: {}", email, name);

        // Generate username from email
        String username = email.split("@")[0];

        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            log.info("Existing user found: {}", user.getUsername());
        } else {
            // Create new user
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setName(name);
            user.setAvatarUrl(picture);
            user.setPassword(""); // OAuth users don't need password
            user.setRole("user"); // Set role as 'user'
            user = userRepository.save(user);
            log.info("New user created: {}", user.getUsername());
        }

        // Generate JWT token
        String token = jwtService.generateToken(user);
        log.info("JWT token generated for user: {}", user.getUsername());

        // Redirect to frontend with token
        String redirectUrl = UriComponentsBuilder
            .fromUriString("http://localhost:5173/oauth2/callback/google")
            .queryParam("token", token)
            .queryParam("username", user.getUsername())
            .build()
            .toUriString();

        log.info("Redirecting to: {}", redirectUrl);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
} 
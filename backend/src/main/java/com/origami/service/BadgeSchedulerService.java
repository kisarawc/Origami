package com.origami.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import com.origami.model.User;

@Service
@RequiredArgsConstructor
public class BadgeSchedulerService {
    
    private final UserService userService;
    
    // Run at 12:00 AM every day
    @Scheduled(cron = "0 0 0 * * ?")
    public void checkAndAssignBadgesForAllUsers() {
        List<User> allUsers = userService.getAllUsers();
        for (User user : allUsers) {
            userService.checkAndAssignBadges(user.getUsername());
        }
    }
} 
package com.origami.controller;

import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.origami.model.Notification;
import com.origami.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationService.createNotification(notification);
    }

    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable String userId) {
        return notificationService.getNotificationsForUser(new ObjectId(userId));
    }

    @PutMapping("/mark-read/{userId}")
    public void markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(new ObjectId(userId));
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
    }

    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(@PathVariable String userId) {
        return notificationService.getUnreadCount(new ObjectId(userId));
    }
}

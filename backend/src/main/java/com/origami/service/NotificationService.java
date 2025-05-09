package com.origami.service;

import java.util.Date;
import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.origami.model.Notification;
import com.origami.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Notification notification) {
        notification.setCreatedDate(new Date());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(ObjectId userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedDateDesc(userId);
    }

    public void markAllAsRead(ObjectId userId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdAndReadFalse(userId);
        for (Notification n : notifications) {
            n.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    public long getUnreadCount(ObjectId userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }
}

package com.origami.repository;

import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.origami.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByCreatedDateDesc(ObjectId recipientId);
    List<Notification> findByRecipientIdAndReadFalse(ObjectId recipientId);
    long countByRecipientIdAndReadFalse(ObjectId recipientId);
}

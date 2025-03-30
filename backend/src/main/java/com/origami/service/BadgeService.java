package com.origami.service;

import com.origami.model.Badge;
import com.origami.repository.BadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BadgeService {
    
    @Autowired
    private BadgeRepository badgeRepository;

    public Badge createBadge(Badge badge) {
        return badgeRepository.save(badge);
    }

    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    public Badge getBadgeById(String id) {
        return badgeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Badge not found"));
    }

    public Badge updateBadge(String id, Badge badge) {
        Badge existingBadge = getBadgeById(id);
        existingBadge.setName(badge.getName());
        existingBadge.setIcon(badge.getIcon());
        existingBadge.setDescription(badge.getDescription());
        existingBadge.setCriteria(badge.getCriteria());
        return badgeRepository.save(existingBadge);
    }

    public void deleteBadge(String id) {
        badgeRepository.deleteById(id);
    }
} 
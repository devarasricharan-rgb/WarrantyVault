package com.warrantyvault.service;

import com.warrantyvault.dto.common.PagedResponse;
import com.warrantyvault.dto.notification.NotificationResponse;
import com.warrantyvault.dto.notification.UnreadNotificationCountResponse;
import com.warrantyvault.entity.Notification;
import com.warrantyvault.entity.User;
import com.warrantyvault.exception.ResourceNotFoundException;
import com.warrantyvault.repository.NotificationRepository;
import com.warrantyvault.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        User user = getUser(userId);
        Page<Notification> page = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return PagedResponse.fromPage(page.map(NotificationResponse::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecentNotifications(Long userId) {
        User user = getUser(userId);
        return notificationRepository.findTop5ByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UnreadNotificationCountResponse getUnreadCount(Long userId) {
        User user = getUser(userId);
        long count = notificationRepository.countByUserAndIsReadFalse(user);
        return new UnreadNotificationCountResponse(count);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, Long userId) {
        User user = getUser(userId);
        Notification notification = notificationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(updated);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        User user = getUser(userId);
        List<Notification> unreadList = notificationRepository.findByUserAndIsReadFalse(user);
        for (Notification notification : unreadList) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadList);
    }
}

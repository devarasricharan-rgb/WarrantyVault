package com.warrantyvault.repository;

import com.warrantyvault.entity.Notification;
import com.warrantyvault.entity.Product;
import com.warrantyvault.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Optional<Notification> findByIdAndUser(Long id, User user);

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Notification> findTop5ByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);

    boolean existsByUserAndProductAndReminderWindowDays(User user, Product product, Integer reminderWindowDays);

    List<Notification> findByUserAndIsReadFalse(User user);
}

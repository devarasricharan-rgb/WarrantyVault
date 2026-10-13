package com.warrantyvault;

import com.warrantyvault.entity.*;
import com.warrantyvault.repository.NotificationRepository;
import com.warrantyvault.repository.ProductRepository;
import com.warrantyvault.repository.UserRepository;
import com.warrantyvault.service.WarrantyExpiryScheduler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class WarrantyExpirySchedulerTest {

    @Autowired
    private WarrantyExpiryScheduler scheduler;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void checkAndProcessExpiringWarranties_ShouldGenerateAlertsAndPreventDuplicates() {
        User user = new User("Grace Hopper", "grace@example.com", "Password123!");
        User savedUser = userRepository.save(user);

        // Product expiring in exactly 30 days
        Product p30 = new Product();
        p30.setUser(savedUser);
        p30.setName("Office Monitor");
        p30.setBrand("Dell");
        p30.setCategory(Category.TVS_AND_MONITORS);
        p30.setPurchasePrice(new BigDecimal("350.00"));
        p30.setPurchaseDate(LocalDate.now().minusMonths(11));
        p30.setWarrantyDurationMonths(12);
        p30.setWarrantyStartDate(LocalDate.now().minusMonths(11));
        p30.setWarrantyExpiryDate(LocalDate.now().plusDays(30));
        productRepository.save(p30);

        // Product expiring in exactly 7 days
        Product p7 = new Product();
        p7.setUser(savedUser);
        p7.setName("Wireless Mouse");
        p7.setBrand("Logitech");
        p7.setCategory(Category.OTHER);
        p7.setPurchasePrice(new BigDecimal("50.00"));
        p7.setPurchaseDate(LocalDate.now().minusMonths(12));
        p7.setWarrantyDurationMonths(12);
        p7.setWarrantyStartDate(LocalDate.now().minusMonths(12));
        p7.setWarrantyExpiryDate(LocalDate.now().plusDays(7));
        productRepository.save(p7);

        // 1. Run scheduler scan
        int createdCount = scheduler.checkAndProcessExpiringWarranties();
        assertEquals(2, createdCount, "Should create 2 notifications for products expiring in 30 and 7 days");
        assertEquals(2, notificationRepository.countByUserAndIsReadFalse(savedUser));

        // 2. Run scheduler scan again on the same day -> duplicate prevention should yield 0 new notifications
        int duplicateRunCount = scheduler.checkAndProcessExpiringWarranties();
        assertEquals(0, duplicateRunCount, "Duplicate notifications must be prevented");
        assertEquals(2, notificationRepository.countByUserAndIsReadFalse(savedUser));
    }
}

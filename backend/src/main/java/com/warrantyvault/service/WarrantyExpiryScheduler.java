package com.warrantyvault.service;

import com.warrantyvault.entity.Notification;
import com.warrantyvault.entity.NotificationType;
import com.warrantyvault.entity.Product;
import com.warrantyvault.repository.NotificationRepository;
import com.warrantyvault.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WarrantyExpiryScheduler {

    private static final Logger logger = LoggerFactory.getLogger(WarrantyExpiryScheduler.class);

    private static final int[] REMINDER_WINDOWS = {30, 15, 7, 1};

    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;
    private final Optional<JavaMailSender> mailSender;

    public WarrantyExpiryScheduler(ProductRepository productRepository,
                                  NotificationRepository notificationRepository,
                                  Optional<JavaMailSender> mailSender) {
        this.productRepository = productRepository;
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    @Scheduled(cron = "${app.scheduler.warranty-cron:0 0 8 * * ?}")
    @Transactional
    public void scheduleDailyWarrantyCheck() {
        logger.info("Starting daily warranty expiry scan...");
        checkAndProcessExpiringWarranties();
        logger.info("Completed daily warranty expiry scan.");
    }

    @Transactional
    public int checkAndProcessExpiringWarranties() {
        LocalDate today = LocalDate.now();
        int notificationsCreated = 0;

        for (int windowDays : REMINDER_WINDOWS) {
            LocalDate targetDate = today.plusDays(windowDays);
            List<Product> expiringProducts = productRepository.findProductsExpiringBetween(targetDate, targetDate);

            for (Product product : expiringProducts) {
                // Prevent duplicate notifications for this specific reminder window
                boolean alreadyNotified = notificationRepository.existsByUserAndProductAndReminderWindowDays(
                        product.getUser(), product, windowDays
                );

                if (!alreadyNotified) {
                    String title = "Warranty Expiring: " + product.getName();
                    String dayLabel = windowDays == 1 ? "1 day" : windowDays + " days";
                    String message = String.format(
                            "The warranty for your %s (%s) expires in %s on %s.",
                            product.getName(),
                            product.getBrand(),
                            dayLabel,
                            product.getWarrantyExpiryDate()
                    );

                    Notification notification = new Notification(
                            product.getUser(),
                            product,
                            title,
                            message,
                            NotificationType.EXPIRY_WARNING,
                            windowDays
                    );

                    notificationRepository.save(notification);
                    notificationsCreated++;

                    // Attempt optional email notification
                    sendEmailNotification(product.getUser().getEmail(), title, message);
                }
            }
        }

        return notificationsCreated;
    }

    private void sendEmailNotification(String recipientEmail, String subject, String body) {
        if (mailSender.isEmpty()) {
            return;
        }
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(recipientEmail);
            mailMessage.setSubject("[WarrantyVault] " + subject);
            mailMessage.setText(body + "\n\nLog in to WarrantyVault to review your warranty coverage.");
            mailSender.get().send(mailMessage);
            logger.info("Sent email warranty alert to {}", recipientEmail);
        } catch (Exception ex) {
            logger.warn("Could not dispatch email to {}: {}", recipientEmail, ex.getMessage());
        }
    }
}

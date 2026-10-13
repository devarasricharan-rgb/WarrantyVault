package com.warrantyvault.service;

import com.warrantyvault.dto.dashboard.CategoryDistributionResponse;
import com.warrantyvault.dto.dashboard.DashboardStatsResponse;
import com.warrantyvault.dto.product.ProductSummaryResponse;
import com.warrantyvault.dto.repair.RepairResponse;
import com.warrantyvault.entity.Category;
import com.warrantyvault.entity.Product;
import com.warrantyvault.entity.Repair;
import com.warrantyvault.entity.User;
import com.warrantyvault.exception.ResourceNotFoundException;
import com.warrantyvault.repository.NotificationRepository;
import com.warrantyvault.repository.ProductRepository;
import com.warrantyvault.repository.RepairRepository;
import com.warrantyvault.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final RepairRepository repairRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public DashboardService(ProductRepository productRepository,
                            RepairRepository repairRepository,
                            NotificationRepository notificationRepository,
                            UserRepository userRepository) {
        this.productRepository = productRepository;
        this.repairRepository = repairRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LocalDate today = LocalDate.now();
        LocalDate expiringThreshold = today.plusDays(30);

        long totalProducts = productRepository.countByUser(user);
        long activeWarranties = productRepository.countActiveWarranties(user, expiringThreshold);
        long expiringSoonWarranties = productRepository.countExpiringSoonWarranties(user, today, expiringThreshold);
        long expiredWarranties = productRepository.countExpiredWarranties(user, today);

        List<Product> userProducts = productRepository.findAllByUser(user);
        BigDecimal totalValueProtected = userProducts.stream()
                .map(Product::getPurchasePrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate repair costs
        List<Repair> userRepairs = repairRepository.findRecentRepairsByUser(user, PageRequest.of(0, 100));
        BigDecimal totalRepairCost = userRepairs.stream()
                .map(Repair::getCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long unreadNotifications = notificationRepository.countByUserAndIsReadFalse(user);

        // Upcoming expiring products (up to 5)
        List<ProductSummaryResponse> expiringSoon = productRepository.findExpiringSoonList(user, today, expiringThreshold)
                .stream()
                .limit(5)
                .map(ProductSummaryResponse::fromEntity)
                .toList();

        // Recent repairs (up to 5)
        List<RepairResponse> recentRepairs = repairRepository.findRecentRepairsByUser(user, PageRequest.of(0, 5))
                .stream()
                .map(RepairResponse::fromEntity)
                .toList();

        // Category breakdown
        List<CategoryDistributionResponse> categoryDist = getCategoryDistribution(user, totalProducts);

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalProducts(totalProducts);
        stats.setActiveWarranties(activeWarranties);
        stats.setExpiringSoonWarranties(expiringSoonWarranties);
        stats.setExpiredWarranties(expiredWarranties);
        stats.setTotalValueProtected(totalValueProtected);
        stats.setTotalRepairCost(totalRepairCost);
        stats.setUnreadNotifications(unreadNotifications);
        stats.setExpiringSoonProducts(expiringSoon);
        stats.setRecentRepairs(recentRepairs);
        stats.setCategoryDistribution(categoryDist);

        return stats;
    }

    @Transactional(readOnly = true)
    public List<CategoryDistributionResponse> getCategoryDistribution(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        long totalProducts = productRepository.countByUser(user);
        return getCategoryDistribution(user, totalProducts);
    }

    private List<CategoryDistributionResponse> getCategoryDistribution(User user, long totalProducts) {
        List<Object[]> rawCategories = productRepository.countGroupedByCategory(user);
        List<CategoryDistributionResponse> result = new ArrayList<>();

        for (Object[] row : rawCategories) {
            Category category = (Category) row[0];
            long count = ((Number) row[1]).longValue();
            double percentage = totalProducts > 0
                    ? BigDecimal.valueOf((count * 100.0) / totalProducts)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue()
                    : 0.0;

            result.add(new CategoryDistributionResponse(
                    category,
                    category != null ? category.getDisplayName() : "Uncategorized",
                    count,
                    percentage
            ));
        }

        return result;
    }
}

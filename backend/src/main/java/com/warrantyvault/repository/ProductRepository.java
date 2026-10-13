package com.warrantyvault.repository;

import com.warrantyvault.entity.Category;
import com.warrantyvault.entity.Product;
import com.warrantyvault.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByIdAndUser(Long id, User user);

    Page<Product> findAllByUser(User user, Pageable pageable);

    List<Product> findAllByUser(User user);

    long countByUser(User user);

    // Filter by warranty expiry range
    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.warrantyExpiryDate > :today AND p.warrantyExpiryDate > :expiringThreshold")
    Page<Product> findActiveWarranties(
            @Param("user") User user,
            @Param("today") LocalDate today,
            @Param("expiringThreshold") LocalDate expiringThreshold,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.warrantyExpiryDate >= :today AND p.warrantyExpiryDate <= :expiringThreshold ORDER BY p.warrantyExpiryDate ASC")
    List<Product> findExpiringSoonList(
            @Param("user") User user,
            @Param("today") LocalDate today,
            @Param("expiringThreshold") LocalDate expiringThreshold);

    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.warrantyExpiryDate >= :today AND p.warrantyExpiryDate <= :expiringThreshold")
    Page<Product> findExpiringSoonWarranties(
            @Param("user") User user,
            @Param("today") LocalDate today,
            @Param("expiringThreshold") LocalDate expiringThreshold,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.warrantyExpiryDate < :today")
    Page<Product> findExpiredWarranties(
            @Param("user") User user,
            @Param("today") LocalDate today,
            Pageable pageable);

    // Counts for dashboard
    @Query("SELECT COUNT(p) FROM Product p WHERE p.user = :user AND p.warrantyExpiryDate > :expiringThreshold")
    long countActiveWarranties(@Param("user") User user, @Param("expiringThreshold") LocalDate expiringThreshold);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.user = :user AND p.warrantyExpiryDate >= :today AND p.warrantyExpiryDate <= :expiringThreshold")
    long countExpiringSoonWarranties(
            @Param("user") User user,
            @Param("today") LocalDate today,
            @Param("expiringThreshold") LocalDate expiringThreshold);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.user = :user AND p.warrantyExpiryDate < :today")
    long countExpiredWarranties(@Param("user") User user, @Param("today") LocalDate today);

    // Search and filter query
    @Query("SELECT p FROM Product p WHERE p.user = :user " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.modelNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(
            @Param("user") User user,
            @Param("keyword") String keyword,
            @Param("category") Category category,
            Pageable pageable);

    // Category distribution query for dashboard
    @Query("SELECT p.category, COUNT(p) FROM Product p WHERE p.user = :user GROUP BY p.category")
    List<Object[]> countGroupedByCategory(@Param("user") User user);

    // System-wide query for scheduled warranty reminder checks
    @Query("SELECT p FROM Product p JOIN FETCH p.user WHERE p.warrantyExpiryDate BETWEEN :startDate AND :endDate")
    List<Product> findProductsExpiringBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}

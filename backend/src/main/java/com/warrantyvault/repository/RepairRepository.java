package com.warrantyvault.repository;

import com.warrantyvault.entity.Product;
import com.warrantyvault.entity.Repair;
import com.warrantyvault.entity.RepairStatus;
import com.warrantyvault.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepairRepository extends JpaRepository<Repair, Long> {

    Optional<Repair> findByIdAndUser(Long id, User user);

    Page<Repair> findAllByUser(User user, Pageable pageable);

    List<Repair> findByProductAndUserOrderByRequestDateDescCreatedAtDesc(Product product, User user);

    long countByUser(User user);

    @Query("SELECT r FROM Repair r WHERE r.user = :user ORDER BY r.createdAt DESC")
    List<Repair> findRecentRepairsByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT r FROM Repair r WHERE r.user = :user " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:keyword IS NULL OR LOWER(r.issueTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(r.serviceCenterName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(r.product.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Repair> searchRepairs(
            @Param("user") User user,
            @Param("status") RepairStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);
}

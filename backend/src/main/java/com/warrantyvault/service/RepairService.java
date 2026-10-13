package com.warrantyvault.service;

import com.warrantyvault.dto.common.PagedResponse;
import com.warrantyvault.dto.repair.RepairRequest;
import com.warrantyvault.dto.repair.RepairResponse;
import com.warrantyvault.dto.repair.RepairStatusUpdateRequest;
import com.warrantyvault.entity.*;
import com.warrantyvault.exception.ResourceNotFoundException;
import com.warrantyvault.repository.NotificationRepository;
import com.warrantyvault.repository.ProductRepository;
import com.warrantyvault.repository.RepairRepository;
import com.warrantyvault.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RepairService {

    private final RepairRepository repairRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public RepairService(RepairRepository repairRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         NotificationRepository notificationRepository) {
        this.repairRepository = repairRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Transactional
    public RepairResponse createRepair(RepairRequest request, Long userId) {
        User user = getUser(userId);

        Product product = productRepository.findByIdAndUser(request.getProductId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Repair repair = new Repair();
        repair.setUser(user);
        repair.setProduct(product);
        repair.setIssueTitle(request.getIssueTitle().trim());
        repair.setIssueDescription(request.getIssueDescription().trim());
        repair.setRequestDate(request.getRequestDate());
        repair.setServiceCenterName(request.getServiceCenterName().trim());
        repair.setServiceCenterContact(request.getServiceCenterContact() != null ? request.getServiceCenterContact().trim() : null);
        repair.setStatus(request.getStatus() != null ? request.getStatus() : RepairStatus.REQUESTED);
        repair.setCost(request.getCost());
        repair.setWarrantyClaim(request.getWarrantyClaim() != null ? request.getWarrantyClaim() : false);
        repair.setCompletionDate(request.getCompletionDate());
        repair.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Repair savedRepair = repairRepository.save(repair);
        return RepairResponse.fromEntity(savedRepair);
    }

    @Transactional
    public RepairResponse updateRepair(Long id, RepairRequest request, Long userId) {
        User user = getUser(userId);

        Repair repair = repairRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Repair not found with id: " + id));

        if (!repair.getProduct().getId().equals(request.getProductId())) {
            Product product = productRepository.findByIdAndUser(request.getProductId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
            repair.setProduct(product);
        }

        repair.setIssueTitle(request.getIssueTitle().trim());
        repair.setIssueDescription(request.getIssueDescription().trim());
        repair.setRequestDate(request.getRequestDate());
        repair.setServiceCenterName(request.getServiceCenterName().trim());
        repair.setServiceCenterContact(request.getServiceCenterContact() != null ? request.getServiceCenterContact().trim() : null);
        if (request.getStatus() != null) {
            repair.setStatus(request.getStatus());
        }
        repair.setCost(request.getCost());
        repair.setWarrantyClaim(request.getWarrantyClaim() != null ? request.getWarrantyClaim() : false);
        repair.setCompletionDate(request.getCompletionDate());
        repair.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Repair updatedRepair = repairRepository.save(repair);
        return RepairResponse.fromEntity(updatedRepair);
    }

    @Transactional
    public RepairResponse updateRepairStatus(Long id, RepairStatusUpdateRequest request, Long userId) {
        User user = getUser(userId);

        Repair repair = repairRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Repair not found with id: " + id));

        RepairStatus previousStatus = repair.getStatus();
        repair.setStatus(request.getStatus());

        if (request.getCost() != null) {
            repair.setCost(request.getCost());
        }

        if (request.getCompletionDate() != null) {
            repair.setCompletionDate(request.getCompletionDate());
        } else if (request.getStatus() == RepairStatus.COMPLETED && repair.getCompletionDate() == null) {
            repair.setCompletionDate(LocalDate.now());
        }

        if (request.getNotes() != null) {
            repair.setNotes(request.getNotes().trim());
        }

        Repair updatedRepair = repairRepository.save(repair);

        // Notify user if status changed to completed
        if (previousStatus != RepairStatus.COMPLETED && request.getStatus() == RepairStatus.COMPLETED) {
            Notification notification = new Notification(
                    user,
                    repair.getProduct(),
                    "Repair Completed: " + repair.getProduct().getName(),
                    "The repair for '" + repair.getIssueTitle() + "' has been marked as completed.",
                    NotificationType.REPAIR_UPDATE,
                    null
            );
            notificationRepository.save(notification);
        }

        return RepairResponse.fromEntity(updatedRepair);
    }

    @Transactional(readOnly = true)
    public RepairResponse getRepairById(Long id, Long userId) {
        User user = getUser(userId);
        Repair repair = repairRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Repair not found with id: " + id));
        return RepairResponse.fromEntity(repair);
    }

    @Transactional(readOnly = true)
    public PagedResponse<RepairResponse> getRepairs(Long userId, RepairStatus status, String keyword, Pageable pageable) {
        User user = getUser(userId);
        String sanitizedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        Page<Repair> page = repairRepository.searchRepairs(user, status, sanitizedKeyword, pageable);
        return PagedResponse.fromPage(page.map(RepairResponse::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<RepairResponse> getRepairsByProduct(Long productId, Long userId) {
        User user = getUser(userId);
        Product product = productRepository.findByIdAndUser(productId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        return repairRepository.findByProductAndUserOrderByRequestDateDescCreatedAtDesc(product, user)
                .stream()
                .map(RepairResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void deleteRepair(Long id, Long userId) {
        User user = getUser(userId);
        Repair repair = repairRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Repair not found with id: " + id));
        repairRepository.delete(repair);
    }
}

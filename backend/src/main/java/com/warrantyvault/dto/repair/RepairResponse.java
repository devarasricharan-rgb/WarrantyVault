package com.warrantyvault.dto.repair;

import com.warrantyvault.entity.Repair;
import com.warrantyvault.entity.RepairStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class RepairResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productBrand;
    private String issueTitle;
    private String issueDescription;
    private LocalDate requestDate;
    private String serviceCenterName;
    private String serviceCenterContact;
    private RepairStatus status;
    private BigDecimal cost;
    private Boolean warrantyClaim;
    private LocalDate completionDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RepairResponse() {
    }

    public static RepairResponse fromEntity(Repair repair) {
        RepairResponse response = new RepairResponse();
        response.setId(repair.getId());
        if (repair.getProduct() != null) {
            response.setProductId(repair.getProduct().getId());
            response.setProductName(repair.getProduct().getName());
            response.setProductBrand(repair.getProduct().getBrand());
        }
        response.setIssueTitle(repair.getIssueTitle());
        response.setIssueDescription(repair.getIssueDescription());
        response.setRequestDate(repair.getRequestDate());
        response.setServiceCenterName(repair.getServiceCenterName());
        response.setServiceCenterContact(repair.getServiceCenterContact());
        response.setStatus(repair.getStatus());
        response.setCost(repair.getCost());
        response.setWarrantyClaim(repair.getWarrantyClaim());
        response.setCompletionDate(repair.getCompletionDate());
        response.setNotes(repair.getNotes());
        response.setCreatedAt(repair.getCreatedAt());
        response.setUpdatedAt(repair.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductBrand() {
        return productBrand;
    }

    public void setProductBrand(String productBrand) {
        this.productBrand = productBrand;
    }

    public String getIssueTitle() {
        return issueTitle;
    }

    public void setIssueTitle(String issueTitle) {
        this.issueTitle = issueTitle;
    }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public String getServiceCenterName() {
        return serviceCenterName;
    }

    public void setServiceCenterName(String serviceCenterName) {
        this.serviceCenterName = serviceCenterName;
    }

    public String getServiceCenterContact() {
        return serviceCenterContact;
    }

    public void setServiceCenterContact(String serviceCenterContact) {
        this.serviceCenterContact = serviceCenterContact;
    }

    public RepairStatus getStatus() {
        return status;
    }

    public void setStatus(RepairStatus status) {
        this.status = status;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public Boolean getWarrantyClaim() {
        return warrantyClaim;
    }

    public void setWarrantyClaim(Boolean warrantyClaim) {
        this.warrantyClaim = warrantyClaim;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

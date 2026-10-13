package com.warrantyvault.dto.repair;

import com.warrantyvault.entity.RepairStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RepairRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Issue title is required")
    @Size(max = 200, message = "Issue title cannot exceed 200 characters")
    private String issueTitle;

    @NotBlank(message = "Issue description is required")
    @Size(max = 2000, message = "Issue description cannot exceed 2000 characters")
    private String issueDescription;

    @NotNull(message = "Request date is required")
    private LocalDate requestDate;

    @NotBlank(message = "Service center name is required")
    @Size(max = 150, message = "Service center name cannot exceed 150 characters")
    private String serviceCenterName;

    @Size(max = 150, message = "Service center contact cannot exceed 150 characters")
    private String serviceCenterContact;

    private RepairStatus status = RepairStatus.REQUESTED;

    @DecimalMin(value = "0.0", inclusive = true, message = "Repair cost must be positive or zero")
    private BigDecimal cost;

    private Boolean warrantyClaim = false;

    private LocalDate completionDate;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;

    public RepairRequest() {
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
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
}

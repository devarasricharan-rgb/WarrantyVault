package com.warrantyvault.dto.repair;

import com.warrantyvault.entity.RepairStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RepairStatusUpdateRequest {

    @NotNull(message = "Repair status is required")
    private RepairStatus status;

    @DecimalMin(value = "0.0", inclusive = true, message = "Repair cost must be positive or zero")
    private BigDecimal cost;

    private LocalDate completionDate;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;

    public RepairStatusUpdateRequest() {
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

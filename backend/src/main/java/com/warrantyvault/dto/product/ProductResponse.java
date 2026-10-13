package com.warrantyvault.dto.product;

import com.warrantyvault.entity.Category;
import com.warrantyvault.entity.Product;
import com.warrantyvault.entity.WarrantyStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class ProductResponse {

    private Long id;
    private String name;
    private String brand;
    private Category category;
    private String categoryDisplayName;
    private String modelNumber;
    private String serialNumber;
    private BigDecimal purchasePrice;
    private LocalDate purchaseDate;
    private Integer warrantyDurationMonths;
    private LocalDate warrantyStartDate;
    private LocalDate warrantyExpiryDate;
    private WarrantyStatus warrantyStatus;
    private Long daysRemaining;
    private String description;
    private String receiptFileName;
    private String receiptOriginalName;
    private String receiptContentType;
    private Boolean hasReceipt;
    private Integer repairCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {
    }

    public static ProductResponse fromEntity(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setBrand(product.getBrand());
        response.setCategory(product.getCategory());
        response.setCategoryDisplayName(product.getCategory() != null ? product.getCategory().getDisplayName() : "");
        response.setModelNumber(product.getModelNumber());
        response.setSerialNumber(product.getSerialNumber());
        response.setPurchasePrice(product.getPurchasePrice());
        response.setPurchaseDate(product.getPurchaseDate());
        response.setWarrantyDurationMonths(product.getWarrantyDurationMonths());
        response.setWarrantyStartDate(product.getWarrantyStartDate());
        response.setWarrantyExpiryDate(product.getWarrantyExpiryDate());
        response.setDescription(product.getDescription());
        response.setReceiptFileName(product.getReceiptFileName());
        response.setReceiptOriginalName(product.getReceiptOriginalName());
        response.setReceiptContentType(product.getReceiptContentType());
        response.setHasReceipt(product.getReceiptFileName() != null && !product.getReceiptFileName().isBlank());
        response.setRepairCount(product.getRepairs() != null ? product.getRepairs().size() : 0);
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        // Calculate dynamic status and days remaining
        LocalDate today = LocalDate.now();
        if (product.getWarrantyExpiryDate() != null) {
            long days = ChronoUnit.DAYS.between(today, product.getWarrantyExpiryDate());
            response.setDaysRemaining(days);

            if (today.isAfter(product.getWarrantyExpiryDate())) {
                response.setWarrantyStatus(WarrantyStatus.EXPIRED);
            } else if (days <= 30) {
                response.setWarrantyStatus(WarrantyStatus.EXPIRING_SOON);
            } else {
                response.setWarrantyStatus(WarrantyStatus.ACTIVE);
            }
        } else {
            response.setWarrantyStatus(WarrantyStatus.UNKNOWN);
            response.setDaysRemaining(0L);
        }

        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getCategoryDisplayName() {
        return categoryDisplayName;
    }

    public void setCategoryDisplayName(String categoryDisplayName) {
        this.categoryDisplayName = categoryDisplayName;
    }

    public String getModelNumber() {
        return modelNumber;
    }

    public void setModelNumber(String modelNumber) {
        this.modelNumber = modelNumber;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Integer getWarrantyDurationMonths() {
        return warrantyDurationMonths;
    }

    public void setWarrantyDurationMonths(Integer warrantyDurationMonths) {
        this.warrantyDurationMonths = warrantyDurationMonths;
    }

    public LocalDate getWarrantyStartDate() {
        return warrantyStartDate;
    }

    public void setWarrantyStartDate(LocalDate warrantyStartDate) {
        this.warrantyStartDate = warrantyStartDate;
    }

    public LocalDate getWarrantyExpiryDate() {
        return warrantyExpiryDate;
    }

    public void setWarrantyExpiryDate(LocalDate warrantyExpiryDate) {
        this.warrantyExpiryDate = warrantyExpiryDate;
    }

    public WarrantyStatus getWarrantyStatus() {
        return warrantyStatus;
    }

    public void setWarrantyStatus(WarrantyStatus warrantyStatus) {
        this.warrantyStatus = warrantyStatus;
    }

    public Long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(Long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReceiptFileName() {
        return receiptFileName;
    }

    public void setReceiptFileName(String receiptFileName) {
        this.receiptFileName = receiptFileName;
    }

    public String getReceiptOriginalName() {
        return receiptOriginalName;
    }

    public void setReceiptOriginalName(String receiptOriginalName) {
        this.receiptOriginalName = receiptOriginalName;
    }

    public String getReceiptContentType() {
        return receiptContentType;
    }

    public void setReceiptContentType(String receiptContentType) {
        this.receiptContentType = receiptContentType;
    }

    public Boolean getHasReceipt() {
        return hasReceipt;
    }

    public void setHasReceipt(Boolean hasReceipt) {
        this.hasReceipt = hasReceipt;
    }

    public Integer getRepairCount() {
        return repairCount;
    }

    public void setRepairCount(Integer repairCount) {
        this.repairCount = repairCount;
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

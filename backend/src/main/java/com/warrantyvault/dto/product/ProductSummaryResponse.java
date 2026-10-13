package com.warrantyvault.dto.product;

import com.warrantyvault.entity.Category;
import com.warrantyvault.entity.Product;
import com.warrantyvault.entity.WarrantyStatus;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class ProductSummaryResponse {

    private Long id;
    private String name;
    private String brand;
    private Category category;
    private LocalDate warrantyExpiryDate;
    private WarrantyStatus warrantyStatus;
    private Long daysRemaining;

    public ProductSummaryResponse() {
    }

    public static ProductSummaryResponse fromEntity(Product product) {
        ProductSummaryResponse summary = new ProductSummaryResponse();
        summary.setId(product.getId());
        summary.setName(product.getName());
        summary.setBrand(product.getBrand());
        summary.setCategory(product.getCategory());
        summary.setWarrantyExpiryDate(product.getWarrantyExpiryDate());

        LocalDate today = LocalDate.now();
        if (product.getWarrantyExpiryDate() != null) {
            long days = ChronoUnit.DAYS.between(today, product.getWarrantyExpiryDate());
            summary.setDaysRemaining(days);

            if (today.isAfter(product.getWarrantyExpiryDate())) {
                summary.setWarrantyStatus(WarrantyStatus.EXPIRED);
            } else if (days <= 30) {
                summary.setWarrantyStatus(WarrantyStatus.EXPIRING_SOON);
            } else {
                summary.setWarrantyStatus(WarrantyStatus.ACTIVE);
            }
        }
        return summary;
    }

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
}

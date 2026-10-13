package com.warrantyvault.dto.dashboard;

import com.warrantyvault.dto.product.ProductSummaryResponse;
import com.warrantyvault.dto.repair.RepairResponse;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DashboardStatsResponse {

    private long totalProducts;
    private long activeWarranties;
    private long expiringSoonWarranties;
    private long expiredWarranties;
    private BigDecimal totalValueProtected;
    private BigDecimal totalRepairCost;
    private long unreadNotifications;
    private List<ProductSummaryResponse> expiringSoonProducts = new ArrayList<>();
    private List<RepairResponse> recentRepairs = new ArrayList<>();
    private List<CategoryDistributionResponse> categoryDistribution = new ArrayList<>();

    public DashboardStatsResponse() {
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getActiveWarranties() {
        return activeWarranties;
    }

    public void setActiveWarranties(long activeWarranties) {
        this.activeWarranties = activeWarranties;
    }

    public long getExpiringSoonWarranties() {
        return expiringSoonWarranties;
    }

    public void setExpiringSoonWarranties(long expiringSoonWarranties) {
        this.expiringSoonWarranties = expiringSoonWarranties;
    }

    public long getExpiredWarranties() {
        return expiredWarranties;
    }

    public void setExpiredWarranties(long expiredWarranties) {
        this.expiredWarranties = expiredWarranties;
    }

    public BigDecimal getTotalValueProtected() {
        return totalValueProtected;
    }

    public void setTotalValueProtected(BigDecimal totalValueProtected) {
        this.totalValueProtected = totalValueProtected;
    }

    public BigDecimal getTotalRepairCost() {
        return totalRepairCost;
    }

    public void setTotalRepairCost(BigDecimal totalRepairCost) {
        this.totalRepairCost = totalRepairCost;
    }

    public long getUnreadNotifications() {
        return unreadNotifications;
    }

    public void setUnreadNotifications(long unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }

    public List<ProductSummaryResponse> getExpiringSoonProducts() {
        return expiringSoonProducts;
    }

    public void setExpiringSoonProducts(List<ProductSummaryResponse> expiringSoonProducts) {
        this.expiringSoonProducts = expiringSoonProducts;
    }

    public List<RepairResponse> getRecentRepairs() {
        return recentRepairs;
    }

    public void setRecentRepairs(List<RepairResponse> recentRepairs) {
        this.recentRepairs = recentRepairs;
    }

    public List<CategoryDistributionResponse> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(List<CategoryDistributionResponse> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }
}

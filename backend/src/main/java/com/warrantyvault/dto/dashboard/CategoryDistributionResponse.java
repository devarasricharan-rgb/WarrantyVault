package com.warrantyvault.dto.dashboard;

import com.warrantyvault.entity.Category;

public class CategoryDistributionResponse {

    private Category category;
    private String displayName;
    private long count;
    private double percentage;

    public CategoryDistributionResponse() {
    }

    public CategoryDistributionResponse(Category category, String displayName, long count, double percentage) {
        this.category = category;
        this.displayName = displayName;
        this.count = count;
        this.percentage = percentage;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}

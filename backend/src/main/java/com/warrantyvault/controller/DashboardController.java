package com.warrantyvault.controller;

import com.warrantyvault.dto.dashboard.CategoryDistributionResponse;
import com.warrantyvault.dto.dashboard.DashboardStatsResponse;
import com.warrantyvault.security.UserPrincipal;
import com.warrantyvault.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Endpoints for aggregated overview metrics and category distributions")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get aggregated dashboard statistics, upcoming expirations, and recent activities")
    public ResponseEntity<DashboardStatsResponse> getStats(@AuthenticationPrincipal UserPrincipal principal) {
        DashboardStatsResponse response = dashboardService.getDashboardStats(principal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    @Operation(summary = "Get category breakdown and percentages for logged user's products")
    public ResponseEntity<List<CategoryDistributionResponse>> getCategoryDistribution(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CategoryDistributionResponse> response = dashboardService.getCategoryDistribution(principal.getId());
        return ResponseEntity.ok(response);
    }
}

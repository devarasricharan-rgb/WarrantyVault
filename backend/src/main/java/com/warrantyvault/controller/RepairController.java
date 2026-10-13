package com.warrantyvault.controller;

import com.warrantyvault.dto.common.ApiResponse;
import com.warrantyvault.dto.common.PagedResponse;
import com.warrantyvault.dto.repair.RepairRequest;
import com.warrantyvault.dto.repair.RepairResponse;
import com.warrantyvault.dto.repair.RepairStatusUpdateRequest;
import com.warrantyvault.entity.RepairStatus;
import com.warrantyvault.security.UserPrincipal;
import com.warrantyvault.service.RepairService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/repairs")
@Tag(name = "Repairs", description = "Endpoints for logging, tracking, and updating service repair claims")
public class RepairController {

    private final RepairService repairService;

    public RepairController(RepairService repairService) {
        this.repairService = repairService;
    }

    @GetMapping
    @Operation(summary = "Get paginated repair records with optional status and search filter")
    public ResponseEntity<PagedResponse<RepairResponse>> getRepairs(
            @RequestParam(required = false) RepairStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "requestDate,desc") String sort,
            @AuthenticationPrincipal UserPrincipal principal) {

        String[] sortParams = sort.split(",");
        String sortProperty = sortParams[0];
        Sort.Direction sortDirection = (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortProperty));
        PagedResponse<RepairResponse> response = repairService.getRepairs(principal.getId(), status, keyword, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get repair record by ID")
    public ResponseEntity<RepairResponse> getRepairById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        RepairResponse response = repairService.getRepairById(id, principal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get all repair records for a specific product")
    public ResponseEntity<List<RepairResponse>> getRepairsByProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RepairResponse> response = repairService.getRepairsByProduct(productId, principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Log a new repair request")
    public ResponseEntity<RepairResponse> createRepair(
            @Valid @RequestBody RepairRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RepairResponse response = repairService.createRepair(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing repair record")
    public ResponseEntity<RepairResponse> updateRepair(
            @PathVariable Long id,
            @Valid @RequestBody RepairRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RepairResponse response = repairService.updateRepair(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update repair status, actual cost, and completion date")
    public ResponseEntity<RepairResponse> updateRepairStatus(
            @PathVariable Long id,
            @Valid @RequestBody RepairStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RepairResponse response = repairService.updateRepairStatus(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a repair record")
    public ResponseEntity<ApiResponse<Void>> deleteRepair(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        repairService.deleteRepair(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Repair record deleted successfully"));
    }
}

package com.warrantyvault.controller;

import com.warrantyvault.dto.common.PagedResponse;
import com.warrantyvault.dto.product.ProductResponse;
import com.warrantyvault.security.UserPrincipal;
import com.warrantyvault.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/warranties")
@Tag(name = "Warranties", description = "Endpoints for filtering products by specific warranty status")
public class WarrantyController {

    private final ProductService productService;

    public WarrantyController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/active")
    @Operation(summary = "Get paginated active warranties")
    public ResponseEntity<PagedResponse<ProductResponse>> getActiveWarranties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "warrantyExpiryDate"));
        PagedResponse<ProductResponse> response = productService.getAllProducts(
                principal.getId(), null, null, "ACTIVE", pageable
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expiring-soon")
    @Operation(summary = "Get paginated warranties expiring within the next 30 days")
    public ResponseEntity<PagedResponse<ProductResponse>> getExpiringSoonWarranties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "warrantyExpiryDate"));
        PagedResponse<ProductResponse> response = productService.getAllProducts(
                principal.getId(), null, null, "EXPIRING_SOON", pageable
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expired")
    @Operation(summary = "Get paginated expired warranties")
    public ResponseEntity<PagedResponse<ProductResponse>> getExpiredWarranties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "warrantyExpiryDate"));
        PagedResponse<ProductResponse> response = productService.getAllProducts(
                principal.getId(), null, null, "EXPIRED", pageable
        );
        return ResponseEntity.ok(response);
    }
}

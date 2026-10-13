package com.warrantyvault.controller;

import com.warrantyvault.dto.common.ApiResponse;
import com.warrantyvault.dto.common.PagedResponse;
import com.warrantyvault.dto.product.ProductRequest;
import com.warrantyvault.dto.product.ProductResponse;
import com.warrantyvault.entity.Category;
import com.warrantyvault.security.UserPrincipal;
import com.warrantyvault.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Endpoints for managing products, receipts, and warranties")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Get paginated products with optional search, category, and warranty status filters")
    public ResponseEntity<PagedResponse<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @AuthenticationPrincipal UserPrincipal principal) {

        String[] sortParams = sort.split(",");
        String sortProperty = sortParams[0];
        Sort.Direction sortDirection = (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortProperty));
        PagedResponse<ProductResponse> response = productService.getAllProducts(
                principal.getId(), keyword, category, status, pageable
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details by ID")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProductResponse response = productService.getProductById(id, principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new product (JSON body)")
    public ResponseEntity<ProductResponse> createProductJson(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProductResponse response = productService.createProduct(request, null, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new product with optional receipt file attachment")
    public ResponseEntity<ProductResponse> createProductWithReceipt(
            @Valid @RequestPart("product") ProductRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProductResponse response = productService.createProduct(request, receipt, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update an existing product (JSON body)")
    public ResponseEntity<ProductResponse> updateProductJson(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProductResponse response = productService.updateProduct(id, request, null, principal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update an existing product with optional new receipt file")
    public ResponseEntity<ProductResponse> updateProductWithReceipt(
            @PathVariable Long id,
            @Valid @RequestPart("product") ProductRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProductResponse response = productService.updateProduct(id, request, receipt, principal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product and its receipt attachment")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        productService.deleteProduct(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }

    @GetMapping("/{id}/receipt")
    @Operation(summary = "Download or stream product receipt file")
    public ResponseEntity<Resource> downloadReceipt(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProductService.ReceiptDownload receipt = productService.getReceipt(id, principal.getId());

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(receipt.contentType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + receipt.originalFilename() + "\"")
                .body(receipt.resource());
    }
}

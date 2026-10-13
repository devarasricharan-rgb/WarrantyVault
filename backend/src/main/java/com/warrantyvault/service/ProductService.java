package com.warrantyvault.service;

import com.warrantyvault.dto.common.PagedResponse;
import com.warrantyvault.dto.product.ProductRequest;
import com.warrantyvault.dto.product.ProductResponse;
import com.warrantyvault.entity.Category;
import com.warrantyvault.entity.Product;
import com.warrantyvault.entity.User;
import com.warrantyvault.exception.BadRequestException;
import com.warrantyvault.exception.ResourceNotFoundException;
import com.warrantyvault.repository.ProductRepository;
import com.warrantyvault.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ProductService(ProductRepository productRepository,
                          UserRepository userRepository,
                          FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile receiptFile, Long userId) {
        User user = getUser(userId);

        Product product = new Product();
        product.setUser(user);
        mapRequestToProduct(request, product);

        if (receiptFile != null && !receiptFile.isEmpty()) {
            String storedFileName = fileStorageService.storeFile(receiptFile);
            product.setReceiptFileName(storedFileName);
            product.setReceiptOriginalName(receiptFile.getOriginalFilename());
            product.setReceiptContentType(receiptFile.getContentType());
        }

        Product savedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile receiptFile, Long userId) {
        User user = getUser(userId);

        Product product = productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        mapRequestToProduct(request, product);

        if (receiptFile != null && !receiptFile.isEmpty()) {
            // Delete old file if present
            if (product.getReceiptFileName() != null) {
                fileStorageService.deleteFile(product.getReceiptFileName());
            }
            String storedFileName = fileStorageService.storeFile(receiptFile);
            product.setReceiptFileName(storedFileName);
            product.setReceiptOriginalName(receiptFile.getOriginalFilename());
            product.setReceiptContentType(receiptFile.getContentType());
        }

        Product updatedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(updatedProduct);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id, Long userId) {
        User user = getUser(userId);
        Product product = productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductResponse.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getAllProducts(Long userId,
                                                        String keyword,
                                                        Category category,
                                                        String status,
                                                        Pageable pageable) {
        User user = getUser(userId);
        LocalDate today = LocalDate.now();
        LocalDate expiringThreshold = today.plusDays(30);

        Page<Product> page;
        if (status != null && !status.isBlank()) {
            String statusUpper = status.trim().toUpperCase();
            switch (statusUpper) {
                case "ACTIVE" -> page = productRepository.findActiveWarranties(user, today, expiringThreshold, pageable);
                case "EXPIRING_SOON" -> page = productRepository.findExpiringSoonWarranties(user, today, expiringThreshold, pageable);
                case "EXPIRED" -> page = productRepository.findExpiredWarranties(user, today, pageable);
                default -> throw new BadRequestException("Invalid warranty status filter: " + status + ". Allowed values: ACTIVE, EXPIRING_SOON, EXPIRED");
            }
        } else if ((keyword != null && !keyword.isBlank()) || category != null) {
            String sanitizedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
            page = productRepository.searchProducts(user, sanitizedKeyword, category, pageable);
        } else {
            page = productRepository.findAllByUser(user, pageable);
        }

        Page<ProductResponse> dtoPage = page.map(ProductResponse::fromEntity);
        return PagedResponse.fromPage(dtoPage);
    }

    @Transactional
    public void deleteProduct(Long id, Long userId) {
        User user = getUser(userId);
        Product product = productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getReceiptFileName() != null) {
            fileStorageService.deleteFile(product.getReceiptFileName());
        }

        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public ReceiptDownload getReceipt(Long id, Long userId) {
        User user = getUser(userId);
        Product product = productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getReceiptFileName() == null || product.getReceiptFileName().isBlank()) {
            throw new ResourceNotFoundException("No receipt attached to product with id: " + id);
        }

        Resource resource = fileStorageService.loadFileAsResource(product.getReceiptFileName());
        return new ReceiptDownload(
                resource,
                product.getReceiptOriginalName() != null ? product.getReceiptOriginalName() : product.getReceiptFileName(),
                product.getReceiptContentType() != null ? product.getReceiptContentType() : "application/octet-stream"
        );
    }

    private void mapRequestToProduct(ProductRequest request, Product product) {
        product.setName(request.getName().trim());
        product.setBrand(request.getBrand().trim());
        product.setCategory(request.getCategory());
        product.setModelNumber(request.getModelNumber() != null ? request.getModelNumber().trim() : null);
        product.setSerialNumber(request.getSerialNumber() != null ? request.getSerialNumber().trim() : null);
        product.setPurchasePrice(request.getPurchasePrice());
        product.setPurchaseDate(request.getPurchaseDate());
        product.setWarrantyDurationMonths(request.getWarrantyDurationMonths());

        LocalDate startDate = request.getWarrantyStartDate() != null
                ? request.getWarrantyStartDate()
                : request.getPurchaseDate();
        product.setWarrantyStartDate(startDate);

        // Accurate calendar month addition handling leap years and 28/29/30/31 days
        LocalDate expiryDate = startDate.plusMonths(request.getWarrantyDurationMonths());
        product.setWarrantyExpiryDate(expiryDate);

        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
    }

    public record ReceiptDownload(Resource resource, String originalFilename, String contentType) {}
}

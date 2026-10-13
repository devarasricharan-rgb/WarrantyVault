package com.warrantyvault;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.warrantyvault.dto.auth.RegisterRequest;
import com.warrantyvault.dto.product.ProductRequest;
import com.warrantyvault.entity.Category;
import com.warrantyvault.repository.ProductRepository;
import com.warrantyvault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductServiceAndControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String getAuthToken(String name, String email, String password) throws Exception {
        RegisterRequest register = new RegisterRequest(name, email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return jsonNode.get("accessToken").asText();
    }

    @Test
    void createProduct_ShouldAccuratelyCalculateWarrantyExpiryIncludingLeapYears() throws Exception {
        String token = getAuthToken("Dave Clark", "dave@example.com", "Password123!");

        // Leap year test: 2024 is a leap year. 2024-01-31 + 1 month = 2024-02-29
        ProductRequest leapYearProduct = new ProductRequest();
        leapYearProduct.setName("MacBook Pro");
        leapYearProduct.setBrand("Apple");
        leapYearProduct.setCategory(Category.LAPTOPS_AND_COMPUTERS);
        leapYearProduct.setPurchasePrice(new BigDecimal("1999.99"));
        leapYearProduct.setPurchaseDate(LocalDate.of(2024, 1, 31));
        leapYearProduct.setWarrantyDurationMonths(1);

        mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(leapYearProduct)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.warrantyExpiryDate", is("2024-02-29")))
                .andExpect(jsonPath("$.warrantyStatus", is("EXPIRED")));

        // Non-leap year test: 2023 is non-leap. 2023-01-31 + 1 month = 2023-02-28
        ProductRequest nonLeapYearProduct = new ProductRequest();
        nonLeapYearProduct.setName("Dell XPS");
        nonLeapYearProduct.setBrand("Dell");
        nonLeapYearProduct.setCategory(Category.LAPTOPS_AND_COMPUTERS);
        nonLeapYearProduct.setPurchasePrice(new BigDecimal("1499.00"));
        nonLeapYearProduct.setPurchaseDate(LocalDate.of(2023, 1, 31));
        nonLeapYearProduct.setWarrantyDurationMonths(1);

        mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nonLeapYearProduct)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.warrantyExpiryDate", is("2023-02-28")));
    }

    @Test
    void userOwnershipIsolation_UserCannotAccessOrDeleteAnotherUsersProduct() throws Exception {
        String userOneToken = getAuthToken("User One", "user1@example.com", "Password123!");
        String userTwoToken = getAuthToken("User Two", "user2@example.com", "Password123!");

        // User 1 creates product
        ProductRequest product = new ProductRequest();
        product.setName("iPhone 15 Pro");
        product.setBrand("Apple");
        product.setCategory(Category.MOBILE_PHONES);
        product.setPurchasePrice(new BigDecimal("999.00"));
        product.setPurchaseDate(LocalDate.now());
        product.setWarrantyDurationMonths(12);

        MvcResult createResult = mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + userOneToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product)))
                .andExpect(status().isCreated())
                .andReturn();

        Long productId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // User 1 can view it
        mockMvc.perform(get("/api/v1/products/" + productId)
                        .header("Authorization", "Bearer " + userOneToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("iPhone 15 Pro")));

        // User 2 CANNOT view User 1's product (must be 404 Not Found)
        mockMvc.perform(get("/api/v1/products/" + productId)
                        .header("Authorization", "Bearer " + userTwoToken))
                .andExpect(status().isNotFound());

        // User 2 CANNOT delete User 1's product
        mockMvc.perform(delete("/api/v1/products/" + productId)
                        .header("Authorization", "Bearer " + userTwoToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void warrantyFilter_ShouldProperlyFilterActiveWarranties() throws Exception {
        String token = getAuthToken("Filter User", "filter@example.com", "Password123!");

        // Active warranty (purchase today, 24 months duration)
        ProductRequest activeProduct = new ProductRequest();
        activeProduct.setName("Active TV");
        activeProduct.setBrand("LG");
        activeProduct.setCategory(Category.TVS_AND_MONITORS);
        activeProduct.setPurchasePrice(new BigDecimal("699.00"));
        activeProduct.setPurchaseDate(LocalDate.now());
        activeProduct.setWarrantyDurationMonths(24);

        mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activeProduct)))
                .andExpect(status().isCreated());

        // Query active warranties endpoint
        mockMvc.perform(get("/api/v1/warranties/active")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].name", is("Active TV")))
                .andExpect(jsonPath("$.content[0].warrantyStatus", is("ACTIVE")));
    }
}

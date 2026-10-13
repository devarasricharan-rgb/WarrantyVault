package com.warrantyvault;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.warrantyvault.dto.auth.RegisterRequest;
import com.warrantyvault.dto.product.ProductRequest;
import com.warrantyvault.dto.repair.RepairRequest;
import com.warrantyvault.dto.repair.RepairStatusUpdateRequest;
import com.warrantyvault.entity.Category;
import com.warrantyvault.entity.RepairStatus;
import com.warrantyvault.repository.NotificationRepository;
import com.warrantyvault.repository.ProductRepository;
import com.warrantyvault.repository.RepairRepository;
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
class RepairAndNotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RepairRepository repairRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        repairRepository.deleteAll();
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
    void repairWorkflow_ShouldCreateRepairAndGenerateNotificationOnCompletion() throws Exception {
        String token = getAuthToken("Frank Miller", "frank@example.com", "Password123!");

        // 1. Create product
        ProductRequest product = new ProductRequest();
        product.setName("Sony Headphones");
        product.setBrand("Sony");
        product.setCategory(Category.AUDIO_DEVICES);
        product.setPurchasePrice(new BigDecimal("299.99"));
        product.setPurchaseDate(LocalDate.now());
        product.setWarrantyDurationMonths(12);

        MvcResult prodResult = mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product)))
                .andExpect(status().isCreated())
                .andReturn();

        Long productId = objectMapper.readTree(prodResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Log repair request
        RepairRequest repair = new RepairRequest();
        repair.setProductId(productId);
        repair.setIssueTitle("Left earcup silent");
        repair.setIssueDescription("No audio coming from the left driver.");
        repair.setRequestDate(LocalDate.now());
        repair.setServiceCenterName("Sony Authorized Care");
        repair.setStatus(RepairStatus.REQUESTED);

        MvcResult repairResult = mockMvc.perform(post("/api/v1/repairs")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(repair)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.issueTitle", is("Left earcup silent")))
                .andExpect(jsonPath("$.status", is("REQUESTED")))
                .andReturn();

        Long repairId = objectMapper.readTree(repairResult.getResponse().getContentAsString()).get("id").asLong();

        // 3. Update repair to COMPLETED with cost
        RepairStatusUpdateRequest statusUpdate = new RepairStatusUpdateRequest();
        statusUpdate.setStatus(RepairStatus.COMPLETED);
        statusUpdate.setCost(new BigDecimal("45.00"));
        statusUpdate.setNotes("Replaced left speaker wiring");

        mockMvc.perform(patch("/api/v1/repairs/" + repairId + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.cost", is(45.00)));

        // 4. Verify notification was automatically generated
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(1)));

        MvcResult notifResult = mockMvc.perform(get("/api/v1/notifications/recent")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", containsString("Repair Completed")))
                .andReturn();

        Long notifId = objectMapper.readTree(notifResult.getResponse().getContentAsString()).get(0).get("id").asLong();

        // 5. Mark notification as read
        mockMvc.perform(patch("/api/v1/notifications/" + notifId + "/read")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead", is(true)));

        // 6. Verify dashboard stats include product, repair cost, and total protected value
        mockMvc.perform(get("/api/v1/dashboard/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts", is(1)))
                .andExpect(jsonPath("$.totalRepairCost", is(45.0)))
                .andExpect(jsonPath("$.totalValueProtected", is(299.99)));
    }
}

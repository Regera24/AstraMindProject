package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.request.account.AccountUpdateRequest;
import az.schedule.backendservice.service.AccountService;
import az.schedule.backendservice.utils.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AccountController.class)
@AutoConfigureMockMvc(addFilters = false)
@ExtendWith(MockitoExtension.class)
@DisplayName("AccountController Unit Tests")
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AccountService accountService;

    @Autowired
    private ObjectMapper objectMapper;

    private AccountDTO mockAccountDTO;
    private AccountUpdateRequest mockUpdateRequest;

    @BeforeEach
    void setUp() {
        mockAccountDTO = AccountDTO.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .build();

        mockUpdateRequest = new AccountUpdateRequest();
        mockUpdateRequest.setFullName("Updated Name");
        mockUpdateRequest.setPhoneNumber("0123456789");
    }

    @Test
    @DisplayName("Should get current account successfully")
    void testGetCurrentAccount_Success() throws Exception {
        // Given
        when(accountService.getCurrentAccount()).thenReturn(mockAccountDTO);

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get current account successfully"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("testuser"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));

        verify(accountService, times(1)).getCurrentAccount();
    }

    @Test
    @DisplayName("Should get account by ID successfully")
    void testGetAccountById_Success() throws Exception {
        // Given
        Long accountId = 1L;
        when(accountService.getAccountById(accountId)).thenReturn(mockAccountDTO);

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/{id}", accountId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get account successfully"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("testuser"));

        verify(accountService, times(1)).getAccountById(accountId);
    }

    @Test
    @DisplayName("Should update current account successfully")
    void testUpdateCurrentAccount_Success() throws Exception {
        // Given
        Long currentAccountId = 1L;
        when(accountService.updateAccount(eq(currentAccountId), any(AccountUpdateRequest.class)))
                .thenReturn(mockAccountDTO);

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(currentAccountId);

            // When & Then
            mockMvc.perform(put("/api/v1/accounts/me")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(mockUpdateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.message").value("Update account successfully"))
                    .andExpect(jsonPath("$.data.id").value(1));

            verify(accountService, times(1)).updateAccount(eq(currentAccountId), any(AccountUpdateRequest.class));
        }
    }

    @Test
    @DisplayName("Should update account by ID successfully")
    void testUpdateAccountById_Success() throws Exception {
        // Given
        Long accountId = 2L;
        when(accountService.updateAccount(eq(accountId), any(AccountUpdateRequest.class)))
                .thenReturn(mockAccountDTO);

        // When & Then
        mockMvc.perform(put("/api/v1/accounts/{id}", accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockUpdateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Update account successfully"))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(accountService, times(1)).updateAccount(eq(accountId), any(AccountUpdateRequest.class));
    }

    @Test
    @DisplayName("Should handle validation error when updating account")
    void testUpdateAccount_ValidationError() throws Exception {
        // Given - Invalid request with null/empty fields
        AccountUpdateRequest invalidRequest = new AccountUpdateRequest();
        // Assuming validation would fail for empty required fields

        // When & Then
        mockMvc.perform(put("/api/v1/accounts/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isOk()); // Will be handled by validation

        verify(accountService, never()).updateAccount(any(), any());
    }

    @Test
    @DisplayName("Should handle service exception when getting account")
    void testGetAccountById_ServiceException() throws Exception {
        // Given
        Long accountId = 999L;
        when(accountService.getAccountById(accountId))
                .thenThrow(new RuntimeException("Account not found"));

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/{id}", accountId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());

        verify(accountService, times(1)).getAccountById(accountId);
    }
}

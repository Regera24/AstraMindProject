package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.request.admin.UpdateUserRoleRequest;
import az.schedule.backendservice.dto.request.admin.UpdateUserStatusRequest;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.dto.response.admin.SystemStatisticsResponse;
import az.schedule.backendservice.service.AdminService;
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
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminController Unit Tests")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @Autowired
    private ObjectMapper objectMapper;

    private SystemStatisticsResponse mockStatistics;
    private PageResponse<AccountDTO> mockPageResponse;
    private AccountDTO mockAccountDTO;

    @BeforeEach
    void setUp() {
        mockStatistics = SystemStatisticsResponse.builder()
                .totalUsers(100L)
                .totalTasks(500L)
                .totalCategories(20L)
                .activeUsers(80L)
                .build();

        mockAccountDTO = AccountDTO.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .build();

        List<AccountDTO> users = Arrays.asList(mockAccountDTO);
        mockPageResponse = PageResponse.<AccountDTO>builder()
                .data(users)
                .pageNo(0)
                .pageSize(10)
                .totalPages(1L)
                .build();
    }

    @Test
    @DisplayName("Should get system statistics successfully")
    void testGetSystemStatistics_Success() throws Exception {
        // Given
        when(adminService.getSystemStatistics()).thenReturn(mockStatistics);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/statistics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("System statistics retrieved successfully"))
                .andExpect(jsonPath("$.data.totalUsers").value(100))
                .andExpect(jsonPath("$.data.totalTasks").value(500))
                .andExpect(jsonPath("$.data.activeUsers").value(80));

        verify(adminService, times(1)).getSystemStatistics();
    }

    @Test
    @DisplayName("Should get all users with pagination successfully")
    void testGetAllUsers_Success() throws Exception {
        // Given
        when(adminService.getAllUsers(any(Pageable.class))).thenReturn(mockPageResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/users")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "createdAt")
                        .param("sortDirection", "DESC")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"))
                .andExpect(jsonPath("$.data.data[0].username").value("testuser"))
                .andExpect(jsonPath("$.data.totalElements").value(1));

        verify(adminService, times(1)).getAllUsers(any(Pageable.class));
    }

    @Test
    @DisplayName("Should search users by keyword successfully")
    void testSearchUsers_Success() throws Exception {
        // Given
        String keyword = "test";
        when(adminService.searchUsers(eq(keyword), any(Pageable.class))).thenReturn(mockPageResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/users/search")
                        .param("keyword", keyword)
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Users search completed successfully"))
                .andExpect(jsonPath("$.data.data[0].username").value("testuser"));

        verify(adminService, times(1)).searchUsers(eq(keyword), any(Pageable.class));
    }

    @Test
    @DisplayName("Should update user role successfully")
    void testUpdateUserRole_Success() throws Exception {
        // Given
        Long userId = 1L;
        Long roleId = 2L;
        UpdateUserRoleRequest request = new UpdateUserRoleRequest();
        request.setRoleId(roleId);

        when(adminService.updateUserRole(userId, roleId)).thenReturn(mockAccountDTO);

        // When & Then
        mockMvc.perform(put("/api/v1/admin/users/{userId}/role", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User role updated successfully"))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(adminService, times(1)).updateUserRole(userId, roleId);
    }

    @Test
    @DisplayName("Should update user status successfully")
    void testUpdateUserStatus_Success() throws Exception {
        // Given
        Long userId = 1L;
        Boolean isActive = false;
        UpdateUserStatusRequest request = new UpdateUserStatusRequest();
        request.setIsActive(isActive);

        when(adminService.updateUserStatus(userId, isActive)).thenReturn(mockAccountDTO);

        // When & Then
        mockMvc.perform(put("/api/v1/admin/users/{userId}/status", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User status updated successfully"))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(adminService, times(1)).updateUserStatus(userId, isActive);
    }

    @Test
    @DisplayName("Should delete user successfully")
    void testDeleteUser_Success() throws Exception {
        // Given
        Long userId = 2L;
        Long currentUserId = 1L;

        doNothing().when(adminService).deleteUser(userId);

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(currentUserId);

            // When & Then
            mockMvc.perform(delete("/api/v1/admin/users/{userId}", userId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.message").value("User deleted successfully"));

            verify(adminService, times(1)).deleteUser(userId);
        }
    }

    @Test
    @DisplayName("Should prevent admin from deleting themselves")
    void testDeleteUser_SelfDeletion_Fails() throws Exception {
        // Given
        Long userId = 1L;
        Long currentUserId = 1L; // Same as userId

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(currentUserId);

            // When & Then
            mockMvc.perform(delete("/api/v1/admin/users/{userId}", userId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(400))
                    .andExpect(jsonPath("$.message").value("You cannot delete your own account"));

            verify(adminService, never()).deleteUser(anyLong());
        }
    }

    @Test
    @DisplayName("Should get user by ID successfully")
    void testGetUserById_Success() throws Exception {
        // Given
        Long userId = 1L;
        when(adminService.getAllUsers(any(Pageable.class))).thenReturn(mockPageResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/users/{userId}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User retrieved successfully"))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(adminService, times(1)).getAllUsers(any(Pageable.class));
    }

    @Test
    @DisplayName("Should handle missing keyword in search")
    void testSearchUsers_MissingKeyword() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/admin/users/search")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError());

        verify(adminService, never()).searchUsers(anyString(), any(Pageable.class));
    }

    @Test
    @DisplayName("Should use default pagination parameters")
    void testGetAllUsers_DefaultParameters() throws Exception {
        // Given
        when(adminService.getAllUsers(any(Pageable.class))).thenReturn(mockPageResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(adminService, times(1)).getAllUsers(any(Pageable.class));
    }

    @Test
    @DisplayName("Should handle service exception when getting statistics")
    void testGetSystemStatistics_ServiceException() throws Exception {
        // Given
        when(adminService.getSystemStatistics())
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/api/v1/admin/statistics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());

        verify(adminService, times(1)).getSystemStatistics();
    }
}

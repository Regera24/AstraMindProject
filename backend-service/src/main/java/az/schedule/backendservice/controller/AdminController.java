package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.request.admin.UpdateUserRoleRequest;
import az.schedule.backendservice.dto.request.admin.UpdateUserStatusRequest;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.dto.response.admin.SystemStatisticsResponse;
import az.schedule.backendservice.service.AccountService;
import az.schedule.backendservice.service.AdminService;
import az.schedule.backendservice.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin API", description = "Administrative endpoints for system management (Admin only)")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    private final AccountService accountService;

    @Operation(summary = "Get system statistics", description = "Retrieve system-wide statistics including users, tasks, and categories")
    @GetMapping("/statistics")
    public ApiResponse<SystemStatisticsResponse> getSystemStatistics() {
        SystemStatisticsResponse statistics = adminService.getSystemStatistics();
        return ApiResponse.<SystemStatisticsResponse>builder()
                .code(HttpStatus.OK.value())
                .message("System statistics retrieved successfully")
                .data(statistics)
                .build();
    }

    @Operation(summary = "Get all users", description = "Retrieve all users with pagination")
    @GetMapping("/users")
    public ApiResponse<PageResponse<AccountDTO>> getAllUsers(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PageResponse<AccountDTO> users = adminService.getAllUsers(pageable);
        return ApiResponse.<PageResponse<AccountDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Users retrieved successfully")
                .data(users)
                .build();
    }

    @Operation(summary = "Get all users with filtered", description = "Retrieve all users with pagination")
    @GetMapping("/users-filtered")
    public ApiResponse<PageResponse<AccountDTO>> getAllUsersFilter(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "createdDate") String sortBy,
            @Parameter(description = "Search Criteria") @RequestParam(required = false) String... searchs) {

        PageResponse<AccountDTO> users = accountService.getNewsArticlesByCriteria(pageNo, pageSize, sortBy, searchs);
        return ApiResponse.<PageResponse<AccountDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Users retrieved successfully")
                .data(users)
                .build();
    }

    @Operation(summary = "Search users", description = "Search users by keyword (username, email, or full name)")
    @GetMapping("/users/search")
    public ApiResponse<PageResponse<AccountDTO>> searchUsers(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<AccountDTO> users = adminService.searchUsers(keyword, pageable);
        
        return ApiResponse.<PageResponse<AccountDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Users search completed successfully")
                .data(users)
                .build();
    }

    @Operation(summary = "Update user role", description = "Update a user's role (Admin only)")
    @PutMapping("/users/{userId}/role")
    public ApiResponse<AccountDTO> updateUserRole(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        
        AccountDTO updatedUser = adminService.updateUserRole(userId, request.getRoleId());
        return ApiResponse.<AccountDTO>builder()
                .code(HttpStatus.OK.value())
                .message("User role updated successfully")
                .data(updatedUser)
                .build();
    }

    @Operation(summary = "Update user status", description = "Activate or deactivate a user account")
    @PutMapping("/users/{userId}/status")
    public ApiResponse<AccountDTO> updateUserStatus(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        
        AccountDTO updatedUser = adminService.updateUserStatus(userId, request.getIsActive());
        return ApiResponse.<AccountDTO>builder()
                .code(HttpStatus.OK.value())
                .message("User status updated successfully")
                .data(updatedUser)
                .build();
    }

    @Operation(summary = "Delete user", description = "Delete a user account permanently")
    @DeleteMapping("/users/{userId}")
    public ApiResponse<Void> deleteUser(@Parameter(description = "User ID") @PathVariable Long userId) {
        // Prevent admin from deleting themselves
        Long currentUserId = SecurityUtils.getCurrentAccountId();
        if (currentUserId.equals(userId)) {
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("You cannot delete your own account")
                    .build();
        }
        
        adminService.deleteUser(userId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("User deleted successfully")
                .build();
    }

    @Operation(summary = "Get user by ID", description = "Retrieve detailed information about a specific user")
    @GetMapping("/users/{userId}")
    public ApiResponse<AccountDTO> getUserById(@Parameter(description = "User ID") @PathVariable Long userId) {
        // Reusing AccountService through AdminService for consistency
        AccountDTO user = adminService.getAllUsers(PageRequest.of(0, Integer.MAX_VALUE))
                .getData()
                .stream()
                .filter(account -> account.getId().equals(userId))
                .findFirst()
                .orElse(null);
        
        return ApiResponse.<AccountDTO>builder()
                .code(HttpStatus.OK.value())
                .message("User retrieved successfully")
                .data(user)
                .build();
    }
}

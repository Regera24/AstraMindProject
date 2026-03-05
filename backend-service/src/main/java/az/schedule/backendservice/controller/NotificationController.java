package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.NotificationDTO;
import az.schedule.backendservice.dto.request.notification.NotificationRequest;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.service.NotificationService;
import az.schedule.backendservice.utils.SecurityUtils;
import az.schedule.backendservice.utils.SortUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Notification API", description = "Endpoints for managing notifications")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final az.schedule.backendservice.utils.MessageUtils messageUtils;

    @Operation(summary = "Create a notification", description = "Create a new notification")
    @PostMapping
    public ApiResponse<NotificationDTO> createNotification(@Valid @RequestBody NotificationRequest request) {
        Long sendAccountId = SecurityUtils.getCurrentAccountId();
        NotificationDTO notification = notificationService.createNotification(request, sendAccountId);
        return ApiResponse.<NotificationDTO>builder()
                .code(HttpStatus.CREATED.value())
                .message(messageUtils.getMessage("success.notification.create"))
                .data(notification)
                .build();
    }

    @Operation(summary = "Mark notification as read", description = "Mark a notification as read")
    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@Parameter(description = "Notification ID") @PathVariable Long id) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        notificationService.markAsRead(id, accountId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message(messageUtils.getMessage("success.notification.mark.read"))
                .build();
    }

    @Operation(summary = "Delete a notification", description = "Delete a notification by its ID")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(@Parameter(description = "Notification ID") @PathVariable Long id) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        notificationService.deleteNotification(id, accountId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message(messageUtils.getMessage("success.notification.delete"))
                .build();
    }

    @Operation(summary = "Get all notifications", description = "Get all notifications for the current user with pagination")
    @GetMapping
    public ApiResponse<PageResponse<NotificationDTO>> getNotifications(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<NotificationDTO> notifications = notificationService.getNotificationsByAccount(accountId, pageable);
        return ApiResponse.<PageResponse<NotificationDTO>>builder()
                .code(HttpStatus.OK.value())
                .message(messageUtils.getMessage("success.notifications.get"))
                .data(notifications)
                .build();
    }

    @Operation(summary = "Get unread notifications", description = "Get all unread notifications for the current user")
    @GetMapping("/unread")
    public ApiResponse<List<NotificationDTO>> getUnreadNotifications() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(accountId);
        return ApiResponse.<List<NotificationDTO>>builder()
                .code(HttpStatus.OK.value())
                .message(messageUtils.getMessage("success.notifications.get.unread"))
                .data(notifications)
                .build();
    }

    @Operation(summary = "Count unread notifications", description = "Get the count of unread notifications for the current user")
    @GetMapping("/unread/count")
    public ApiResponse<Long> countUnreadNotifications() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        long count = notificationService.countUnreadNotifications(accountId);
        return ApiResponse.<Long>builder()
                .code(HttpStatus.OK.value())
                .message(messageUtils.getMessage("success.notifications.count.unread"))
                .data(count)
                .build();
    }

    @Operation(summary = "Mark all notifications as read", description = "Mark all unread notifications as read for the current user")
    @PutMapping("/mark-all-read")
    public ApiResponse<Void> markAllAsRead() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        notificationService.markAllAsRead(accountId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message(messageUtils.getMessage("success.notification.mark.all.read"))
                .build();
    }
}

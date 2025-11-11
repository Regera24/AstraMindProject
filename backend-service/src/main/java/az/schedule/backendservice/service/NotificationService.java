package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.NotificationDTO;
import az.schedule.backendservice.dto.request.notification.NotificationRequest;
import az.schedule.backendservice.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface NotificationService {
    NotificationDTO createNotification(NotificationRequest request, Long sendAccountId);
    
    void markAsRead(Long id, Long accountId);
    
    void deleteNotification(Long id, Long accountId);
    
    PageResponse<NotificationDTO> getNotificationsByAccount(Long accountId, Pageable pageable);
    
    List<NotificationDTO> getUnreadNotifications(Long accountId);
    
    long countUnreadNotifications(Long accountId);
    
    void markAllAsRead(Long accountId);
}

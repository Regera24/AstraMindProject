package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.converter.NotificationConverter;
import az.schedule.backendservice.dto.NotificationDTO;
import az.schedule.backendservice.dto.request.notification.NotificationRequest;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Notification;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.repository.NotificationRepository;
import az.schedule.backendservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final AccountRepository accountRepository;
    private final NotificationConverter notificationConverter;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public NotificationDTO createNotification(NotificationRequest request, Long sendAccountId) {
        Account targetAccount = accountRepository.findById(request.getTargetAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        Account sendAccount = null;
        if (sendAccountId != null) {
            sendAccount = accountRepository.findById(sendAccountId)
                    .orElse(accountRepository.findById(1L).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
        }

        Notification notification = notificationConverter.toEntity(request, targetAccount, sendAccount);
        Notification savedNotification = notificationRepository.save(notification);

        NotificationDTO dto = notificationConverter.toDTO(savedNotification);

        messagingTemplate.convertAndSendToUser(
                targetAccount.getUsername(),
                "/queue/new-notification",
                dto
        );

        return dto;
    }

    @Override
    @Transactional
    public void markAsRead(Long id, Long accountId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getTargetAccount().getId().equals(accountId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id, Long accountId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getTargetAccount().getId().equals(accountId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        notificationRepository.delete(notification);
    }

    @Override
    public PageResponse<NotificationDTO> getNotificationsByAccount(Long accountId, Pageable pageable) {
        Page<Notification> notificationPage = notificationRepository.findByTargetAccountId(accountId, pageable);

        List<NotificationDTO> notificationDTOs = notificationPage.getContent().stream()
                .map(notificationConverter::toDTO)
                .collect(Collectors.toList());

        return PageResponse.<NotificationDTO>builder()
                .pageNo(notificationPage.getNumber())
                .pageSize(notificationPage.getSize())
                .totalPages((long) notificationPage.getTotalPages())
                .data(notificationDTOs)
                .build();
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(Long accountId) {
        List<Notification> notifications = notificationRepository.findByTargetAccountIdAndIsReadFalse(accountId);
        return notifications.stream()
                .map(notificationConverter::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countUnreadNotifications(Long accountId) {
        return notificationRepository.countByTargetAccountIdAndIsReadFalse(accountId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long accountId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByTargetAccountIdAndIsReadFalse(accountId);
        
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
}

package az.schedule.backendservice.converter;

import az.schedule.backendservice.dto.NotificationDTO;
import az.schedule.backendservice.dto.request.notification.NotificationRequest;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationConverter {
    private final ModelMapper modelMapper;

    public NotificationDTO toDTO(Notification notification) {
        NotificationDTO dto = modelMapper.map(notification, NotificationDTO.class);
        
        if (notification.getTargetAccount() != null) {
            dto.setTargetAccountId(notification.getTargetAccount().getId());
            dto.setTargetAccountUsername(notification.getTargetAccount().getUsername());
        }
        
        if (notification.getSendAccount() != null) {
            dto.setSendAccountId(notification.getSendAccount().getId());
            dto.setSendAccountUsername(notification.getSendAccount().getUsername());
        }
        
        return dto;
    }

    public Notification toEntity(NotificationRequest request, Account targetAccount, Account sendAccount) {
        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getContent());
        notification.setTargetAccount(targetAccount);
        notification.setSendAccount(sendAccount);
        notification.setIsRead(false);

        return notification;
    }
}

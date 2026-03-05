package az.schedule.backendservice.dto.request.notification;

import az.schedule.backendservice.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationRequest {
    @NotBlank(message = "{validation.title.required}")
    String title;
    
    @NotBlank(message = "{validation.content.required}")
    String content;

    NotificationType type;
    
    @NotNull(message = "{validation.target.account.required}")
    Long targetAccountId;
}

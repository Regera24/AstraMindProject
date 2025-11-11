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
    @NotBlank(message = "Title is required")
    String title;
    
    @NotBlank(message = "Content is required")
    String content;

    NotificationType type;
    
    @NotNull(message = "Target account ID is required")
    Long targetAccountId;
}

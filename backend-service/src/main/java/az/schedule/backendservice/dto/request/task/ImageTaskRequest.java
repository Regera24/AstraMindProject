package az.schedule.backendservice.dto.request.task;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageTaskRequest {
    @NotNull(message = "{validation.image.required}")
    MultipartFile image;
    
    String additionalContext; // Optional context from user
}

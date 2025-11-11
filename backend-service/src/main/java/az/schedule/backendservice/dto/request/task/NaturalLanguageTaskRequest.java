package az.schedule.backendservice.dto.request.task;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NaturalLanguageTaskRequest {
    @NotBlank(message = "Prompt is required")
    String prompt;
}

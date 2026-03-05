package az.schedule.backendservice.dto.request.task;

import az.schedule.backendservice.enums.TaskStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BulkTaskRequest {
    @NotEmpty(message = "{validation.task.ids.required}")
    List<Long> taskIds;
    
    @NotNull(message = "{validation.status.required}")
    TaskStatus status;
}

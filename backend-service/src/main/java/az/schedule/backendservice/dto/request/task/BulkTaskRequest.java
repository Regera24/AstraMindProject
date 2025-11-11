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
    @NotEmpty(message = "Task IDs cannot be empty")
    List<Long> taskIds;
    
    @NotNull(message = "Status is required")
    TaskStatus status;
}

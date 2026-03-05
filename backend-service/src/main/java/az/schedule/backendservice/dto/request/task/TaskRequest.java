package az.schedule.backendservice.dto.request.task;

import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskRequest {
    @NotBlank(message = "{validation.title.required}")
    @Size(min = 3, max = 200, message = "{validation.title.size}")
    String title;
    
    @Size(max = 2000, message = "{validation.description.size}")
    String description;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime startTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime endTime;
    
    Priority priority;
    
    @NotNull(message = "{validation.status.required}")
    TaskStatus status;
    
    Long categoryId;
}

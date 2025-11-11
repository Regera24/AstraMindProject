package az.schedule.backendservice.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskStatisticsResponse {
    Long totalTasks;
    Long todoTasks;
    Long inProgressTasks;
    Long completedTasks;
    Long pausedTasks;
    Long overdueTasks;
}

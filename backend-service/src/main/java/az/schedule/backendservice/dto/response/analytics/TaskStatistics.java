package az.schedule.backendservice.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskStatistics {
    long totalTasks;
    long completedTasks;
    long inProgressTasks;
    long todoTasks;
    long pausedTasks;
    long overdueTasks;
    
    double completionRate; // Percentage
    double averageCompletionTime; // Hours
    
    long highPriorityTasks;
    long mediumPriorityTasks;
    long lowPriorityTasks;
    
    long tasksThisWeek;
    long tasksThisMonth;
    long tasksCompletedToday;
}

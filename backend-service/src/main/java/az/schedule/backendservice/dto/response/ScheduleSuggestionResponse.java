package az.schedule.backendservice.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleSuggestionResponse {
    String summary;
    List<TaskSuggestion> suggestions;
    ScheduleAnalysis analysis;
    
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TaskSuggestion {
        Long taskId;
        String taskTitle;
        String currentSchedule;
        String suggestedSchedule;
        String reason;
        Integer priorityScore;
    }
    
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ScheduleAnalysis {
        Integer totalTasks;
        Integer overdueTasks;
        Integer highPriorityTasks;
        String productivityPattern;
        List<String> recommendations;
    }
}

package az.schedule.backendservice.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
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
        
        // Add structured datetime fields for easier frontend parsing
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime suggestedStartTime;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime suggestedEndTime;
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

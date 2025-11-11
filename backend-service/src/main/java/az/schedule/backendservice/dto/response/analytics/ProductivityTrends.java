package az.schedule.backendservice.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductivityTrends {
    List<DailyProductivity> dailyProductivity; // Last 30 days
    List<WeeklyProductivity> weeklyProductivity; // Last 12 weeks
    
    String mostProductiveDay; // Monday, Tuesday, etc.
    String mostProductiveHour; // "9:00 AM", "2:00 PM", etc.
    
    double averageTasksPerDay;
    double averageTasksPerWeek;
    
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DailyProductivity {
        String date; // yyyy-MM-dd
        long tasksCompleted;
        long tasksCreated;
        long tasksPending;
    }
    
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class WeeklyProductivity {
        String weekStart; // yyyy-MM-dd
        String weekEnd; // yyyy-MM-dd
        long tasksCompleted;
        long tasksCreated;
        double completionRate;
    }
}

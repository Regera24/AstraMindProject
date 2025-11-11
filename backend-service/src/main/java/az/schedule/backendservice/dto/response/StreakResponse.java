package az.schedule.backendservice.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StreakResponse {
    int currentStreak; // Current consecutive days
    int longestStreak; // Best streak ever
    boolean isActiveToday; // Did user complete tasks today?
    LocalDate lastActiveDate; // Last day with completed tasks
    int totalActiveDays; // Total days with at least 1 completed task
    
    // Week activity for visual display (last 7 days)
    List<DayActivity> weekActivity;
    
    // Streak milestones
    List<StreakMilestone> milestones;
    
    // Motivational message based on streak
    String motivationalMessage;
    
    // Next milestone
    StreakMilestone nextMilestone;
    
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DayActivity {
        LocalDate date;
        int tasksCompleted;
        boolean isActive; // At least 1 task completed
        boolean isToday;
    }
    
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class StreakMilestone {
        int days;
        String title;
        String emoji;
        boolean achieved;
    }
}

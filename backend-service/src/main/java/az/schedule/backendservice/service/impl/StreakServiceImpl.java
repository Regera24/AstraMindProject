package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.dto.response.StreakResponse;
import az.schedule.backendservice.entity.Task;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.repository.TaskRepository;
import az.schedule.backendservice.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakServiceImpl implements StreakService {
    
    private final TaskRepository taskRepository;
    
    private static final List<StreakResponse.StreakMilestone> MILESTONES = List.of(
        StreakResponse.StreakMilestone.builder()
            .days(3).title("Getting Started").emoji("🌱").achieved(false).build(),
        StreakResponse.StreakMilestone.builder()
            .days(7).title("One Week Warrior").emoji("⚡").achieved(false).build(),
        StreakResponse.StreakMilestone.builder()
            .days(14).title("Two Week Champion").emoji("🏆").achieved(false).build(),
        StreakResponse.StreakMilestone.builder()
            .days(30).title("Monthly Master").emoji("👑").achieved(false).build(),
        StreakResponse.StreakMilestone.builder()
            .days(50).title("Productivity Pro").emoji("💎").achieved(false).build(),
        StreakResponse.StreakMilestone.builder()
            .days(100).title("Century Legend").emoji("🔥").achieved(false).build(),
        StreakResponse.StreakMilestone.builder()
            .days(365).title("Year Hero").emoji("🌟").achieved(false).build()
    );
    
    @Override
    public StreakResponse getUserStreak(Long accountId) {
        List<Task> allTasks = taskRepository.findByAccountId(accountId);
        
        // Get all completed tasks grouped by date
        Map<LocalDate, Long> completedTasksByDate = allTasks.stream()
            .filter(t -> t.getStatus() == TaskStatus.DONE)
            .filter(t -> t.getUpdatedAt() != null)
            .collect(Collectors.groupingBy(
                t -> t.getUpdatedAt().toLocalDate(),
                Collectors.counting()
            ));
        
        // Calculate current streak
        int currentStreak = calculateCurrentStreak(completedTasksByDate);
        
        // Calculate longest streak
        int longestStreak = calculateLongestStreak(completedTasksByDate);
        
        // Check if active today
        LocalDate today = LocalDate.now();
        boolean isActiveToday = completedTasksByDate.containsKey(today);
        
        // Get last active date
        LocalDate lastActiveDate = completedTasksByDate.keySet().stream()
            .max(LocalDate::compareTo)
            .orElse(null);
        
        // Total active days
        int totalActiveDays = completedTasksByDate.size();
        
        // Week activity (last 7 days)
        List<StreakResponse.DayActivity> weekActivity = calculateWeekActivity(completedTasksByDate);
        
        // Milestones with achievement status
        List<StreakResponse.StreakMilestone> milestones = MILESTONES.stream()
            .map(m -> StreakResponse.StreakMilestone.builder()
                .days(m.getDays())
                .title(m.getTitle())
                .emoji(m.getEmoji())
                .achieved(currentStreak >= m.getDays() || longestStreak >= m.getDays())
                .build())
            .collect(Collectors.toList());
        
        // Find next milestone
        StreakResponse.StreakMilestone nextMilestone = MILESTONES.stream()
            .filter(m -> m.getDays() > currentStreak)
            .findFirst()
            .map(m -> StreakResponse.StreakMilestone.builder()
                .days(m.getDays())
                .title(m.getTitle())
                .emoji(m.getEmoji())
                .achieved(false)
                .build())
            .orElse(null);
        
        // Generate motivational message
        String motivationalMessage = generateMotivationalMessage(currentStreak, isActiveToday);
        
        return StreakResponse.builder()
            .currentStreak(currentStreak)
            .longestStreak(longestStreak)
            .isActiveToday(isActiveToday)
            .lastActiveDate(lastActiveDate)
            .totalActiveDays(totalActiveDays)
            .weekActivity(weekActivity)
            .milestones(milestones)
            .nextMilestone(nextMilestone)
            .motivationalMessage(motivationalMessage)
            .build();
    }
    
    private int calculateCurrentStreak(Map<LocalDate, Long> completedTasksByDate) {
        if (completedTasksByDate.isEmpty()) {
            return 0;
        }
        
        LocalDate today = LocalDate.now();
        LocalDate checkDate = today;
        int streak = 0;
        
        // Check if today or yesterday has activity (allow grace period)
        if (!completedTasksByDate.containsKey(today)) {
            checkDate = today.minusDays(1);
            if (!completedTasksByDate.containsKey(checkDate)) {
                return 0; // Streak broken
            }
        }
        
        // Count consecutive days
        while (completedTasksByDate.containsKey(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }
        
        return streak;
    }
    
    private int calculateLongestStreak(Map<LocalDate, Long> completedTasksByDate) {
        if (completedTasksByDate.isEmpty()) {
            return 0;
        }
        
        List<LocalDate> sortedDates = completedTasksByDate.keySet().stream()
            .sorted()
            .collect(Collectors.toList());
        
        int maxStreak = 1;
        int currentStreak = 1;
        
        for (int i = 1; i < sortedDates.size(); i++) {
            LocalDate prevDate = sortedDates.get(i - 1);
            LocalDate currDate = sortedDates.get(i);
            
            if (prevDate.plusDays(1).equals(currDate)) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
        
        return maxStreak;
    }
    
    private List<StreakResponse.DayActivity> calculateWeekActivity(Map<LocalDate, Long> completedTasksByDate) {
        List<StreakResponse.DayActivity> weekActivity = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long tasksCompleted = completedTasksByDate.getOrDefault(date, 0L);
            
            weekActivity.add(StreakResponse.DayActivity.builder()
                .date(date)
                .tasksCompleted((int) tasksCompleted)
                .isActive(tasksCompleted > 0)
                .isToday(date.equals(today))
                .build());
        }
        
        return weekActivity;
    }
    
    private String generateMotivationalMessage(int currentStreak, boolean isActiveToday) {
        if (currentStreak == 0) {
            return "Start your streak today! Complete a task to begin your journey. 🚀";
        }
        
        if (!isActiveToday) {
            return "Keep your " + currentStreak + "-day streak alive! Complete a task today! 🔥";
        }
        
        if (currentStreak == 1) {
            return "Great start! You've begun your streak. Keep it going tomorrow! 💪";
        }
        
        if (currentStreak < 7) {
            return "Amazing! " + currentStreak + " days strong. You're building momentum! ⚡";
        }
        
        if (currentStreak < 14) {
            return "Incredible! " + currentStreak + " days in a row. You're unstoppable! 🏆";
        }
        
        if (currentStreak < 30) {
            return "Phenomenal! " + currentStreak + " days of productivity. You're a champion! 👑";
        }
        
        if (currentStreak < 100) {
            return "Legendary! " + currentStreak + " days streak. You're an inspiration! 💎";
        }
        
        return "Unbelievable! " + currentStreak + " days of excellence. You're a productivity legend! 🌟";
    }
}

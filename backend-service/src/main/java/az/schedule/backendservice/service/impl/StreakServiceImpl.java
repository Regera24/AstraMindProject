package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.dto.response.StreakResponse;
import az.schedule.backendservice.entity.Task;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.repository.TaskRepository;
import az.schedule.backendservice.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
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
    private final MessageSource messageSource;
    
    private static final List<MilestoneConfig> MILESTONE_CONFIGS = List.of(
        new MilestoneConfig(3, "streak.milestone.getting.started", "🌱"),
        new MilestoneConfig(7, "streak.milestone.one.week.warrior", "⚡"),
        new MilestoneConfig(14, "streak.milestone.two.week.champion", "🏆"),
        new MilestoneConfig(30, "streak.milestone.monthly.master", "👑"),
        new MilestoneConfig(50, "streak.milestone.productivity.pro", "💎"),
        new MilestoneConfig(100, "streak.milestone.century.legend", "🔥"),
        new MilestoneConfig(365, "streak.milestone.year.hero", "🌟")
    );
    
    private static class MilestoneConfig {
        final int days;
        final String messageKey;
        final String emoji;
        
        MilestoneConfig(int days, String messageKey, String emoji) {
            this.days = days;
            this.messageKey = messageKey;
            this.emoji = emoji;
        }
    }
    
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
        
        // Get current locale
        Locale locale = LocaleContextHolder.getLocale();
        
        // Milestones with achievement status
        List<StreakResponse.StreakMilestone> milestones = MILESTONE_CONFIGS.stream()
            .map(config -> StreakResponse.StreakMilestone.builder()
                .days(config.days)
                .title(messageSource.getMessage(config.messageKey, null, locale))
                .emoji(config.emoji)
                .achieved(currentStreak >= config.days || longestStreak >= config.days)
                .build())
            .collect(Collectors.toList());
        
        // Find next milestone
        StreakResponse.StreakMilestone nextMilestone = MILESTONE_CONFIGS.stream()
            .filter(config -> config.days > currentStreak)
            .findFirst()
            .map(config -> StreakResponse.StreakMilestone.builder()
                .days(config.days)
                .title(messageSource.getMessage(config.messageKey, null, locale))
                .emoji(config.emoji)
                .achieved(false)
                .build())
            .orElse(null);
        
        // Generate motivational message
        String motivationalMessage = generateMotivationalMessage(currentStreak, isActiveToday, locale);
        
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
    
    private String generateMotivationalMessage(int currentStreak, boolean isActiveToday, Locale locale) {
        if (currentStreak == 0) {
            return messageSource.getMessage("streak.message.start", null, locale);
        }
        
        if (!isActiveToday) {
            return messageSource.getMessage("streak.message.keep.alive", new Object[]{currentStreak}, locale);
        }
        
        if (currentStreak == 1) {
            return messageSource.getMessage("streak.message.great.start", null, locale);
        }
        
        if (currentStreak < 7) {
            return messageSource.getMessage("streak.message.building.momentum", new Object[]{currentStreak}, locale);
        }
        
        if (currentStreak < 14) {
            return messageSource.getMessage("streak.message.unstoppable", new Object[]{currentStreak}, locale);
        }
        
        if (currentStreak < 30) {
            return messageSource.getMessage("streak.message.champion", new Object[]{currentStreak}, locale);
        }
        
        if (currentStreak < 100) {
            return messageSource.getMessage("streak.message.inspiration", new Object[]{currentStreak}, locale);
        }
        
        return messageSource.getMessage("streak.message.legend", new Object[]{currentStreak}, locale);
    }
}

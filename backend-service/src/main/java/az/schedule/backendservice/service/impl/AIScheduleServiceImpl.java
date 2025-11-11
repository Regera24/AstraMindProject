package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.dto.TaskDTO;
import az.schedule.backendservice.dto.response.ScheduleSuggestionResponse;
import az.schedule.backendservice.dto.response.ScheduleSuggestionResponse.ScheduleAnalysis;
import az.schedule.backendservice.dto.response.ScheduleSuggestionResponse.TaskSuggestion;
import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.service.AIScheduleService;
import az.schedule.backendservice.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIScheduleServiceImpl implements AIScheduleService {
    private final TaskService taskService;
    
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
    
    // Productive hours based on research
    private static final LocalTime MORNING_START = LocalTime.of(8, 0);
    private static final LocalTime MORNING_END = LocalTime.of(12, 0);
    private static final LocalTime AFTERNOON_START = LocalTime.of(14, 0);
    private static final LocalTime AFTERNOON_END = LocalTime.of(17, 0);
    
    @Override
    public ScheduleSuggestionResponse generateScheduleSuggestions(Long accountId, int year, int month) {
        log.info("Generating schedule suggestions for account {} - {}/{}", accountId, year, month);
        
        // Get all tasks for the month
        List<TaskDTO> monthTasks = taskService.getTasksByMonth(accountId, year, month);
        
        // Analyze tasks
        ScheduleAnalysis analysis = analyzeSchedule(monthTasks);
        
        // Generate suggestions
        List<TaskSuggestion> suggestions = generateSuggestionsFromTasks(monthTasks);
        
        // Generate summary
        String summary = generateSummary(monthTasks, suggestions);
        
        return ScheduleSuggestionResponse.builder()
                .summary(summary)
                .suggestions(suggestions)
                .analysis(analysis)
                .build();
    }
    
    private ScheduleAnalysis analyzeSchedule(List<TaskDTO> tasks) {
        int totalTasks = tasks.size();
        LocalDateTime now = LocalDateTime.now();
        
        int overdueTasks = (int) tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .filter(task -> task.getEndTime() != null && task.getEndTime().isBefore(now))
                .count();
        
        int highPriorityTasks = (int) tasks.stream()
                .filter(task -> task.getPriority() == Priority.HIGH)
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .count();
        
        // Analyze productivity pattern
        String productivityPattern = analyzeProductivityPattern(tasks);
        
        // Generate recommendations
        List<String> recommendations = generateRecommendations(tasks, overdueTasks, highPriorityTasks);
        
        return ScheduleAnalysis.builder()
                .totalTasks(totalTasks)
                .overdueTasks(overdueTasks)
                .highPriorityTasks(highPriorityTasks)
                .productivityPattern(productivityPattern)
                .recommendations(recommendations)
                .build();
    }
    
    private String analyzeProductivityPattern(List<TaskDTO> tasks) {
        Map<String, Long> timeSlotCounts = new HashMap<>();
        
        for (TaskDTO task : tasks) {
            if (task.getStartTime() != null) {
                LocalTime time = task.getStartTime().toLocalTime();
                if (time.isBefore(LocalTime.of(12, 0))) {
                    timeSlotCounts.merge("morning", 1L, Long::sum);
                } else if (time.isBefore(LocalTime.of(18, 0))) {
                    timeSlotCounts.merge("afternoon", 1L, Long::sum);
                } else {
                    timeSlotCounts.merge("evening", 1L, Long::sum);
                }
            }
        }
        
        if (timeSlotCounts.isEmpty()) {
            return "Insufficient data to determine pattern";
        }
        
        String dominantSlot = timeSlotCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("balanced");
        
        return String.format("You tend to schedule more tasks in the %s", dominantSlot);
    }
    
    private List<String> generateRecommendations(List<TaskDTO> tasks, int overdueTasks, int highPriorityTasks) {
        List<String> recommendations = new ArrayList<>();
        
        if (overdueTasks > 0) {
            recommendations.add(String.format("Focus on %d overdue task(s) first", overdueTasks));
        }
        
        if (highPriorityTasks > 3) {
            recommendations.add("Consider breaking down high-priority tasks into smaller chunks");
        }
        
        long unscheduledTasks = tasks.stream()
                .filter(task -> task.getStartTime() == null)
                .count();
        
        if (unscheduledTasks > 0) {
            recommendations.add(String.format("Schedule %d unscheduled task(s) for better time management", unscheduledTasks));
        }
        
        // Check for task clustering
        Map<DayOfWeek, Long> tasksByDay = tasks.stream()
                .filter(task -> task.getStartTime() != null)
                .collect(Collectors.groupingBy(
                        task -> task.getStartTime().getDayOfWeek(),
                        Collectors.counting()
                ));
        
        Optional<Map.Entry<DayOfWeek, Long>> busiestDay = tasksByDay.entrySet().stream()
                .max(Map.Entry.comparingByValue());
        
        if (busiestDay.isPresent() && busiestDay.get().getValue() > 5) {
            recommendations.add(String.format("Consider redistributing tasks from %s to balance your week", 
                    busiestDay.get().getKey()));
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Your schedule looks well balanced!");
        }
        
        return recommendations;
    }
    
    private List<TaskSuggestion> generateSuggestionsFromTasks(List<TaskDTO> tasks) {
        List<TaskSuggestion> suggestions = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (TaskDTO task : tasks) {
            if (task.getStatus() == TaskStatus.DONE) {
                continue; // Skip completed tasks
            }
            
            TaskSuggestion suggestion = analyzeSingleTask(task, now);
            if (suggestion != null) {
                suggestions.add(suggestion);
            }
        }
        
        // Sort by priority score (descending)
        suggestions.sort(Comparator.comparing(TaskSuggestion::getPriorityScore).reversed());
        
        // Limit to top 10 suggestions
        return suggestions.stream().limit(10).collect(Collectors.toList());
    }
    
    private TaskSuggestion analyzeSingleTask(TaskDTO task, LocalDateTime now) {
        Integer priorityScore = calculatePriorityScore(task, now);
        
        // Only suggest if score is significant
        if (priorityScore < 30) {
            return null;
        }
        
        String currentSchedule = formatCurrentSchedule(task);
        String suggestedSchedule = generateOptimalSchedule(task, now);
        String reason = generateReason(task, now);
        
        return TaskSuggestion.builder()
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .currentSchedule(currentSchedule)
                .suggestedSchedule(suggestedSchedule)
                .reason(reason)
                .priorityScore(priorityScore)
                .build();
    }
    
    private Integer calculatePriorityScore(TaskDTO task, LocalDateTime now) {
        int score = 0;
        
        // Priority weight
        if (task.getPriority() == Priority.HIGH) {
            score += 50;
        } else if (task.getPriority() == Priority.MEDIUM) {
            score += 30;
        } else {
            score += 10;
        }
        
        // Overdue tasks get highest priority
        if (task.getEndTime() != null && task.getEndTime().isBefore(now)) {
            score += 100;
        }
        
        // Tasks due soon
        if (task.getEndTime() != null) {
            long hoursUntilDue = java.time.Duration.between(now, task.getEndTime()).toHours();
            if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
                score += 70;
            } else if (hoursUntilDue <= 48) {
                score += 40;
            } else if (hoursUntilDue <= 72) {
                score += 20;
            }
        }
        
        // Unscheduled tasks need attention
        if (task.getStartTime() == null) {
            score += 25;
        }
        
        // Tasks scheduled at non-optimal times
        if (task.getStartTime() != null) {
            LocalTime time = task.getStartTime().toLocalTime();
            if (time.isBefore(LocalTime.of(7, 0)) || time.isAfter(LocalTime.of(22, 0))) {
                score += 30; // Too early or too late
            }
        }
        
        return score;
    }
    
    private String formatCurrentSchedule(TaskDTO task) {
        if (task.getStartTime() == null && task.getEndTime() == null) {
            return "Not scheduled";
        }
        
        if (task.getStartTime() != null && task.getEndTime() != null) {
            return String.format("%s - %s",
                    task.getStartTime().format(DATETIME_FORMATTER),
                    task.getEndTime().format(TIME_FORMATTER));
        }
        
        if (task.getStartTime() != null) {
            return task.getStartTime().format(DATETIME_FORMATTER);
        }
        
        return String.format("Due: %s", task.getEndTime().format(DATETIME_FORMATTER));
    }
    
    private String generateOptimalSchedule(TaskDTO task, LocalDateTime now) {
        LocalDateTime suggestedStart;
        
        // If task is overdue, suggest ASAP
        if (task.getEndTime() != null && task.getEndTime().isBefore(now)) {
            suggestedStart = getNextProductiveSlot(now);
            return String.format("%s (URGENT)", suggestedStart.format(DATETIME_FORMATTER));
        }
        
        // If unscheduled, find optimal slot
        if (task.getStartTime() == null) {
            if (task.getPriority() == Priority.HIGH) {
                suggestedStart = getNextProductiveSlot(now);
            } else {
                suggestedStart = getNextAvailableSlot(now, task.getPriority());
            }
            return suggestedStart.format(DATETIME_FORMATTER);
        }
        
        // If scheduled at non-optimal time, suggest better time
        LocalTime currentTime = task.getStartTime().toLocalTime();
        if (currentTime.isBefore(LocalTime.of(7, 0)) || currentTime.isAfter(LocalTime.of(21, 0))) {
            LocalDateTime optimalTime = findOptimalTimeSlot(task.getStartTime().toLocalDate().atTime(9, 0));
            return optimalTime.format(DATETIME_FORMATTER);
        }
        
        return task.getStartTime().format(DATETIME_FORMATTER);
    }
    
    private LocalDateTime getNextProductiveSlot(LocalDateTime from) {
        LocalDateTime next = from.plusHours(1);
        LocalTime time = next.toLocalTime();
        
        // If outside productive hours, move to next morning
        if (time.isAfter(LocalTime.of(18, 0)) || time.isBefore(LocalTime.of(8, 0))) {
            next = next.toLocalDate().plusDays(1).atTime(9, 0);
        }
        
        // Skip weekends for work tasks
        while (next.getDayOfWeek() == DayOfWeek.SATURDAY || next.getDayOfWeek() == DayOfWeek.SUNDAY) {
            next = next.plusDays(1);
        }
        
        return next;
    }
    
    private LocalDateTime getNextAvailableSlot(LocalDateTime from, Priority priority) {
        LocalDateTime slot = from.plusHours(2);
        
        // Medium priority: afternoon slots
        if (priority == Priority.MEDIUM) {
            if (slot.toLocalTime().isBefore(AFTERNOON_START)) {
                slot = slot.toLocalDate().atTime(AFTERNOON_START);
            }
        }
        
        // Low priority: any available time
        return slot;
    }
    
    private LocalDateTime findOptimalTimeSlot(LocalDateTime baseTime) {
        // Move to morning productive hours
        if (baseTime.toLocalTime().isBefore(MORNING_START)) {
            return baseTime.toLocalDate().atTime(MORNING_START);
        }
        
        // Or afternoon productive hours
        if (baseTime.toLocalTime().isAfter(LocalTime.of(17, 0))) {
            return baseTime.toLocalDate().plusDays(1).atTime(MORNING_START);
        }
        
        return baseTime;
    }
    
    private String generateReason(TaskDTO task, LocalDateTime now) {
        List<String> reasons = new ArrayList<>();
        
        // Check if overdue
        if (task.getEndTime() != null && task.getEndTime().isBefore(now)) {
            reasons.add("Task is overdue");
        }
        
        // Check priority
        if (task.getPriority() == Priority.HIGH) {
            reasons.add("High priority task");
        }
        
        // Check if due soon
        if (task.getEndTime() != null) {
            long hoursUntilDue = java.time.Duration.between(now, task.getEndTime()).toHours();
            if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
                reasons.add("Due within 24 hours");
            } else if (hoursUntilDue <= 48) {
                reasons.add("Due within 2 days");
            }
        }
        
        // Check if unscheduled
        if (task.getStartTime() == null) {
            reasons.add("Not yet scheduled");
        }
        
        // Check if scheduled at non-optimal time
        if (task.getStartTime() != null) {
            LocalTime time = task.getStartTime().toLocalTime();
            if (time.isBefore(LocalTime.of(7, 0))) {
                reasons.add("Scheduled too early - morning slots are more productive");
            } else if (time.isAfter(LocalTime.of(21, 0))) {
                reasons.add("Scheduled too late - consider earlier time for better focus");
            } else if (time.isAfter(LocalTime.of(12, 0)) && time.isBefore(LocalTime.of(14, 0))) {
                reasons.add("Scheduled during lunch break - consider afternoon slot");
            }
        }
        
        // Optimal timing recommendations
        if (task.getPriority() == Priority.HIGH && task.getStartTime() != null) {
            LocalTime time = task.getStartTime().toLocalTime();
            if (!time.isAfter(MORNING_START) || !time.isBefore(LocalTime.of(11, 0))) {
                reasons.add("High-priority tasks are best tackled in morning hours (8-11 AM)");
            }
        }
        
        if (reasons.isEmpty()) {
            return "Optimize your schedule for better productivity";
        }
        
        return String.join(". ", reasons) + ".";
    }
    
    private String generateSummary(List<TaskDTO> tasks, List<TaskSuggestion> suggestions) {
        int totalTasks = tasks.size();
        int activeTasks = (int) tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .count();
        int suggestionsCount = suggestions.size();
        
        if (totalTasks == 0) {
            return "No tasks found for this month. Start planning your schedule!";
        }
        
        if (suggestionsCount == 0) {
            return String.format("Great job! Your %d task(s) are well-scheduled. No changes needed at this time.", activeTasks);
        }
        
        return String.format("Found %d optimization opportunity(s) for your %d active task(s). " +
                        "AI has analyzed your schedule and identified tasks that could benefit from rescheduling " +
                        "for improved productivity and better time management.",
                suggestionsCount, activeTasks);
    }
}

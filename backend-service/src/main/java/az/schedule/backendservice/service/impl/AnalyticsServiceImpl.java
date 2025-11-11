package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.dto.response.analytics.*;
import az.schedule.backendservice.entity.Task;
import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.repository.TaskRepository;
import az.schedule.backendservice.service.AITaskService;
import az.schedule.backendservice.service.AnalyticsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {
    
    private final TaskRepository taskRepository;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;
    
    @Override
    public TaskAnalyticsResponse getTaskAnalytics(Long accountId) {
        List<Task> allTasks = taskRepository.findByAccountId(accountId);
        
        // Return analytics without AI insights for fast loading
        return TaskAnalyticsResponse.builder()
                .statistics(calculateStatistics(allTasks))
                .statusDistribution(calculateStatusDistribution(allTasks))
                .priorityDistribution(calculatePriorityDistribution(allTasks))
                .categoryDistribution(calculateCategoryDistribution(allTasks))
                .heatmapData(calculateHeatmapData(allTasks))
                .productivityTrends(calculateProductivityTrends(allTasks))
                .aiInsights(null) // Will be loaded separately
                .build();
    }
    
    @Override
    public AIInsights getAIInsights(Long accountId) {
        List<Task> allTasks = taskRepository.findByAccountId(accountId);
        return generateAIInsights(allTasks);
    }
    
    private TaskStatistics calculateStatistics(List<Task> tasks) {
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long inProgressTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long todoTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long pausedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.PAUSED).count();
        
        long overdueTasks = tasks.stream()
                .filter(t -> t.getEndTime() != null && t.getEndTime().isBefore(LocalDateTime.now()))
                .filter(t -> t.getStatus() != TaskStatus.DONE)
                .count();
        
        double completionRate = totalTasks > 0 ? (completedTasks * 100.0 / totalTasks) : 0.0;
        
        double averageCompletionTime = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE && t.getStartTime() != null && t.getEndTime() != null)
                .mapToDouble(t -> ChronoUnit.HOURS.between(t.getStartTime(), t.getEndTime()))
                .average()
                .orElse(0.0);
        
        long highPriorityTasks = tasks.stream().filter(t -> t.getPriority() == Priority.HIGH).count();
        long mediumPriorityTasks = tasks.stream().filter(t -> t.getPriority() == Priority.MEDIUM).count();
        long lowPriorityTasks = tasks.stream().filter(t -> t.getPriority() == Priority.LOW).count();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime monthStart = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        
        long tasksThisWeek = tasks.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(weekStart))
                .count();
        
        long tasksThisMonth = tasks.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(monthStart))
                .count();
        
        long tasksCompletedToday = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .filter(t -> t.getUpdatedAt() != null && t.getUpdatedAt().isAfter(todayStart))
                .count();
        
        return TaskStatistics.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .todoTasks(todoTasks)
                .pausedTasks(pausedTasks)
                .overdueTasks(overdueTasks)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .averageCompletionTime(Math.round(averageCompletionTime * 100.0) / 100.0)
                .highPriorityTasks(highPriorityTasks)
                .mediumPriorityTasks(mediumPriorityTasks)
                .lowPriorityTasks(lowPriorityTasks)
                .tasksThisWeek(tasksThisWeek)
                .tasksThisMonth(tasksThisMonth)
                .tasksCompletedToday(tasksCompletedToday)
                .build();
    }
    
    private Map<String, Long> calculateStatusDistribution(List<Task> tasks) {
        return tasks.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getStatus().name(),
                        Collectors.counting()
                ));
    }
    
    private Map<String, Long> calculatePriorityDistribution(List<Task> tasks) {
        return tasks.stream()
                .filter(t -> t.getPriority() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getPriority().name(),
                        Collectors.counting()
                ));
    }
    
    private Map<String, Long> calculateCategoryDistribution(List<Task> tasks) {
        return tasks.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.counting()
                ));
    }
    
    private List<HeatmapData> calculateHeatmapData(List<Task> tasks) {
        Map<String, Long> heatmapCounts = new HashMap<>();
        
        for (Task task : tasks) {
            if (task.getStartTime() != null) {
                int dayOfWeek = task.getStartTime().getDayOfWeek().getValue();
                int hour = task.getStartTime().getHour();
                String key = dayOfWeek + "-" + hour;
                heatmapCounts.merge(key, 1L, Long::sum);
            }
        }
        
        long maxCount = heatmapCounts.values().stream().max(Long::compareTo).orElse(1L);
        
        List<HeatmapData> heatmap = new ArrayList<>();
        for (int day = 1; day <= 7; day++) {
            for (int hour = 0; hour < 24; hour++) {
                String key = day + "-" + hour;
                long count = heatmapCounts.getOrDefault(key, 0L);
                double intensity = maxCount > 0 ? (double) count / maxCount : 0.0;
                
                heatmap.add(HeatmapData.builder()
                        .dayOfWeek(day)
                        .hour(hour)
                        .taskCount(count)
                        .intensity(Math.round(intensity * 100.0) / 100.0)
                        .build());
            }
        }
        
        return heatmap;
    }
    
    private ProductivityTrends calculateProductivityTrends(List<Task> tasks) {
        LocalDate today = LocalDate.now();
        
        // Daily productivity (last 30 days)
        List<ProductivityTrends.DailyProductivity> dailyProductivity = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
            
            long completed = tasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .filter(t -> t.getUpdatedAt() != null)
                    .filter(t -> t.getUpdatedAt().isAfter(dayStart) && t.getUpdatedAt().isBefore(dayEnd))
                    .count();
            
            long created = tasks.stream()
                    .filter(t -> t.getCreatedAt() != null)
                    .filter(t -> t.getCreatedAt().isAfter(dayStart) && t.getCreatedAt().isBefore(dayEnd))
                    .count();
            
            long pending = tasks.stream()
                    .filter(t -> t.getStatus() != TaskStatus.DONE && t.getStatus() != TaskStatus.PAUSED)
                    .filter(t -> t.getCreatedAt() != null)
                    .filter(t -> t.getCreatedAt().isBefore(dayEnd))
                    .count();
            
            dailyProductivity.add(ProductivityTrends.DailyProductivity.builder()
                    .date(date.toString())
                    .tasksCompleted(completed)
                    .tasksCreated(created)
                    .tasksPending(pending)
                    .build());
        }
        
        // Weekly productivity (last 12 weeks)
        List<ProductivityTrends.WeeklyProductivity> weeklyProductivity = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate weekStart = today.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);
            LocalDateTime weekStartTime = weekStart.atStartOfDay();
            LocalDateTime weekEndTime = weekEnd.plusDays(1).atStartOfDay();
            
            long completed = tasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .filter(t -> t.getUpdatedAt() != null)
                    .filter(t -> t.getUpdatedAt().isAfter(weekStartTime) && t.getUpdatedAt().isBefore(weekEndTime))
                    .count();
            
            long created = tasks.stream()
                    .filter(t -> t.getCreatedAt() != null)
                    .filter(t -> t.getCreatedAt().isAfter(weekStartTime) && t.getCreatedAt().isBefore(weekEndTime))
                    .count();
            
            double completionRate = created > 0 ? (completed * 100.0 / created) : 0.0;
            
            weeklyProductivity.add(ProductivityTrends.WeeklyProductivity.builder()
                    .weekStart(weekStart.toString())
                    .weekEnd(weekEnd.toString())
                    .tasksCompleted(completed)
                    .tasksCreated(created)
                    .completionRate(Math.round(completionRate * 100.0) / 100.0)
                    .build());
        }
        
        // Find most productive day and hour
        Map<DayOfWeek, Long> tasksByDay = tasks.stream()
                .filter(t -> t.getStartTime() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getStartTime().getDayOfWeek(),
                        Collectors.counting()
                ));
        
        String mostProductiveDay = tasksByDay.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey().name())
                .orElse("N/A");
        
        Map<Integer, Long> tasksByHour = tasks.stream()
                .filter(t -> t.getStartTime() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getStartTime().getHour(),
                        Collectors.counting()
                ));
        
        String mostProductiveHour = tasksByHour.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> String.format("%02d:00", e.getKey()))
                .orElse("N/A");
        
        double avgTasksPerDay = dailyProductivity.stream()
                .mapToLong(ProductivityTrends.DailyProductivity::getTasksCompleted)
                .average()
                .orElse(0.0);
        
        double avgTasksPerWeek = weeklyProductivity.stream()
                .mapToLong(ProductivityTrends.WeeklyProductivity::getTasksCompleted)
                .average()
                .orElse(0.0);
        
        return ProductivityTrends.builder()
                .dailyProductivity(dailyProductivity)
                .weeklyProductivity(weeklyProductivity)
                .mostProductiveDay(mostProductiveDay)
                .mostProductiveHour(mostProductiveHour)
                .averageTasksPerDay(Math.round(avgTasksPerDay * 100.0) / 100.0)
                .averageTasksPerWeek(Math.round(avgTasksPerWeek * 100.0) / 100.0)
                .build();
    }
    
    private AIInsights generateAIInsights(List<Task> tasks) {
        try {
            TaskStatistics stats = calculateStatistics(tasks);
            ProductivityTrends trends = calculateProductivityTrends(tasks);
            
            String prompt = buildAnalyticsPrompt(stats, trends, tasks);
            
            String aiResponse = chatModel.call(prompt);
            
            return parseAIInsightsResponse(aiResponse, stats.getCompletionRate());
            
        } catch (Exception e) {
            log.error("Error generating AI insights: {}", e.getMessage(), e);
            return getDefaultInsights();
        }
    }
    
    private String buildAnalyticsPrompt(TaskStatistics stats, ProductivityTrends trends, List<Task> tasks) {
        return String.format("""
                You are a productivity expert analyzing a user's task management data. Provide insights in JSON format.
                
                User Statistics:
                - Total Tasks: %d
                - Completed: %d (%.1f%%)
                - In Progress: %d
                - To Do: %d
                - Overdue: %d
                - High Priority Tasks: %d
                - Average Completion Time: %.1f hours
                - Most Productive Day: %s
                - Most Productive Hour: %s
                - Average Tasks Per Day: %.1f
                - Tasks Completed Today: %d
                
                Analyze this data and provide:
                {
                  "summary": "Brief overall assessment (2-3 sentences)",
                  "strengths": ["strength1", "strength2", "strength3"],
                  "weaknesses": ["weakness1", "weakness2"],
                  "suggestions": ["actionable suggestion1", "actionable suggestion2", "actionable suggestion3"],
                  "productivityScore": "Excellent/Good/Average/Needs Improvement"
                }
                
                Return ONLY valid JSON, no markdown.
                """,
                stats.getTotalTasks(),
                stats.getCompletedTasks(),
                stats.getCompletionRate(),
                stats.getInProgressTasks(),
                stats.getTodoTasks(),
                stats.getOverdueTasks(),
                stats.getHighPriorityTasks(),
                stats.getAverageCompletionTime(),
                trends.getMostProductiveDay(),
                trends.getMostProductiveHour(),
                trends.getAverageTasksPerDay(),
                stats.getTasksCompletedToday()
        );
    }
    
    private AIInsights parseAIInsightsResponse(String aiResponse, double completionRate) {
        try {
            JsonNode root = objectMapper.readTree(aiResponse.trim()
                    .replaceFirst("^```json\\s*", "")
                    .replaceFirst("```$", "")
                    .trim());
            
            List<String> strengths = new ArrayList<>();
            if (root.has("strengths") && root.get("strengths").isArray()) {
                root.get("strengths").forEach(node -> strengths.add(node.asText()));
            }
            
            List<String> weaknesses = new ArrayList<>();
            if (root.has("weaknesses") && root.get("weaknesses").isArray()) {
                root.get("weaknesses").forEach(node -> weaknesses.add(node.asText()));
            }
            
            List<String> suggestions = new ArrayList<>();
            if (root.has("suggestions") && root.get("suggestions").isArray()) {
                root.get("suggestions").forEach(node -> suggestions.add(node.asText()));
            }
            
            String productivityScore = root.has("productivityScore") ? root.get("productivityScore").asText() : "Average";
            double scorePercentage = completionRate;
            
            return AIInsights.builder()
                    .summary(root.has("summary") ? root.get("summary").asText() : "Analysis complete.")
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .suggestions(suggestions)
                    .productivityScore(productivityScore)
                    .scorePercentage(scorePercentage)
                    .build();
            
        } catch (Exception e) {
            log.error("Error parsing AI insights: {}", e.getMessage());
            return getDefaultInsights();
        }
    }
    
    private AIInsights getDefaultInsights() {
        return AIInsights.builder()
                .summary("Keep tracking your tasks to get personalized insights.")
                .strengths(List.of("You're using the task management system"))
                .weaknesses(List.of("More data needed for detailed analysis"))
                .suggestions(List.of("Continue adding tasks", "Mark tasks as completed", "Set priorities for important tasks"))
                .productivityScore("Average")
                .scorePercentage(50.0)
                .build();
    }
}

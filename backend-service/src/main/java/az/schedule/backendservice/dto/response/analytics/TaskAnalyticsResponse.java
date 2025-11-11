package az.schedule.backendservice.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskAnalyticsResponse {
    // Overall statistics
    TaskStatistics statistics;
    
    // Charts data
    Map<String, Long> statusDistribution;
    Map<String, Long> priorityDistribution;
    Map<String, Long> categoryDistribution;
    
    // Heatmap data - tasks by day of week and hour
    List<HeatmapData> heatmapData;
    
    // Productivity trends
    ProductivityTrends productivityTrends;
    
    // AI-generated insights and suggestions
    AIInsights aiInsights;
}

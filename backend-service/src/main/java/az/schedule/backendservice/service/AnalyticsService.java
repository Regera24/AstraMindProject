package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.response.analytics.AIInsights;
import az.schedule.backendservice.dto.response.analytics.TaskAnalyticsResponse;

public interface AnalyticsService {
    /**
     * Get task analytics without AI insights (fast)
     * @param accountId User account ID
     * @return Analytics data with stats, charts, heatmap (AI insights will be null)
     */
    TaskAnalyticsResponse getTaskAnalytics(Long accountId);
    
    /**
     * Get AI-powered insights separately (slower)
     * @param accountId User account ID
     * @return AI-generated insights and suggestions
     */
    AIInsights getAIInsights(Long accountId);
}

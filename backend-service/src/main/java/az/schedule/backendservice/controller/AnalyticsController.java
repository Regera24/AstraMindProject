package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.analytics.AIInsights;
import az.schedule.backendservice.dto.response.analytics.TaskAnalyticsResponse;
import az.schedule.backendservice.service.AnalyticsService;
import az.schedule.backendservice.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Analytics API", description = "Endpoints for task analytics and insights")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;
    
    @Operation(summary = "Get task analytics", description = "Get task analytics with stats, charts, and heatmap (fast, without AI insights)")
    @GetMapping
    public ApiResponse<TaskAnalyticsResponse> getTaskAnalytics() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        TaskAnalyticsResponse analytics = analyticsService.getTaskAnalytics(accountId);
        return ApiResponse.<TaskAnalyticsResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Analytics retrieved successfully")
                .data(analytics)
                .build();
    }
    
    @Operation(summary = "Get AI insights", description = "Get AI-powered productivity insights and suggestions (slower, separate from main analytics)")
    @GetMapping("/ai-insights")
    public ApiResponse<AIInsights> getAIInsights() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        AIInsights insights = analyticsService.getAIInsights(accountId);
        return ApiResponse.<AIInsights>builder()
                .code(HttpStatus.OK.value())
                .message("AI insights generated successfully")
                .data(insights)
                .build();
    }
}

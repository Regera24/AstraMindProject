package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.response.analytics.AIInsights;
import az.schedule.backendservice.dto.response.analytics.TaskAnalyticsResponse;
import az.schedule.backendservice.dto.response.analytics.TaskStatistics;
import az.schedule.backendservice.service.AnalyticsService;
import az.schedule.backendservice.utils.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalyticsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ExtendWith(MockitoExtension.class)
@DisplayName("AnalyticsController Unit Tests")
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AnalyticsService analyticsService;

    @Autowired
    private ObjectMapper objectMapper;

    private TaskAnalyticsResponse mockAnalyticsResponse;
    private AIInsights mockAIInsights;
    private Long mockAccountId;

    @BeforeEach
    void setUp() {
        mockAccountId = 1L;

        // Mock TaskAnalyticsResponse
        TaskStatistics statistics = TaskStatistics.builder()
                .totalTasks(100L)
                .completedTasks(60L)
                .inProgressTasks(25L)
                .todoTasks(15L)
                .completionRate(60.0)
                .build();

        Map<String, Long> statusDistribution = new HashMap<>();
        statusDistribution.put("TODO", 15L);
        statusDistribution.put("IN_PROGRESS", 25L);
        statusDistribution.put("DONE", 60L);

        Map<String, Long> priorityDistribution = new HashMap<>();
        priorityDistribution.put("HIGH", 30L);
        priorityDistribution.put("MEDIUM", 50L);
        priorityDistribution.put("LOW", 20L);

        mockAnalyticsResponse = TaskAnalyticsResponse.builder()
                .statistics(statistics)
                .statusDistribution(statusDistribution)
                .priorityDistribution(priorityDistribution)
                .build();

        // Mock AIInsights
        mockAIInsights = AIInsights.builder()
                .productivityScore("Good")
                .scorePercentage(75.0)
                .summary("You're making great progress on your tasks!")
                .strengths(Arrays.asList("Consistent task completion", "Good priority management"))
                .suggestions(Arrays.asList("Focus on high-priority tasks first", "Break down large tasks"))
                .weaknesses(Arrays.asList("Some overdue tasks need attention"))
                .build();
    }

    @Test
    @DisplayName("Should get task analytics successfully")
    void testGetTaskAnalytics_Success() throws Exception {
        // Given
        when(analyticsService.getTaskAnalytics(mockAccountId)).thenReturn(mockAnalyticsResponse);

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(mockAccountId);

            // When & Then
            mockMvc.perform(get("/api/v1/analytics")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.message").value("Analytics retrieved successfully"))
                    .andExpect(jsonPath("$.data.statistics.totalTasks").value(100))
                    .andExpect(jsonPath("$.data.statistics.completedTasks").value(60))
                    .andExpect(jsonPath("$.data.statistics.completionRate").value(60.0))
                    .andExpect(jsonPath("$.data.statusDistribution.TODO").value(15))
                    .andExpect(jsonPath("$.data.statusDistribution.IN_PROGRESS").value(25))
                    .andExpect(jsonPath("$.data.statusDistribution.DONE").value(60));

            verify(analyticsService, times(1)).getTaskAnalytics(mockAccountId);
        }
    }

    @Test
    @DisplayName("Should get AI insights successfully")
    void testGetAIInsights_Success() throws Exception {
        // Given
        when(analyticsService.getAIInsights(mockAccountId)).thenReturn(mockAIInsights);

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(mockAccountId);

            // When & Then
            mockMvc.perform(get("/api/v1/analytics/ai-insights")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.message").value("AI insights generated successfully"))
                    .andExpect(jsonPath("$.data.productivityScore").value("Good"))
                    .andExpect(jsonPath("$.data.scorePercentage").value(75.0))
                    .andExpect(jsonPath("$.data.summary").value("You're making great progress on your tasks!"))
                    .andExpect(jsonPath("$.data.strengths[0]").value("Consistent task completion"))
                    .andExpect(jsonPath("$.data.suggestions[0]").value("Focus on high-priority tasks first"))
                    .andExpect(jsonPath("$.data.weaknesses[0]").value("Some overdue tasks need attention"));

            verify(analyticsService, times(1)).getAIInsights(mockAccountId);
        }
    }

    @Test
    @DisplayName("Should handle service exception when getting analytics")
    void testGetTaskAnalytics_ServiceException() throws Exception {
        // Given
        when(analyticsService.getTaskAnalytics(anyLong()))
                .thenThrow(new RuntimeException("Analytics service error"));

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(mockAccountId);

            // When & Then
            mockMvc.perform(get("/api/v1/analytics")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().is5xxServerError());

            verify(analyticsService, times(1)).getTaskAnalytics(mockAccountId);
        }
    }

    @Test
    @DisplayName("Should handle service exception when getting AI insights")
    void testGetAIInsights_ServiceException() throws Exception {
        // Given
        when(analyticsService.getAIInsights(anyLong()))
                .thenThrow(new RuntimeException("AI service error"));

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(mockAccountId);

            // When & Then
            mockMvc.perform(get("/api/v1/analytics/ai-insights")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().is5xxServerError());

            verify(analyticsService, times(1)).getAIInsights(mockAccountId);
        }
    }

    @Test
    @DisplayName("Should verify correct account ID is used for analytics")
    void testGetTaskAnalytics_CorrectAccountId() throws Exception {
        // Given
        Long specificAccountId = 42L;
        when(analyticsService.getTaskAnalytics(specificAccountId)).thenReturn(mockAnalyticsResponse);

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(specificAccountId);

            // When & Then
            mockMvc.perform(get("/api/v1/analytics")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(analyticsService, times(1)).getTaskAnalytics(specificAccountId);
            verify(analyticsService, never()).getTaskAnalytics(mockAccountId);
        }
    }

    @Test
    @DisplayName("Should verify correct account ID is used for AI insights")
    void testGetAIInsights_CorrectAccountId() throws Exception {
        // Given
        Long specificAccountId = 42L;
        when(analyticsService.getAIInsights(specificAccountId)).thenReturn(mockAIInsights);

        try (MockedStatic<SecurityUtils> securityUtilsMock = mockStatic(SecurityUtils.class)) {
            securityUtilsMock.when(SecurityUtils::getCurrentAccountId).thenReturn(specificAccountId);

            // When & Then
            mockMvc.perform(get("/api/v1/analytics/ai-insights")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(analyticsService, times(1)).getAIInsights(specificAccountId);
            verify(analyticsService, never()).getAIInsights(mockAccountId);
        }
    }
}

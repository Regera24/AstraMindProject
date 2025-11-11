package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.StreakResponse;
import az.schedule.backendservice.service.StreakService;
import az.schedule.backendservice.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Streak API", description = "Endpoints for user streak tracking and motivation")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/streak")
public class StreakController {
    private final StreakService streakService;
    
    @Operation(summary = "Get user streak", description = "Get current streak, longest streak, and activity data")
    @GetMapping
    public ApiResponse<StreakResponse> getUserStreak() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        StreakResponse streak = streakService.getUserStreak(accountId);
        return ApiResponse.<StreakResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Streak retrieved successfully")
                .data(streak)
                .build();
    }
}

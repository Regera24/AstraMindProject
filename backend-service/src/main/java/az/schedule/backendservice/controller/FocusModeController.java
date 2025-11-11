package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.FocusModeSettingsDTO;
import az.schedule.backendservice.dto.request.focusmode.FocusModeSettingsRequest;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.service.FocusModeService;
import az.schedule.backendservice.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/focus-mode")
@RequiredArgsConstructor
@Tag(name = "Focus Mode API", description = "Endpoints for Focus Mode settings and website blocking")
public class FocusModeController {
    private final FocusModeService focusModeService;
    
    @Operation(summary = "Get focus mode settings", description = "Get current user's focus mode settings including blocked websites and Pomodoro configuration")
    @GetMapping("/settings")
    public ApiResponse<FocusModeSettingsDTO> getSettings() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        FocusModeSettingsDTO settings = focusModeService.getSettings(accountId);
        return ApiResponse.<FocusModeSettingsDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Focus mode settings retrieved successfully")
                .data(settings)
                .build();
    }
    
    @Operation(summary = "Update focus mode settings", description = "Update current user's focus mode settings")
    @PutMapping("/settings")
    public ApiResponse<FocusModeSettingsDTO> updateSettings(@Valid @RequestBody FocusModeSettingsRequest request) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        FocusModeSettingsDTO settings = focusModeService.updateSettings(request, accountId);
        return ApiResponse.<FocusModeSettingsDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Focus mode settings updated successfully")
                .data(settings)
                .build();
    }
}

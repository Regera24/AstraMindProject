package az.schedule.backendservice.dto.request.focusmode;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusModeSettingsRequest {
    
    @NotNull(message = "isEnabled is required")
    private Boolean isEnabled;
    
    private List<String> blockedWebsites;
    
    @Min(value = 1, message = "Work minutes must be at least 1")
    @Max(value = 60, message = "Work minutes must not exceed 60")
    private Integer pomodoroWorkMinutes;
    
    @Min(value = 1, message = "Break minutes must be at least 1")
    @Max(value = 30, message = "Break minutes must not exceed 30")
    private Integer pomodoroBreakMinutes;
    
    @Min(value = 1, message = "Long break minutes must be at least 1")
    @Max(value = 60, message = "Long break minutes must not exceed 60")
    private Integer pomodoroLongBreakMinutes;
    
    @Min(value = 1, message = "Sessions count must be at least 1")
    @Max(value = 10, message = "Sessions count must not exceed 10")
    private Integer pomodoroSessionsBeforeLongBreak;
}

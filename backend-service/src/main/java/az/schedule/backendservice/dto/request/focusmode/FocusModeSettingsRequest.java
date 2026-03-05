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
    
    @NotNull(message = "{validation.is.enabled.required}")
    private Boolean isEnabled;
    
    private List<String> blockedWebsites;
    
    @Min(value = 1, message = "{validation.pomodoro.work.min}")
    @Max(value = 60, message = "{validation.pomodoro.work.max}")
    private Integer pomodoroWorkMinutes;
    
    @Min(value = 1, message = "{validation.pomodoro.break.min}")
    @Max(value = 30, message = "{validation.pomodoro.break.max}")
    private Integer pomodoroBreakMinutes;
    
    @Min(value = 1, message = "{validation.pomodoro.long.break.min}")
    @Max(value = 60, message = "{validation.pomodoro.long.break.max}")
    private Integer pomodoroLongBreakMinutes;
    
    @Min(value = 1, message = "{validation.pomodoro.sessions.min}")
    @Max(value = 10, message = "{validation.pomodoro.sessions.max}")
    private Integer pomodoroSessionsBeforeLongBreak;
}

package az.schedule.backendservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusModeSettingsDTO {
    private Long id;
    private Long accountId;
    private Boolean isEnabled;
    private List<String> blockedWebsites;
    private Integer pomodoroWorkMinutes;
    private Integer pomodoroBreakMinutes;
    private Integer pomodoroLongBreakMinutes;
    private Integer pomodoroSessionsBeforeLongBreak;
}

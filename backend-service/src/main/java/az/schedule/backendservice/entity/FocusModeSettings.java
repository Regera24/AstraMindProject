package az.schedule.backendservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "focus_mode_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FocusModeSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "account_id", nullable = false, unique = true)
    private Long accountId;
    
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;
    
    @ElementCollection
    @CollectionTable(name = "blocked_websites", joinColumns = @JoinColumn(name = "focus_mode_id"))
    @Column(name = "website")
    private List<String> blockedWebsites;
    
    @Column(name = "pomodoro_work_minutes")
    private Integer pomodoroWorkMinutes;
    
    @Column(name = "pomodoro_break_minutes")
    private Integer pomodoroBreakMinutes;
    
    @Column(name = "pomodoro_long_break_minutes")
    private Integer pomodoroLongBreakMinutes;
    
    @Column(name = "pomodoro_sessions_before_long_break")
    private Integer pomodoroSessionsBeforeLongBreak;
}

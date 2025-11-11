package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.FocusModeSettingsDTO;
import az.schedule.backendservice.dto.request.focusmode.FocusModeSettingsRequest;
import az.schedule.backendservice.entity.FocusModeSettings;
import az.schedule.backendservice.repository.FocusModeSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class FocusModeService {
    
    private final FocusModeSettingsRepository focusModeSettingsRepository;
    
    @Transactional(readOnly = true)
    public FocusModeSettingsDTO getSettings(Long accountId) {
        FocusModeSettings settings = focusModeSettingsRepository.findByAccountId(accountId)
                .orElseGet(() -> createDefaultSettings(accountId));
        
        return mapToDTO(settings);
    }
    
    @Transactional
    public FocusModeSettingsDTO updateSettings(FocusModeSettingsRequest request, Long accountId) {
        FocusModeSettings settings = focusModeSettingsRepository.findByAccountId(accountId)
                .orElseGet(() -> FocusModeSettings.builder()
                        .accountId(accountId)
                        .build());
        
        settings.setIsEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : false);
        settings.setBlockedWebsites(request.getBlockedWebsites() != null ? request.getBlockedWebsites() : new ArrayList<>());
        settings.setPomodoroWorkMinutes(request.getPomodoroWorkMinutes() != null ? request.getPomodoroWorkMinutes() : 25);
        settings.setPomodoroBreakMinutes(request.getPomodoroBreakMinutes() != null ? request.getPomodoroBreakMinutes() : 5);
        settings.setPomodoroLongBreakMinutes(request.getPomodoroLongBreakMinutes() != null ? request.getPomodoroLongBreakMinutes() : 15);
        settings.setPomodoroSessionsBeforeLongBreak(request.getPomodoroSessionsBeforeLongBreak() != null ? request.getPomodoroSessionsBeforeLongBreak() : 4);
        
        FocusModeSettings savedSettings = focusModeSettingsRepository.save(settings);
        return mapToDTO(savedSettings);
    }
    
    private FocusModeSettings createDefaultSettings(Long accountId) {
        return FocusModeSettings.builder()
                .accountId(accountId)
                .isEnabled(false)
                .blockedWebsites(new ArrayList<>())
                .pomodoroWorkMinutes(25)
                .pomodoroBreakMinutes(5)
                .pomodoroLongBreakMinutes(15)
                .pomodoroSessionsBeforeLongBreak(4)
                .build();
    }
    
    private FocusModeSettingsDTO mapToDTO(FocusModeSettings settings) {
        return FocusModeSettingsDTO.builder()
                .id(settings.getId())
                .accountId(settings.getAccountId())
                .isEnabled(settings.getIsEnabled())
                .blockedWebsites(settings.getBlockedWebsites())
                .pomodoroWorkMinutes(settings.getPomodoroWorkMinutes())
                .pomodoroBreakMinutes(settings.getPomodoroBreakMinutes())
                .pomodoroLongBreakMinutes(settings.getPomodoroLongBreakMinutes())
                .pomodoroSessionsBeforeLongBreak(settings.getPomodoroSessionsBeforeLongBreak())
                .build();
    }
}

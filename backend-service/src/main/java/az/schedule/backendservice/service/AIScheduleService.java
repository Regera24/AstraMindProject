package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.response.ScheduleSuggestionResponse;

public interface AIScheduleService {
    /**
     * Generate AI-powered schedule suggestions for the current month
     * 
     * @param accountId The account ID to generate suggestions for
     * @param year The year
     * @param month The month (1-12)
     * @param language User's preferred language (e.g., "en", "vi")
     * @return Schedule suggestions with analysis
     */
    ScheduleSuggestionResponse generateScheduleSuggestions(Long accountId, int year, int month, String language);
}

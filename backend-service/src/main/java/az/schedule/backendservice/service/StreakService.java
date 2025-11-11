package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.response.StreakResponse;

public interface StreakService {
    /**
     * Get user's streak information
     * @param accountId User account ID
     * @return Streak data including current streak, longest streak, and activity
     */
    StreakResponse getUserStreak(Long accountId);
}

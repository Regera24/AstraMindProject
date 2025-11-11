package az.schedule.backendservice.repository;

import az.schedule.backendservice.entity.FocusModeSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FocusModeSettingsRepository extends JpaRepository<FocusModeSettings, Long> {
    Optional<FocusModeSettings> findByAccountId(Long accountId);
}

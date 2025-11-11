package az.schedule.backendservice.repository;

import az.schedule.backendservice.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByTargetAccountId(Long accountId, Pageable pageable);
    
    List<Notification> findByTargetAccountIdAndIsReadFalse(Long accountId);
    
    long countByTargetAccountIdAndIsReadFalse(Long accountId);
}

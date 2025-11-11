package az.schedule.backendservice.repository;

import az.schedule.backendservice.entity.Task;
import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByAccountId(Long accountId, Pageable pageable);
    
    List<Task> findByAccountId(Long accountId); // For analytics - get all tasks
    
    Page<Task> findByCategoryId(Long categoryId, Pageable pageable);
    
    Page<Task> findByAccountIdAndStatus(Long accountId, TaskStatus status, Pageable pageable);
    
    Page<Task> findByAccountIdAndCategoryId(Long accountId, Long categoryId, Pageable pageable);
    
    Page<Task> findByAccountIdAndStatusContainingIgnoreCase(Long accountId, String keyword, Pageable pageable);
    
    Page<Task> findByAccountIdAndPriority(Long accountId, Priority priority, Pageable pageable);
    
    // Overdue tasks - where endTime < now and status != DONE
    List<Task> findByAccountIdAndEndTimeBeforeAndStatusNot(Long accountId, LocalDateTime dateTime, TaskStatus status);
    
    long countByAccountIdAndEndTimeBeforeAndStatusNot(Long accountId, LocalDateTime dateTime, TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.account.id = :accountId AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Task> searchByAccountIdAndKeyword(@Param("accountId") Long accountId, 
                                           @Param("keyword") String keyword, 
                                           Pageable pageable);
    
    List<Task> findByAccountIdAndStartTimeBetween(Long accountId, LocalDateTime start, LocalDateTime end);
    
    long countByAccountId(Long accountId);
    
    long countByAccountIdAndStatus(Long accountId, TaskStatus status);
    
    long countByCategoryId(Long categoryId);
    
    long countByCategoryIdAndStatus(Long categoryId, TaskStatus status);
    
    boolean existsByTitleAndAccountId(String title, Long accountId);

    @Query("SELECT t FROM Task t WHERE " +
            "t.startTime <= :threshold " +
            "AND t.startTime > :now " +
            "AND t.status = :status " +
            "AND t.startReminderSent = false")
    List<Task> findTasksStartingSoon(
            @Param("threshold") LocalDateTime threshold,
            @Param("now") LocalDateTime now,
            @Param("status") TaskStatus status
    );

    @Query("SELECT t FROM Task t WHERE " +
            "t.endTime <= :threshold " +
            "AND t.endTime > :now " +
            "AND t.status IN :statuses " +
            "AND t.endReminderSent = false")
    List<Task> findTasksEndingSoon(
            @Param("threshold") LocalDateTime threshold,
            @Param("now") LocalDateTime now,
            @Param("statuses") List<TaskStatus> statuses
    );
}

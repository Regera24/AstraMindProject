package az.schedule.backendservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemStatisticsResponse {
    Long totalUsers;
    Long activeUsers;
    Long inactiveUsers;
    Long totalTasks;
    Long completedTasks;
    Long pendingTasks;
    Long totalCategories;
    Long adminUsers;
    Long regularUsers;
}

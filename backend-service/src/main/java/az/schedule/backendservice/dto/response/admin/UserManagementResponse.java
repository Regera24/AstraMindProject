package az.schedule.backendservice.dto.response.admin;

import az.schedule.backendservice.dto.AccountDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserManagementResponse {
    List<AccountDTO> users;
    Long totalCount;
    Integer pageNo;
    Integer pageSize;
    Long totalPages;
}

package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.dto.response.admin.SystemStatisticsResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public interface AdminService {
    SystemStatisticsResponse getSystemStatistics();
    
    PageResponse<AccountDTO> getAllUsers(Pageable pageable);
    
    PageResponse<AccountDTO> searchUsers(String keyword, Pageable pageable);
    
    AccountDTO updateUserRole(Long userId, Long roleId);
    
    AccountDTO updateUserStatus(Long userId, Boolean isActive);
    
    void deleteUser(Long userId);
}

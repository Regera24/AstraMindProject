package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.converter.AccountConverter;
import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.dto.response.admin.SystemStatisticsResponse;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Role;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.repository.CategoryRepository;
import az.schedule.backendservice.repository.RoleRepository;
import az.schedule.backendservice.repository.TaskRepository;
import az.schedule.backendservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {
    private final AccountRepository accountRepository;
    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
    private final RoleRepository roleRepository;
    private final AccountConverter accountConverter;

    @Override
    public SystemStatisticsResponse getSystemStatistics() {
        log.info("Fetching system statistics");
        
        // Get all accounts
        List<Account> allAccounts = accountRepository.findAll();
        long totalUsers = allAccounts.size();
        long activeUsers = allAccounts.stream().filter(Account::getIsActive).count();
        long inactiveUsers = totalUsers - activeUsers;
        
        // Count admin and regular users
        long adminUsers = allAccounts.stream()
                .filter(account -> account.getRole() != null && "ADMIN".equals(account.getRole().getCode()))
                .count();
        long regularUsers = totalUsers - adminUsers;
        
        // Get task statistics
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.findAll().stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();
        long pendingTasks = totalTasks - completedTasks;
        
        // Get category statistics
        long totalCategories = categoryRepository.count();
        
        return SystemStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .totalCategories(totalCategories)
                .adminUsers(adminUsers)
                .regularUsers(regularUsers)
                .build();
    }

    @Override
    public PageResponse<AccountDTO> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination: {}", pageable);
        
        Page<Account> accountPage = accountRepository.findAll(pageable);
        
        List<AccountDTO> accountDTOs = accountPage.getContent().stream()
                .map(accountConverter::toDTO)
                .collect(Collectors.toList());
        
        return PageResponse.<AccountDTO>builder()
                .pageNo(accountPage.getNumber())
                .pageSize(accountPage.getSize())
                .totalPages((long) accountPage.getTotalPages())
                .data(accountDTOs)
                .build();
    }

    @Override
    public PageResponse<AccountDTO> searchUsers(String keyword, Pageable pageable) {
        log.info("Searching users with keyword: {}", keyword);
        
        Page<Account> accountPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            accountPage = accountRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            accountPage = accountRepository.findAll(pageable);
        }
        
        List<AccountDTO> accountDTOs = accountPage.getContent().stream()
                .map(accountConverter::toDTO)
                .collect(Collectors.toList());
        
        return PageResponse.<AccountDTO>builder()
                .pageNo(accountPage.getNumber())
                .pageSize(accountPage.getSize())
                .totalPages((long) accountPage.getTotalPages())
                .data(accountDTOs)
                .build();
    }

    @Override
    @Transactional
    public AccountDTO updateUserRole(Long userId, Long roleId) {
        log.info("Updating user {} role to roleId: {}", userId, roleId);
        
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        account.setRole(role);
        Account updatedAccount = accountRepository.save(account);
        
        log.info("Successfully updated user {} role to {}", userId, role.getCode());
        return accountConverter.toDTO(updatedAccount);
    }

    @Override
    @Transactional
    public AccountDTO updateUserStatus(Long userId, Boolean isActive) {
        log.info("Updating user {} status to: {}", userId, isActive);
        
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        account.setIsActive(isActive);
        Account updatedAccount = accountRepository.save(account);
        
        log.info("Successfully updated user {} status to {}", userId, isActive);
        return accountConverter.toDTO(updatedAccount);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        log.info("Deleting user: {}", userId);
        
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        // Check if user is trying to delete themselves
        // This should be prevented at controller level as well
        accountRepository.delete(account);
        
        log.info("Successfully deleted user: {}", userId);
    }
}

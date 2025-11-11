package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.converter.AccountConverter;
import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.request.account.AccountUpdateRequest;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Role;
import az.schedule.backendservice.entity.Subscription;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.repository.RoleRepository;
import az.schedule.backendservice.repository.SubscriptionRepository;
import az.schedule.backendservice.service.AccountService;
import az.schedule.backendservice.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AccountConverter accountConverter;

    @Override
    public AccountDTO getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        return accountConverter.toDTO(account);
    }

    @Override
    public AccountDTO getAccountByEmail(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        return accountConverter.toDTO(account);
    }

    @Override
    public AccountDTO getAccountByUsername(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        return accountConverter.toDTO(account);
    }

    @Override
    @Transactional
    public AccountDTO updateAccount(Long id, AccountUpdateRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (request.getEmail() != null && !account.getEmail().equals(request.getEmail())) {
            if (accountRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
        }

        Role role = null;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        }

        Subscription subscription = null;
        if (request.getSubscriptionId() != null) {
            subscription = subscriptionRepository.findById(request.getSubscriptionId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        }

        accountConverter.updateEntity(account, request, role, subscription);
        Account updatedAccount = accountRepository.save(account);
        return accountConverter.toDTO(updatedAccount);
    }

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        accountRepository.delete(account);
    }

    @Override
    public PageResponse<AccountDTO> searchAccounts(String keyword, Pageable pageable) {
        Page<Account> accountPage;
        if (keyword != null && !keyword.isEmpty()) {
            accountPage = accountRepository.searchByKeyword(keyword, pageable);
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
    public AccountDTO getCurrentAccount() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        if (accountId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return getAccountById(accountId);
    }
}

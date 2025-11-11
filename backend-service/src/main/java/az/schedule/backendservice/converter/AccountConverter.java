package az.schedule.backendservice.converter;

import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.request.account.AccountUpdateRequest;
import az.schedule.backendservice.dto.request.authentication.AccountCreationRequest;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Role;
import az.schedule.backendservice.entity.Subscription;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountConverter {
    private final ModelMapper modelMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public Account toAccountEntity(AccountCreationRequest request) {
        Account acc = modelMapper.map(request, Account.class);
        Role role =
                roleRepository.findByCode(request.getRole()).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        acc.setPassword(passwordEncoder.encode(request.getPassword()));
        acc.setRole(role);
        acc.setIsActive(true);
        return acc;
    }

    public AccountDTO toDTO(Account account) {
        AccountDTO dto = modelMapper.map(account, AccountDTO.class);
        
        if (account.getRole() != null) {
            dto.setRoleId(account.getRole().getId());
            dto.setRoleName(account.getRole().getCode());
        }
        
        if (account.getSubscription() != null) {
            dto.setSubscriptionId(account.getSubscription().getId());
            dto.setSubscriptionName(account.getSubscription().getName());
        }
        
        return dto;
    }

    public void updateEntity(Account account, AccountUpdateRequest request, Role role, Subscription subscription) {
        if (request.getFullName() != null) {
            account.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            account.setEmail(request.getEmail());
        }
        if (request.getGender() != null) {
            account.setGender(request.getGender());
        }
        if (request.getBirthDate() != null) {
            account.setBirthDate(request.getBirthDate());
        }
        if (request.getPhoneNumber() != null) {
            account.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAvatarUrl() != null) {
            account.setAvatarUrl(request.getAvatarUrl());
        }
        if (role != null) {
            account.setRole(role);
        }
        if (subscription != null) {
            account.setSubscription(subscription);
        }
    }
}

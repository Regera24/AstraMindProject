package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.converter.SubscriptionConverter;
import az.schedule.backendservice.dto.SubscriptionDTO;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {
    private final AccountRepository accountRepository;
    private final SubscriptionConverter subscriptionConverter;
    
    @Value("${app.subscription.payment-url:http://localhost:3000/subscription/payment}")
    private String paymentBaseUrl;

    @Override
    public boolean hasActiveSubscription(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        return account.getSubscription() != null;
    }

    @Override
    public String getSubscriptionPaymentUrl(Long accountId) {
        return paymentBaseUrl + "?accountId=" + accountId;
    }

    @Override
    public SubscriptionDTO getAccountSubscription(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        return subscriptionConverter.toDTO(account.getSubscription());
    }
}

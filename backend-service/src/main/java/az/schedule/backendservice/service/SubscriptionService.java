package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.SubscriptionDTO;

public interface SubscriptionService {
    boolean hasActiveSubscription(Long accountId);
    String getSubscriptionPaymentUrl(Long accountId);
    SubscriptionDTO getAccountSubscription(Long accountId);
}

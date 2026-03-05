package az.schedule.backendservice.aspect;

import az.schedule.backendservice.annotation.RequireSubscription;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.service.SubscriptionService;
import az.schedule.backendservice.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionAspect {
    private final SubscriptionService subscriptionService;

    @Before("@annotation(requireSubscription)")
    public void checkSubscription(RequireSubscription requireSubscription) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        
        if (accountId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!subscriptionService.hasActiveSubscription(accountId)) {
            log.warn("Account {} attempted to access AI feature without subscription", accountId);
            throw new AppException(ErrorCode.SUBSCRIPTION_REQUIRED);
        }
    }
}

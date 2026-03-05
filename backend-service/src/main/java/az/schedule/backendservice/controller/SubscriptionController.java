package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.SubscriptionDTO;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.SubscriptionRequiredResponse;
import az.schedule.backendservice.service.SubscriptionService;
import az.schedule.backendservice.utils.MessageUtils;
import az.schedule.backendservice.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Subscription API", description = "Endpoints for managing subscriptions")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/subscription")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final MessageUtils messageUtils;

    @Operation(summary = "Check subscription status", description = "Check if the current user has an active subscription")
    @GetMapping("/status")
    public ApiResponse<SubscriptionRequiredResponse> checkSubscriptionStatus() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        boolean hasSubscription = subscriptionService.hasActiveSubscription(accountId);
        SubscriptionDTO subscription = subscriptionService.getAccountSubscription(accountId);
        
        SubscriptionRequiredResponse response = SubscriptionRequiredResponse.builder()
                .hasSubscription(hasSubscription)
                .subscription(subscription)
                .message(hasSubscription 
                    ? messageUtils.getMessage("success.subscription.active")
                    : messageUtils.getMessage("error.subscription.required"))
                .paymentUrl(hasSubscription ? null : subscriptionService.getSubscriptionPaymentUrl(accountId))
                .build();
        
        return ApiResponse.<SubscriptionRequiredResponse>builder()
                .code(HttpStatus.OK.value())
                .message(messageUtils.getMessage("success.subscription.check"))
                .data(response)
                .build();
    }

    @Operation(summary = "Get payment URL", description = "Get the payment URL for subscription")
    @GetMapping("/payment-url")
    public ApiResponse<String> getPaymentUrl() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        String paymentUrl = subscriptionService.getSubscriptionPaymentUrl(accountId);
        
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message(messageUtils.getMessage("success.subscription.payment.url"))
                .data(paymentUrl)
                .build();
    }
}

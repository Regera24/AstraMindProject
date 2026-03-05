package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.dto.request.SepayWebhookRequest;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Payment;
import az.schedule.backendservice.entity.Subscription;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.repository.PaymentRepository;
import az.schedule.backendservice.repository.SubscriptionRepository;
import az.schedule.backendservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;
    private final SubscriptionRepository subscriptionRepository;
    
    private static final double PREMIUM_PRICE = 29000.0;
    private static final String PAYMENT_KEYWORD = "SEVQR thanh toan premium astramind";
    
    @Override
    @Transactional
    public void processSepayWebhook(SepayWebhookRequest request) {
        log.info("Processing Sepay webhook: transactionId={}, amount={}, content={}", 
                request.getId(), request.getTransferAmount(), request.getContent());
        
        // 1. Validate transaction type (must be incoming)
        if (!"in".equalsIgnoreCase(request.getTransferType())) {
            log.warn("Skipping outgoing transaction: {}", request.getId());
            return;
        }
        
        // 2. Check duplicate transaction
        String transactionId = String.valueOf(request.getId());
        if (paymentRepository.existsByTransactionId(transactionId)) {
            log.warn("Duplicate transaction detected: {}", transactionId);
            return;
        }
        
        // 3. Validate amount
        if (request.getTransferAmount() < PREMIUM_PRICE) {
            log.error("Invalid amount: {} (minimum: {})", request.getTransferAmount(), PREMIUM_PRICE);
            saveFailedPayment(request, null, "INVALID_AMOUNT");
            return;
        }
        
        // 4. Extract username from content
        String username = extractUsernameFromContent(request.getContent());
        if (username == null) {
            log.error("Cannot extract username from content: {}", request.getContent());
            saveFailedPayment(request, null, "INVALID_CONTENT");
            return;
        }
        
        // 5. Find account by username
        Account account = accountRepository.findByUsername(username).orElse(null);
        if (account == null) {
            log.error("Account not found for username: {}", username);
            saveFailedPayment(request, null, "ACCOUNT_NOT_FOUND");
            return;
        }
        
        // 6. Check if account already has subscription
        if (account.getSubscription() != null) {
            log.warn("Account {} already has subscription", username);
            saveSuccessPayment(request, account, account.getSubscription());
            return;
        }
        
        // 7. Find Premium subscription
        Subscription premiumSubscription = subscriptionRepository.findByName("Premium")
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        
        // 8. Activate Premium for account
        account.setSubscription(premiumSubscription);
        accountRepository.save(account);
        
        // 9. Save successful payment
        saveSuccessPayment(request, account, premiumSubscription);
        
        log.info("Premium activated successfully for account: {} (username: {})", 
                account.getId(), username);
    }
    
    private String extractUsernameFromContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return null;
        }
        
        // Normalize content (lowercase, remove extra spaces)
        String normalizedContent = content.toLowerCase().trim().replaceAll("\\s+", " ");
        
        // Pattern: "thanh toan premium astramind {username}"
        // Case insensitive, flexible spacing
        String patternStr = PAYMENT_KEYWORD.toLowerCase() + "\\s+(.+)";
        Pattern pattern = Pattern.compile(patternStr);
        Matcher matcher = pattern.matcher(normalizedContent);
        
        if (matcher.find()) {
            String username = matcher.group(1).trim();
            log.info("Extracted username: {} from content: {}", username, content);
            return username;
        }
        
        log.warn("Cannot extract username from content: {}", content);
        return null;
    }
    
    private void saveSuccessPayment(SepayWebhookRequest request, Account account, Subscription subscription) {
        Payment payment = Payment.builder()
                .account(account)
                .subscription(subscription)
                .amount(request.getTransferAmount())
                .transactionId(String.valueOf(request.getId()))
                .gateway(request.getGateway())
                .content(request.getContent())
                .referenceCode(request.getReferenceCode())
                .transactionDate(request.getTransactionDate())
                .status("SUCCESS")
                .paymentMethod("BANK_TRANSFER")
                .build();
        
        paymentRepository.save(payment);
        log.info("Payment saved successfully: transactionId={}", request.getId());
    }
    
    private void saveFailedPayment(SepayWebhookRequest request, Account account, String reason) {
        Payment payment = Payment.builder()
                .account(account)
                .amount(request.getTransferAmount())
                .transactionId(String.valueOf(request.getId()))
                .gateway(request.getGateway())
                .content(request.getContent())
                .referenceCode(request.getReferenceCode())
                .transactionDate(request.getTransactionDate())
                .status("FAILED_" + reason)
                .paymentMethod("BANK_TRANSFER")
                .build();
        
        paymentRepository.save(payment);
        log.info("Failed payment saved: transactionId={}, reason={}", request.getId(), reason);
    }
}

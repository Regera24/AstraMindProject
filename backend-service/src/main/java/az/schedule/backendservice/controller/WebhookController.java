package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.request.SepayWebhookRequest;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Webhook API", description = "Endpoints for payment webhooks")
@RestController
@RequestMapping("/api/v1/webhook")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {
    
    private final PaymentService paymentService;
    
    @Operation(summary = "Sepay payment webhook", description = "Receive payment notifications from Sepay")
    @PostMapping("/sepay")
    public ApiResponse<Void> handleSepayWebhook(@RequestBody SepayWebhookRequest request) {
        log.info("Received Sepay webhook: transactionId={}, amount={}, content={}", 
                request.getId(), request.getTransferAmount(), request.getContent());
        
        try {
            paymentService.processSepayWebhook(request);
            
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.OK.value())
                    .message("Webhook processed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error processing Sepay webhook: {}", e.getMessage(), e);
            
            // Return 200 to prevent Sepay from retrying
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.OK.value())
                    .message("Webhook received but processing failed")
                    .build();
        }
    }
}

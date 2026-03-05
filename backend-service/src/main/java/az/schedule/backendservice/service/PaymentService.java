package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.request.SepayWebhookRequest;

public interface PaymentService {
    void processSepayWebhook(SepayWebhookRequest request);
}

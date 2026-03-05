package az.schedule.backendservice.dto.response;

import az.schedule.backendservice.dto.SubscriptionDTO;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionRequiredResponse {
    private String message;
    private String paymentUrl;
    private boolean hasSubscription;
    private SubscriptionDTO subscription;
}

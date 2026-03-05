package az.schedule.backendservice.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SepayWebhookRequest {
    private Long id;
    
    private String gateway;
    
    private String transactionDate;
    
    private String accountNumber;
    
    private String code;
    
    private String content;
    
    private String transferType;
    
    private Double transferAmount;
    
    private Double accumulated;
    
    private String subAccount;
    
    private String referenceCode;
    
    private String description;
}

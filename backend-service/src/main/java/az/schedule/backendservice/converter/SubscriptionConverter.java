package az.schedule.backendservice.converter;

import az.schedule.backendservice.dto.SubscriptionDTO;
import az.schedule.backendservice.entity.Subscription;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionConverter {
    
    public SubscriptionDTO toDTO(Subscription subscription) {
        if (subscription == null) {
            return null;
        }
        
        return SubscriptionDTO.builder()
                .id(subscription.getId())
                .name(subscription.getName())
                .description(subscription.getDescription())
                .price(subscription.getPrice())
                .timeOfExpiration(subscription.getTimeOfExpiration())
                .isActive(subscription.getIsActive())
                .build();
    }
}

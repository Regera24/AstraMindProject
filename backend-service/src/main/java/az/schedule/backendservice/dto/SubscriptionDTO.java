package az.schedule.backendservice.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubscriptionDTO {
    Long id;
    String name;
    String description;
    Double price;
    Integer timeOfExpiration;
    Boolean isActive;
}

package az.schedule.backendservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountDTO {
    Long id;
    String username;
    String fullName;
    String email;
    Boolean isActive;
    Boolean gender;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate birthDate;
    
    String avatarUrl;
    String phoneNumber;
    String roleName;
    Long roleId;
    String subscriptionName;
    Long subscriptionId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime updatedAt;
}

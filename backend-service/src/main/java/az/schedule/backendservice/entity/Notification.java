package az.schedule.backendservice.entity;

import az.schedule.backendservice.enums.NotificationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Notification")
public class Notification extends BaseEntity{
    @NotBlank(message = "Title is required")
    String title;

    @Column(name = "Message", nullable = false, columnDefinition = "NVARCHAR(500)")
    String message;

    @Column(name = "IsRead")
    Boolean isRead;

    @ManyToOne()
    @JoinColumn(name = "AccountID")
    Account sendAccount;

    @ManyToOne()
    @JoinColumn(name = "targetAccountID")
    Account targetAccount;

    @Enumerated(EnumType.STRING)
    private NotificationType type;
}

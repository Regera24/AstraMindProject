package az.schedule.backendservice.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "AppStatistics")
public class AppStatistics extends BaseEntity {
    @ManyToOne()
    @JoinColumn(name = "AccountID")
    Account account;

    @Column(name = "SubscriptionName", columnDefinition = "NVARCHAR(255)")
    String subscriptionName;

    @Column(name = "SubscriptionPrice")
    Double subscriptionPrice;

    @Column(name = "SubscriptionTimeOfExpiration")
    Integer subscriptionTimeOfExpiration;

    @Column(name = "TransactionID")
    String transactionId;
}

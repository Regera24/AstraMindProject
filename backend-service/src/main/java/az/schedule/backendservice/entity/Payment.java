package az.schedule.backendservice.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Payment")
public class Payment extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "AccountID")
    Account account;
    
    @Column(name = "Amount")
    Double amount;
    
    @Column(name = "TransactionID", unique = true)
    String transactionId;
    
    @Column(name = "Gateway")
    String gateway;
    
    @Column(name = "Content", columnDefinition = "NVARCHAR(1000)")
    String content;
    
    @Column(name = "ReferenceCode")
    String referenceCode;
    
    @Column(name = "Status")
    String status; // SUCCESS, PENDING, FAILED
    
    @Column(name = "PaymentMethod")
    String paymentMethod; // BANK_TRANSFER
    
    @Column(name = "TransactionDate")
    String transactionDate;
    
    @ManyToOne
    @JoinColumn(name = "SubscriptionID")
    Subscription subscription;
}

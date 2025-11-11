package az.schedule.backendservice.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Account")
public class Account extends BaseEntity{
    @Column(unique = true, nullable = false)
    String username;

    String fullName;

    @Column(unique = true, nullable = false)
    String email;

    String password;

    Boolean isActive;

    Boolean gender;

    LocalDate birthDate;

    @Column(name = "Otp", length = 7)
    String otp;

    String avatarUrl;

    String phoneNumber;

    @OneToMany(mappedBy = "targetAccount", fetch = FetchType.LAZY)
    List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "sendAccount", fetch = FetchType.LAZY)
    List<Notification> sentNotifications = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "RoleID")
    Role role;

    @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
    List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
    List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
    List<Payment> payments = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "SubscriptionID")
    Subscription subscription;
}

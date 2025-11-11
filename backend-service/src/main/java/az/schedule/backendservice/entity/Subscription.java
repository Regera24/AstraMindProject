package az.schedule.backendservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Subscription")
public class Subscription extends BaseEntity{
    @Column(name = "Name", columnDefinition = "NVARCHAR(255)")
    String name;

    @Column(name = "Description", columnDefinition = "NVARCHAR(1000)")
    String description;

    @Column(name = "Price")
    Double price;

    @Column(name = "TimeOfExpiration")
    Integer timeOfExpiration;

    @Column(name = "isActive")
    Boolean isActive;
}

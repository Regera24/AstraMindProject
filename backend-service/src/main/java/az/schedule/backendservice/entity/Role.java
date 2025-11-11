package az.schedule.backendservice.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Role")
public class Role extends BaseEntity{
    @Column(name = "Code" , nullable = false, unique = true)
    String code;

    @Column(name = "Description", columnDefinition = "NVARCHAR(255)")
    String description;

    @OneToMany(mappedBy = "role")
    List<Account> accounts = new ArrayList<>();
}

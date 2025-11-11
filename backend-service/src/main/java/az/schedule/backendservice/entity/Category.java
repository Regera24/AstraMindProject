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
@Table(name = "Category")
public class Category extends BaseEntity{
    @Column(name = "Name", nullable = false,columnDefinition = "NVARCHAR(255)")
    String name;

    @Column(name = "Description" ,columnDefinition = "NVARCHAR(1000)")
    String description;

    @Column(name = "Color" ,columnDefinition = "VARCHAR(10)")
    String color;

    @ManyToOne
    @JoinColumn(name = "AccountID")
    Account account;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    List<Task> tasks = new ArrayList<>();
}

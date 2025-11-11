package az.schedule.backendservice.repository;

import az.schedule.backendservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    public Optional<Role> findByCode(String name);
}

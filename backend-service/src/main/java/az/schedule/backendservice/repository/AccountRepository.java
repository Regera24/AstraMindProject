package az.schedule.backendservice.repository;

import az.schedule.backendservice.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    public Optional<Account> findByUsername(String username);

    public boolean existsByUsername(String username);

    public boolean existsByEmail(String email);

    public boolean existsByPhoneNumber(String phoneNumber);

    public Optional<Account> findByEmail(String email);

    @Transactional
    @Modifying
    @Query("UPDATE Account a SET a.otp = NULL WHERE a.id = :accountID")
    void clearOTP(Long accountID);

    @Query("SELECT a FROM Account a WHERE " +
           "LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Account> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}

package az.schedule.backendservice.repository;

import az.schedule.backendservice.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Page<Category> findByAccountId(Long accountId, Pageable pageable);
    
    List<Category> findByAccountId(Long accountId);
    
    Optional<Category> findByNameAndAccountId(String name, Long accountId);
    
    boolean existsByNameAndAccountId(String name, Long accountId);
    
    @Query("SELECT c FROM Category c WHERE c.account.id = :accountId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Category> searchByAccountIdAndKeyword(@Param("accountId") Long accountId, 
                                               @Param("keyword") String keyword, 
                                               Pageable pageable);
    
    long countByAccountId(Long accountId);
}

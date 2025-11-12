package az.schedule.backendservice.repository;

import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.response.PageResponse;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountSearchRepository {
    public PageResponse<AccountDTO> getAllNewsWithSortAndSearchByCriteria(
            int offset, int pageSize, String sort, String... search);
}

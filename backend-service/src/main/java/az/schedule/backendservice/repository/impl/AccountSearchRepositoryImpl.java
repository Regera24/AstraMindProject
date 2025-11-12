package az.schedule.backendservice.repository.impl;

import az.schedule.backendservice.converter.AccountConverter;
import az.schedule.backendservice.converter.CriteriaConverter;
import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.repository.AccountSearchRepository;
import az.schedule.backendservice.repository.criteria.AccountCriteriaQueryConsumer;
import az.schedule.backendservice.repository.criteria.SearchCriteria;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Repository
@RequiredArgsConstructor
public class AccountSearchRepositoryImpl implements AccountSearchRepository {
    @PersistenceContext
    private EntityManager em;

    private final CriteriaConverter criteriaConverter;
    private final AccountConverter accountConverter;

    @Override
    public PageResponse<AccountDTO> getAllNewsWithSortAndSearchByCriteria(int offset, int pageSize, String sort, String... search) {
        List<SearchCriteria> criteriaList = criteriaConverter.toCriteriaList(search);

        int realOffset = offset;

        if (offset > 0) {
            realOffset = (offset - 1) * pageSize;
        }

        List<Account> accounts = getAccounts(realOffset, pageSize, sort, criteriaList);

        List<AccountDTO> newsArticleDTOS =
                accounts.stream().map(accountConverter::toDTO).toList();

        long totalElements = getTotalNews(criteriaList);
        long totalPage = (long) Math.ceil((double) totalElements / pageSize);

        return PageResponse.<AccountDTO>builder()
                .pageNo(offset)
                .pageSize(pageSize)
                .data(newsArticleDTOS)
                .totalPages(totalPage)
                .build();
    }

    public List<Account> getAccounts(int offset, int pageSize, String sort, List<SearchCriteria> criteriaList) {
        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Account> criteriaQuery = criteriaBuilder.createQuery(Account.class);
        Root<Account> root = criteriaQuery.from(Account.class);

        Predicate predicate = criteriaBuilder.conjunction();
        AccountCriteriaQueryConsumer consumer =
                new AccountCriteriaQueryConsumer(criteriaBuilder, predicate, root);
        criteriaList.forEach(consumer);

        predicate = consumer.getPredicate();
        criteriaQuery.where(predicate);

        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("(\\w+?)(:)(asc|desc)");
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(3).equalsIgnoreCase("asc")) {
                    criteriaQuery.orderBy(criteriaBuilder.asc(root.get(columnName)));
                } else {
                    criteriaQuery.orderBy(criteriaBuilder.desc(root.get(columnName)));
                }
            }
        }
        return em.createQuery(criteriaQuery)
                .setFirstResult(offset)
                .setMaxResults(pageSize)
                .getResultList();
    }

    private long getTotalNews(List<SearchCriteria> criteriaList) {
        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
        Root<Account> root = countQuery.from(Account.class);

        countQuery.select(criteriaBuilder.count(root));

        Predicate predicate = criteriaBuilder.conjunction();
        AccountCriteriaQueryConsumer consumer =
                new AccountCriteriaQueryConsumer(criteriaBuilder, predicate, root);
        criteriaList.forEach(consumer);
        predicate = consumer.getPredicate();

        countQuery.where(predicate);

        return em.createQuery(countQuery).getSingleResult();
    }
}

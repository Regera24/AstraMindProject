package az.schedule.backendservice.utils;

import org.springframework.data.domain.Sort;

public class SortUtils {
    public static Sort getSortOrder(String sortDir, String sortBy) {
        return sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
    }

    private SortUtils() {
        throw new UnsupportedOperationException("Utility class");
    }
}

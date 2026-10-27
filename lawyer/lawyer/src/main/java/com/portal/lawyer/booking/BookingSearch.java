package com.portal.lawyer.booking;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/** Filters for the admin list. Every field is optional. */
public record BookingSearch(String q, BookingStatus status, String area, LocalDate from, LocalDate to) {

    public Specification<Booking> toSpecification(ZoneId zone) {
        return (root, query, cb) -> {
            List<Predicate> where = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String term = q.trim().toLowerCase().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
                String like = "%" + term + "%";
                List<Predicate> any = new ArrayList<>(List.of(
                        cb.like(cb.lower(root.get("name")), like, '\\'),
                        cb.like(cb.lower(root.get("email")), like, '\\'),
                        cb.like(cb.lower(root.get("area")), like, '\\'),
                        cb.like(cb.lower(root.get("message")), like, '\\')));

                // Phone is compared digits-only, so "98765 43210" finds "9876543210"
                String digits = q.replaceAll("\\D", "");
                if (digits.length() >= 3) {
                    Expression<String> phoneDigits = cb.function("regexp_replace", String.class,
                            root.get("phone"), cb.literal("[^0-9]"), cb.literal(""), cb.literal("g"));
                    any.add(cb.like(phoneDigits, "%" + digits + "%"));
                }
                where.add(cb.or(any.toArray(Predicate[]::new)));
            }
            if (status != null) where.add(cb.equal(root.get("status"), status));
            if (area != null && !area.isBlank()) where.add(cb.equal(root.get("area"), area));
            if (from != null) where.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay(zone).toInstant()));
            if (to != null) where.add(cb.lessThan(root.get("createdAt"), to.plusDays(1).atStartOfDay(zone).toInstant()));

            return cb.and(where.toArray(Predicate[]::new));
        };
    }
}

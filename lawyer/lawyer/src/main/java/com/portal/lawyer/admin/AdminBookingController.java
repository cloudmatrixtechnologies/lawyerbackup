package com.portal.lawyer.admin;

import com.portal.lawyer.booking.Booking;
import com.portal.lawyer.booking.BookingRepository;
import com.portal.lawyer.booking.BookingSearch;
import com.portal.lawyer.booking.BookingStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Admin-only booking endpoints. Access is enforced by {@link AdminAuthInterceptor}. */
@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    /** Sortable columns: API name → entity field. Anything else falls back to newest first. */
    private static final Map<String, String> SORTS = Map.of(
            "createdAt", "createdAt",
            "name", "name",
            "status", "status",
            "area", "area",
            "completedAt", "completedAt");

    public record PageResponse(List<Booking> items, long total, int page, int size, int totalPages) {
    }

    public record StatusUpdate(@NotNull(message = "Status is required.") BookingStatus status) {
    }

    private final BookingRepository repository;
    private final ZoneId zone;

    public AdminBookingController(BookingRepository repository, @Value("${app.timezone}") String zone) {
        this.repository = repository;
        this.zone = ZoneId.of(zone);
    }

    @GetMapping
    @Transactional(readOnly = true)
    public PageResponse list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String dir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Sort.Direction direction = "asc".equalsIgnoreCase(dir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String field = SORTS.getOrDefault(sort, "createdAt");
        Sort order = Sort.by(direction, field);
        if (!field.equals("createdAt")) order = order.and(Sort.by(Sort.Direction.DESC, "createdAt")); // stable tie-break

        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, 100), order);
        Page<Booking> result = repository.findAll(
                new BookingSearch(q, status, area, from, to).toSpecification(zone), pageable);

        return new PageResponse(result.getContent(), result.getTotalElements(),
                result.getNumber(), result.getSize(), result.getTotalPages());
    }

    /** Counts for the status tabs. */
    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public Map<String, Long> stats() {
        return Map.of(
                "ALL", repository.count(),
                "NEW", repository.countByStatus(BookingStatus.NEW),
                "CONTACTED", repository.countByStatus(BookingStatus.CONTACTED),
                "COMPLETED", repository.countByStatus(BookingStatus.COMPLETED));
    }

    /** Change status — e.g. { "status": "COMPLETED" } marks the consultation completed. */
    @PatchMapping("/{id}/status")
    @Transactional
    public Booking updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusUpdate body) {
        Booking booking = find(id);
        booking.changeStatus(body.status());
        return booking;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable UUID id) {
        repository.delete(find(id));
    }

    private Booking find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found."));
    }
}

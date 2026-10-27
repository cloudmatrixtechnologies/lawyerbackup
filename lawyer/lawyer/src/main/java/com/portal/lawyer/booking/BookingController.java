package com.portal.lawyer.booking;

import com.portal.lawyer.common.ClientIp;
import com.portal.lawyer.common.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

/** Public endpoint used by the website's contact form. */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository repository;
    private final RateLimiter limiter = new RateLimiter(10, Duration.ofHours(1));

    public BookingController(BookingRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@Valid @RequestBody BookingRequest req, HttpServletRequest http) {
        limiter.check(ClientIp.of(http));

        // Honeypot filled → a bot. Pretend success, store nothing.
        if (req.website() != null && !req.website().isBlank()) return Map.of("ok", true);

        repository.save(new Booking(
                clean(req.name()), clean(req.phone()), clean(req.email()), clean(req.area()),
                req.message() == null ? "" : req.message().trim()));
        return Map.of("ok", true);
    }

    private static String clean(String v) {
        return v == null ? "" : v.trim().replaceAll("\\s+", " ");
    }
}

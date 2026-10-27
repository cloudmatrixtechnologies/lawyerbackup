package com.portal.lawyer.admin;

import com.portal.lawyer.common.ClientIp;
import com.portal.lawyer.common.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Map;

/**
 * Admin login with a single shared password (ADMIN_PASSWORD).
 * A successful login marks the server-side session; the browser only holds the
 * HttpOnly, SameSite=Strict session cookie.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    static final String SESSION_FLAG = "admin";

    public record LoginRequest(String password) {
    }

    private final byte[] passwordHash;
    private final RateLimiter limiter = new RateLimiter(5, Duration.ofMinutes(15));

    public AdminAuthController(@Value("${app.admin.password}") String password) {
        this.passwordHash = password.isBlank() ? null : sha256(password);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest body, HttpServletRequest request) {
        if (passwordHash == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Admin password is not configured on the server (ADMIN_PASSWORD).");
        }
        limiter.check(ClientIp.of(request));

        String given = body.password() == null ? "" : body.password();
        // Hash both sides so the constant-time compare always sees equal lengths
        if (!MessageDigest.isEqual(sha256(given), passwordHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect password.");
        }

        // New session id on login (prevents session fixation)
        HttpSession old = request.getSession(false);
        if (old != null) old.invalidate();
        request.getSession(true).setAttribute(SESSION_FLAG, Boolean.TRUE);
        return Map.of("ok", true);
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return Map.of("ok", true);
    }

    /** 200 when logged in; the interceptor answers 401 otherwise. */
    @GetMapping("/session")
    public Map<String, Object> session() {
        return Map.of("ok", true);
    }

    private static byte[] sha256(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}

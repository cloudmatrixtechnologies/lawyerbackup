package com.portal.lawyer.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Small in-memory sliding-window limiter per key (client IP). Resets on restart. */
public class RateLimiter {

    private final int max;
    private final long windowMs;
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public RateLimiter(int max, Duration window) {
        this.max = max;
        this.windowMs = window.toMillis();
    }

    public void check(String key) {
        long now = System.currentTimeMillis();
        Deque<Long> times = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && now - times.peekFirst() >= windowMs) times.pollFirst();
            if (times.size() >= max) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Too many requests. Please try again later.");
            }
            times.addLast(now);
        }
    }
}

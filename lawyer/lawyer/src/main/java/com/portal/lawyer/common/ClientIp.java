package com.portal.lawyer.common;

import jakarta.servlet.http.HttpServletRequest;

public final class ClientIp {

    private ClientIp() {
    }

    /**
     * The API only listens on localhost behind the Node/Angular server, which sets
     * X-Forwarded-For. Trust that header only when the request comes from loopback.
     */
    public static String of(HttpServletRequest request) {
        String remote = request.getRemoteAddr();
        boolean fromProxy = "127.0.0.1".equals(remote) || "0:0:0:0:0:0:0:1".equals(remote) || "::1".equals(remote);
        String forwarded = request.getHeader("X-Forwarded-For");
        if (fromProxy && forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return remote;
    }
}

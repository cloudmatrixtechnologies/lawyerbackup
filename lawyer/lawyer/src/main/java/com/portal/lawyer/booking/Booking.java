package com.portal.lawyer.booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 120)
    private String email = "";

    @Column(nullable = false, length = 80)
    private String area = "";

    @Column(nullable = false, length = 2000)
    private String message = "";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.NEW;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected Booking() {
    }

    public Booking(String name, String phone, String email, String area, String message) {
        this.createdAt = Instant.now();
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.area = area;
        this.message = message;
    }

    /** Completed bookings remember when they were closed; reopening clears it. */
    public void changeStatus(BookingStatus newStatus) {
        this.status = newStatus;
        this.completedAt = newStatus == BookingStatus.COMPLETED ? Instant.now() : null;
    }

    public UUID getId() { return id; }
    public Instant getCreatedAt() { return createdAt; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getArea() { return area; }
    public String getMessage() { return message; }
    public BookingStatus getStatus() { return status; }
    public Instant getCompletedAt() { return completedAt; }
}

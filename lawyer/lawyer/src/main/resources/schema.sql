CREATE TABLE IF NOT EXISTS bookings (
    id           uuid          PRIMARY KEY,
    created_at   timestamptz   NOT NULL,
    name         varchar(100)  NOT NULL,
    phone        varchar(20)   NOT NULL,
    email        varchar(120)  NOT NULL DEFAULT '',
    area         varchar(80)   NOT NULL DEFAULT '',
    message      varchar(2000) NOT NULL DEFAULT '',
    status       varchar(20)   NOT NULL DEFAULT 'NEW'
                 CHECK (status IN ('NEW', 'CONTACTED', 'COMPLETED')),
    completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON bookings (status);

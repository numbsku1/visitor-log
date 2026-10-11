
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    host_name VARCHAR(100) NOT NULL,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_out_at TIMESTAMPTZ
);
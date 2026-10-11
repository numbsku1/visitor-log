
INSERT INTO visits (
    full_name,
    company,
    host_name,
    checked_in_at,
    checked_out_at
)
VALUES
    (
        'Maria Santos',
        'ABC Solutions',
        'John Reyes',
        NOW() - INTERVAL '15 minutes',
        NULL
    ),
    (
        'James Wilson',
        'TechStart Inc.',
        'Anna Cruz',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '30 minutes'
    ),
    (
        'Joanne Garcia',
        NULL,
        'Mark Dela Cruz',
        NOW() - INTERVAL '2 hours',
        NULL
    ),
    (
        'Daniel Smith',
        'Global Systems',
        'Sarah Lim',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours'
    );
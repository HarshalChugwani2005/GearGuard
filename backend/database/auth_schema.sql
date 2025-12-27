-- Users and Authentication Tables

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- viewer, technician, admin
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task assignments for admin
CREATE TABLE IF NOT EXISTS task_assignments (
    id SERIAL PRIMARY KEY,
    maintenance_request_id INTEGER REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    assigned_to_user_id INTEGER REFERENCES users(id),
    assigned_by_user_id INTEGER REFERENCES users(id),
    department VARCHAR(100),
    due_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment failure log for reporting
CREATE TABLE IF NOT EXISTS equipment_failures (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id),
    failure_date TIMESTAMP NOT NULL,
    failure_type VARCHAR(100),
    downtime_hours DECIMAL(10, 2),
    resolved_by_user_id INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON task_assignments(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_failures_date ON equipment_failures(failure_date);
CREATE INDEX IF NOT EXISTS idx_equipment_failures_equipment ON equipment_failures(equipment_id);

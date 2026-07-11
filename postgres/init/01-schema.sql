-- ============================================================================
-- MARIA Medical Center Database Schema
-- PostgreSQL 16 init script
-- Auto-runs on first container startup
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    service_type VARCHAR(100) NOT NULL,
    preferred_date DATE,
    preferred_time TIME,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(preferred_date);

-- ============================================================================
-- PATIENT REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_name VARCHAR(255) NOT NULL,
    age INT,
    service VARCHAR(100) NOT NULL,
    review_text TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_published ON reviews(is_published);

-- ============================================================================
-- CONTACT MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contact_unread ON contact_messages(is_read);

-- ============================================================================
-- PATIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    date_of_birth DATE,
    medical_history TEXT,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_patients_phone ON patients(phone);

-- ============================================================================
-- MEDICAL SERVICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price_uah DECIMAL(10,2),
    duration_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default services
INSERT INTO services (name, slug, description, price_uah, duration_minutes) VALUES
('Консультация хирурга-онколога', 'consultation-surgery', 'Профессорская консультация с осмотром', 2000.00, 60),
('Лапароскопическая холецистэктомия', 'laparoscopic-cholecystectomy', 'Удаление желчного пузыря лапароскопически', 45000.00, 90),
('Лапароскопическая герниопластика', 'laparoscopic-hernia', 'Удаление грыжи через проколы', 35000.00, 90),
('Миомэктомия', 'myomectomy', 'Удаление миомы с сохранением матки', 55000.00, 120),
('Онко-диагностика', 'onco-diagnostics', 'Комплексное онкологическое обследование', 8000.00, 120),
('Профосмотр', 'checkup', 'Комплексный медицинский осмотр', 3000.00, 60)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- UPDATE TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to tables
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CREATE READ-ONLY USER FOR APPLICATIONS
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ssvnauka_app') THEN
        CREATE USER ssvnauka_app WITH PASSWORD 'app_password_change_me';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE ssvnauka TO ssvnauka_app;
GRANT USAGE ON SCHEMA public TO ssvnauka_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO ssvnauka_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ssvnauka_app;

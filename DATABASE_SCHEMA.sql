-- ================================================================
-- AutoSaaz Database Schema
-- ================================================================
-- Purpose: Comprehensive database schema for AutoSaaz platform
-- Components: Garage Client, Admin Dashboard, Mobile App
-- Database: PostgreSQL (Supabase)
-- Version: 1.0
-- Date: 2025-10-16
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- ENUMS
-- ================================================================

-- User role types
CREATE TYPE user_role AS ENUM ('admin', 'garage_owner', 'garage_manager', 'garage_technician', 'customer');

-- User account status
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- Verification status
CREATE TYPE verification_status AS ENUM ('verified', 'pending', 'failed');

-- Appointment/Booking status
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Inspection status
CREATE TYPE inspection_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed', 'cancelled');

-- Dispute status
CREATE TYPE dispute_status AS ENUM ('new', 'in_review', 'resolved', 'closed', 'escalated');

-- Message sender type
CREATE TYPE message_sender_type AS ENUM ('customer', 'garage', 'admin', 'system');

-- Service category
CREATE TYPE service_category AS ENUM (
    'engine',
    'transmission',
    'brakes',
    'suspension',
    'electrical',
    'air_conditioning',
    'diagnostics',
    'oil_change',
    'tires',
    'battery',
    'exhaust',
    'cooling_system',
    'fuel_system',
    'general_maintenance',
    'body_work',
    'detailing',
    'other'
);

-- Priority level
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- ================================================================
-- CORE TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- Users Table (Shared across all platforms)
-- ----------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL, -- Format: +971XXXXXXXXX
    password_hash TEXT NOT NULL,
    
    -- Role & Status
    role user_role NOT NULL DEFAULT 'customer',
    account_status account_status NOT NULL DEFAULT 'pending_verification',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Verification
    email_verification_code VARCHAR(10),
    phone_verification_code VARCHAR(10),
    verification_code_expires_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Password Reset
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    
    -- Indexes
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone_number ~* '^\+971[0-9]{9}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(account_status);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------
-- Garages Table
-- ----------------------------------------------------------------
CREATE TABLE garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Owner (references users table)
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Business Details
    company_legal_name VARCHAR(255) NOT NULL,
    trade_license_number VARCHAR(100) UNIQUE NOT NULL,
    vat_certification VARCHAR(100),
    emirates_id_url TEXT, -- File storage URL
    
    -- Location
    address TEXT NOT NULL,
    street VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL, -- UAE Emirate
    location VARCHAR(255), -- Additional location info
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    
    -- Operating Hours (JSON format)
    operating_hours JSONB, -- {"monday": {"open": "09:00", "close": "18:00"}, ...}
    
    -- Status
    verification_status verification_status DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    is_accepting_bookings BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_garages_owner ON garages(owner_id);
CREATE INDEX idx_garages_status ON garages(verification_status);
CREATE INDEX idx_garages_state ON garages(state);
CREATE INDEX idx_garages_location ON garages(latitude, longitude);

-- ----------------------------------------------------------------
-- Garage Staff Table (Technicians/Mechanics)
-- ----------------------------------------------------------------
CREATE TABLE garage_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Staff Details
    position VARCHAR(100), -- 'Senior Technician', 'Mechanic', 'Manager', etc.
    specialization TEXT[], -- Array of specializations
    employee_id VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    hired_at DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(garage_id, user_id)
);

CREATE INDEX idx_garage_staff_garage ON garage_staff(garage_id);
CREATE INDEX idx_garage_staff_user ON garage_staff(user_id);

-- ----------------------------------------------------------------
-- Customers Table (Mobile App Users)
-- ----------------------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Profile
    profile_image_url TEXT,
    date_of_birth DATE,
    
    -- Address
    address TEXT,
    emirate VARCHAR(100),
    
    -- Preferences
    preferred_language VARCHAR(10) DEFAULT 'en', -- 'en', 'ar'
    notification_preferences JSONB, -- Email, SMS, Push settings
    
    -- Loyalty/Points
    loyalty_points INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_user ON customers(user_id);

-- ----------------------------------------------------------------
-- Vehicles Table
-- ----------------------------------------------------------------
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Owner
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Vehicle Details
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(50),
    license_plate VARCHAR(50),
    vin VARCHAR(17), -- Vehicle Identification Number
    
    -- Additional Info
    mileage INTEGER,
    fuel_type VARCHAR(50), -- Petrol, Diesel, Electric, Hybrid
    transmission VARCHAR(50), -- Automatic, Manual
    
    -- Status
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_year_valid CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1)
);

CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_license ON vehicles(license_plate);

-- ----------------------------------------------------------------
-- Services Table (Garage-specific services)
-- ----------------------------------------------------------------
CREATE TABLE garage_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    
    -- Service Details
    service_name VARCHAR(255) NOT NULL,
    service_category service_category NOT NULL,
    description TEXT,
    
    -- Pricing
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    price_unit VARCHAR(20) DEFAULT 'AED',
    
    -- Time Estimate
    min_duration_hours DECIMAL(4, 2),
    max_duration_hours DECIMAL(4, 2),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_garage_services_garage ON garage_services(garage_id);
CREATE INDEX idx_garage_services_category ON garage_services(service_category);

-- ================================================================
-- BOOKING & APPOINTMENT TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- Appointments/Bookings Table
-- ----------------------------------------------------------------
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES garage_services(id) ON DELETE SET NULL,
    assigned_technician_id UUID REFERENCES garage_staff(id) ON DELETE SET NULL,
    
    -- Appointment Details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL, -- Combined datetime
    service_type VARCHAR(255) NOT NULL, -- Free text or from service_id
    service_description TEXT,
    
    -- Status & Priority
    status appointment_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    
    -- Customer Info (denormalized for convenience)
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    
    -- Vehicle Info (denormalized)
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    vehicle_license_plate VARCHAR(50),
    
    -- Notes
    customer_notes TEXT,
    garage_notes TEXT,
    
    -- Completion
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_garage ON appointments(garage_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);
CREATE INDEX idx_appointments_technician ON appointments(assigned_technician_id);
CREATE INDEX idx_appointments_deleted ON appointments(deleted_at) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------
-- Inspections Table
-- ----------------------------------------------------------------
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    assigned_technician_id UUID REFERENCES garage_staff(id) ON DELETE SET NULL,
    
    -- Inspection Details
    inspection_date DATE NOT NULL,
    inspection_time TIME NOT NULL,
    status inspection_status DEFAULT 'pending',
    
    -- Customer & Vehicle Info (denormalized)
    customer_name VARCHAR(255) NOT NULL,
    vehicle_info VARCHAR(255) NOT NULL, -- "Make Model Year"
    
    -- Inspection Tasks (array of tasks)
    tasks TEXT[], -- ["Check engine light diagnostics", "Oil level inspection", ...]
    
    -- Results
    findings TEXT,
    recommendations TEXT,
    issues_found JSONB, -- Structured issues data
    
    -- Completion
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES garage_staff(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inspections_appointment ON inspections(appointment_id);
CREATE INDEX idx_inspections_vehicle ON inspections(vehicle_id);
CREATE INDEX idx_inspections_garage ON inspections(garage_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);

-- ================================================================
-- PAYMENT & BILLING TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- Invoices Table
-- ----------------------------------------------------------------
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    
    -- Invoice Details
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment
    payment_status payment_status DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_garage ON invoices(garage_id);
CREATE INDEX idx_invoices_status ON invoices(payment_status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- ----------------------------------------------------------------
-- Invoice Line Items Table
-- ----------------------------------------------------------------
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Item Details
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ----------------------------------------------------------------
-- Payments Table
-- ----------------------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    
    -- Payment Details
    payment_method VARCHAR(50), -- 'card', 'cash', 'bank_transfer', 'wallet'
    payment_provider VARCHAR(50), -- 'stripe', 'paypal', etc.
    transaction_id VARCHAR(255) UNIQUE,
    
    -- Amount
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    
    -- Status
    status payment_status DEFAULT 'pending',
    
    -- Payment Gateway Response
    gateway_response JSONB,
    
    -- Metadata
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- ================================================================
-- COMMUNICATION TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- Chats Table (Conversation threads)
-- ----------------------------------------------------------------
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Participants
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    garage_id UUID REFERENCES garages(id) ON DELETE CASCADE,
    
    -- Related to
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Chat Info
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count_customer INTEGER DEFAULT 0,
    unread_count_garage INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chats_customer ON chats(customer_id);
CREATE INDEX idx_chats_garage ON chats(garage_id);
CREATE INDEX idx_chats_appointment ON chats(appointment_id);
CREATE INDEX idx_chats_last_message ON chats(last_message_at DESC);

-- ----------------------------------------------------------------
-- Messages Table
-- ----------------------------------------------------------------
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    
    -- Sender
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_type message_sender_type NOT NULL,
    
    -- Message Content
    message_text TEXT NOT NULL,
    attachments JSONB, -- Array of file URLs
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ================================================================
-- DISPUTE & RESOLUTION TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- Disputes Table (Resolution Center)
-- ----------------------------------------------------------------
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    -- Dispute Details
    dispute_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., DISP-1045
    order_id VARCHAR(50), -- External order reference
    
    -- Reason & Description
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    dispute_category VARCHAR(100), -- 'payment', 'service_quality', 'no_show', etc.
    
    -- Status
    status dispute_status DEFAULT 'new',
    priority priority_level DEFAULT 'normal',
    
    -- Resolution
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Customer Info (denormalized)
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Garage Info (denormalized)
    garage_name VARCHAR(255),
    mechanic_name VARCHAR(255),
    
    -- Metadata
    raised_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_customer ON disputes(customer_id);
CREATE INDEX idx_disputes_garage ON disputes(garage_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_code ON disputes(dispute_code);
CREATE INDEX idx_disputes_raised ON disputes(raised_at DESC);

-- ----------------------------------------------------------------
-- Dispute Messages Table
-- ----------------------------------------------------------------
CREATE TABLE dispute_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    
    -- Sender
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_type message_sender_type NOT NULL,
    
    -- Message
    message_text TEXT NOT NULL,
    attachments JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dispute_messages_dispute ON dispute_messages(dispute_id);
CREATE INDEX idx_dispute_messages_created ON dispute_messages(created_at);

-- ================================================================
-- NOTIFICATION & SYSTEM TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- Notifications Table
-- ----------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipient
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Details
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50), -- 'appointment', 'payment', 'message', 'system'
    
    -- Related Entity
    related_entity_type VARCHAR(50), -- 'appointment', 'invoice', 'dispute', etc.
    related_entity_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_channel VARCHAR(20), -- 'push', 'email', 'sms', 'in_app'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ----------------------------------------------------------------
-- Refresh Tokens Table (JWT)
-- ----------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token
    token TEXT NOT NULL UNIQUE,
    
    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Revocation
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Device Info
    device_info JSONB, -- User agent, IP, etc.
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expires_at);

-- ----------------------------------------------------------------
-- Audit Log Table
-- ----------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role user_role,
    
    -- Action
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'appointment', 'user', 'garage', etc.
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Request Info
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ================================================================
-- VIEWS
-- ================================================================

-- ----------------------------------------------------------------
-- View: Active Appointments for Garages
-- ----------------------------------------------------------------
CREATE VIEW v_garage_active_appointments AS
SELECT 
    a.id,
    a.appointment_datetime,
    a.status,
    a.priority,
    a.customer_name,
    a.customer_phone,
    a.vehicle_make,
    a.vehicle_model,
    a.service_type,
    g.company_legal_name AS garage_name,
    u.full_name AS technician_name
FROM appointments a
JOIN garages g ON a.garage_id = g.id
LEFT JOIN garage_staff gs ON a.assigned_technician_id = gs.id
LEFT JOIN users u ON gs.user_id = u.id
WHERE a.status IN ('pending', 'confirmed', 'in_progress')
    AND a.appointment_datetime >= CURRENT_DATE
ORDER BY a.appointment_datetime;

-- ----------------------------------------------------------------
-- View: Customer Booking History
-- ----------------------------------------------------------------
CREATE VIEW v_customer_booking_history AS
SELECT 
    a.id,
    a.appointment_datetime,
    a.status,
    a.service_type,
    g.company_legal_name AS garage_name,
    g.address AS garage_address,
    a.vehicle_make || ' ' || a.vehicle_model AS vehicle,
    i.invoice_number,
    i.total_amount,
    i.payment_status
FROM appointments a
JOIN garages g ON a.garage_id = g.id
LEFT JOIN invoices i ON a.id = i.appointment_id
ORDER BY a.appointment_datetime DESC;

-- ----------------------------------------------------------------
-- View: Garage Dashboard Statistics
-- ----------------------------------------------------------------
CREATE VIEW v_garage_dashboard_stats AS
SELECT 
    g.id AS garage_id,
    g.company_legal_name,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'pending') AS pending_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'confirmed') AS confirmed_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS completed_appointments,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'pending') AS pending_inspections,
    COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('new', 'in_review')) AS open_disputes,
    SUM(inv.total_amount) FILTER (WHERE inv.payment_status = 'paid' AND inv.invoice_date >= CURRENT_DATE - INTERVAL '30 days') AS revenue_last_30_days
FROM garages g
LEFT JOIN appointments a ON g.id = a.garage_id AND a.deleted_at IS NULL
LEFT JOIN inspections i ON g.id = i.garage_id
LEFT JOIN disputes d ON g.id = d.garage_id
LEFT JOIN invoices inv ON g.id = inv.garage_id
GROUP BY g.id, g.company_legal_name;

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- ----------------------------------------------------------------
-- Function: Update updated_at timestamp
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garages_updated_at BEFORE UPDATE ON garages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garage_services_updated_at BEFORE UPDATE ON garage_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------
-- Function: Generate dispute code
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_dispute_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.dispute_code IS NULL OR NEW.dispute_code = '' THEN
        NEW.dispute_code := 'DISP-' || LPAD(nextval('disputes_code_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE disputes_code_seq START 1000;

CREATE TRIGGER generate_dispute_code_trigger BEFORE INSERT ON disputes
    FOR EACH ROW EXECUTE FUNCTION generate_dispute_code();

-- ----------------------------------------------------------------
-- Function: Generate invoice number
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('invoices_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE invoices_number_seq START 1;

CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ================================================================
-- SAMPLE DATA (for testing)
-- ================================================================

-- Note: Sample data should match the patterns in your mock files
-- This section is optional but useful for initial testing

-- Example: Insert admin user
INSERT INTO users (full_name, email, phone_number, password_hash, role, account_status, is_email_verified, is_phone_verified)
VALUES ('Admin User', 'admin@autosaaz.com', '+971501234567', '$2b$10$examplehash', 'admin', 'active', true, true);

-- ================================================================
-- ROW LEVEL SECURITY (Optional - for Supabase)
-- ================================================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Example policies (customize based on your needs)
-- Garages can only see their own appointments
CREATE POLICY garage_appointments_policy ON appointments
    FOR SELECT
    USING (garage_id IN (
        SELECT id FROM garages WHERE owner_id = auth.uid()
    ));

-- Customers can only see their own appointments
CREATE POLICY customer_appointments_policy ON appointments
    FOR SELECT
    USING (customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    ));

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Composite indexes for common queries
CREATE INDEX idx_appointments_garage_date_status ON appointments(garage_id, appointment_date, status);
CREATE INDEX idx_appointments_customer_date ON appointments(customer_id, appointment_date DESC);
CREATE INDEX idx_inspections_garage_date ON inspections(garage_id, inspection_date);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_payments_garage_date ON payments(garage_id, payment_date DESC);

-- Full-text search indexes (optional, for search functionality)
CREATE INDEX idx_garages_name_search ON garages USING gin(to_tsvector('english', company_legal_name));
CREATE INDEX idx_users_name_search ON users USING gin(to_tsvector('english', full_name));

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE users IS 'Core users table for all platform users (admin, garage owners, customers)';
COMMENT ON TABLE garages IS 'Garage/workshop business information and registration data';
COMMENT ON TABLE appointments IS 'Customer service appointment bookings with garages';
COMMENT ON TABLE inspections IS 'Vehicle inspection records and results';
COMMENT ON TABLE disputes IS 'Customer disputes and resolution center cases';
COMMENT ON TABLE garage_services IS 'Services offered by each garage with pricing and duration';

-- ================================================================
-- END OF SCHEMA
-- ================================================================

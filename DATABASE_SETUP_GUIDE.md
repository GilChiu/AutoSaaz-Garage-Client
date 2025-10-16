# AutoSaaz Database Setup Guide

## 📋 Overview

This guide provides instructions for setting up the AutoSaaz database schema on PostgreSQL (Supabase). The schema is designed to support:

- **Garage Client** (Web Dashboard)
- **Admin Dashboard** (Management Portal)
- **Mobile App** (Customer Application)

---

## 🗄️ Database Structure

### Core Entities

1. **Users** - Central user authentication and profile management
2. **Garages** - Garage/workshop business registration and details
3. **Customers** - Mobile app users (vehicle owners)
4. **Garage Staff** - Technicians, mechanics, and garage employees
5. **Vehicles** - Customer vehicle information
6. **Garage Services** - Services offered by each garage

### Operational Entities

7. **Appointments** - Customer service bookings
8. **Inspections** - Vehicle inspection records
9. **Invoices & Payments** - Billing and payment processing
10. **Chats & Messages** - Customer-garage communication
11. **Disputes** - Resolution center cases

### System Entities

12. **Notifications** - Push notifications and alerts
13. **Refresh Tokens** - JWT token management
14. **Audit Logs** - System activity tracking

---

## 🚀 Setup Instructions

### Prerequisites

- PostgreSQL 14+ or Supabase account
- Database admin access
- SQL client (pgAdmin, DBeaver, or Supabase dashboard)

### Step 1: Create Database

If using self-hosted PostgreSQL:

```bash
createdb autosaaz_db
```

If using Supabase:
- Your database is automatically created with your project
- Use the Supabase SQL Editor

### Step 2: Run Schema

Execute the `DATABASE_SCHEMA.sql` file:

**Using psql:**
```bash
psql -U your_username -d autosaaz_db -f DATABASE_SCHEMA.sql
```

**Using Supabase:**
1. Go to SQL Editor in Supabase Dashboard
2. Create a new query
3. Copy and paste the entire `DATABASE_SCHEMA.sql` content
4. Click "Run"

### Step 3: Verify Installation

Check that all tables are created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- appointments
- audit_logs
- chats
- customers
- disputes
- dispute_messages
- garage_services
- garage_staff
- garages
- inspections
- invoices
- invoice_items
- messages
- notifications
- payments
- refresh_tokens
- users
- vehicles

### Step 4: Verify Views

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
```

Expected views:
- v_garage_active_appointments
- v_customer_booking_history
- v_garage_dashboard_stats

---

## 📊 Schema Highlights

### User Management

**Users Table:**
- Supports multiple roles: `admin`, `garage_owner`, `garage_manager`, `garage_technician`, `customer`
- Email and phone verification with OTP codes
- Password reset functionality
- Account locking after failed login attempts
- Soft delete support

**Garages Table:**
- Owner linked to users table
- Business details: trade license, VAT certification, Emirates ID
- Location with coordinates (latitude/longitude)
- Operating hours stored as JSONB
- Verification status tracking

### Booking System

**Appointments Table:**
- Customer, garage, vehicle, and service references
- Status tracking: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`
- Priority levels: `low`, `normal`, `high`, `urgent`
- Denormalized customer and vehicle info for performance
- Assigned technician tracking

**Inspections Table:**
- Linked to appointments
- Task lists stored as array
- Findings and recommendations
- Completion tracking with technician assignment

### Payment Processing

**Invoices Table:**
- Auto-generated invoice numbers (format: `INV-YYYYMMDD-####`)
- Subtotal, tax, discount, and total calculations
- Payment status tracking

**Payments Table:**
- Multiple payment methods supported
- Integration with payment gateways
- Transaction ID tracking
- Gateway response stored as JSONB

### Communication

**Chats & Messages:**
- One-to-one chat between customer and garage
- Unread count tracking for both parties
- Message attachments support
- Read receipts

**Disputes:**
- Auto-generated dispute codes (format: `DISP-####`)
- Status tracking: `new`, `in_review`, `resolved`, `closed`, `escalated`
- Resolution notes and timestamps
- Message threads for each dispute

---

## 🔐 Security Features

### Row Level Security (RLS)

The schema includes RLS policies for Supabase:

- **Garages** can only access their own appointments and data
- **Customers** can only view their own bookings and vehicles
- **Admin** users have full access (implement in policies)

### Audit Logging

All critical operations are logged in `audit_logs` table:
- User actions (create, update, delete)
- IP address and user agent tracking
- Before/after values for updates

### Password Security

- Passwords stored as bcrypt hashes
- Password reset tokens with expiry
- Account locking after 5 failed attempts

---

## 📱 Platform-Specific Notes

### Garage Client (Web Dashboard)

**Primary Tables:**
- `garages` - Business profile
- `appointments` - Manage customer bookings
- `inspections` - Track vehicle inspections
- `garage_services` - Manage service offerings
- `garage_staff` - Manage technicians
- `disputes` - Resolution center
- `chats` - Customer communication

**Key Views:**
- `v_garage_active_appointments` - Dashboard overview
- `v_garage_dashboard_stats` - Statistics and metrics

### Mobile App (Customers)

**Primary Tables:**
- `customers` - Customer profiles
- `vehicles` - Customer vehicles
- `appointments` - Book services
- `invoices` - View billing
- `payments` - Make payments
- `chats` - Contact garages

**Key Views:**
- `v_customer_booking_history` - Past bookings

### Admin Dashboard

**Primary Tables:**
- `users` - User management
- `garages` - Verify and manage garages
- `disputes` - Resolution center oversight
- `audit_logs` - System monitoring
- All other tables (full access)

---

## 🔄 Sample Queries

### Get Pending Appointments for a Garage

```sql
SELECT 
    a.id,
    a.customer_name,
    a.customer_phone,
    a.appointment_datetime,
    a.service_type,
    a.vehicle_make || ' ' || a.vehicle_model AS vehicle,
    u.full_name AS technician
FROM appointments a
LEFT JOIN garage_staff gs ON a.assigned_technician_id = gs.id
LEFT JOIN users u ON gs.user_id = u.id
WHERE a.garage_id = 'your-garage-uuid'
    AND a.status = 'pending'
ORDER BY a.appointment_datetime;
```

### Get Customer Booking History

```sql
SELECT * FROM v_customer_booking_history
WHERE customer_id = 'your-customer-uuid'
LIMIT 20;
```

### Get Open Disputes

```sql
SELECT 
    d.dispute_code,
    d.customer_name,
    d.reason,
    d.status,
    d.raised_at,
    COUNT(dm.id) AS message_count
FROM disputes d
LEFT JOIN dispute_messages dm ON d.id = dm.dispute_id
WHERE d.garage_id = 'your-garage-uuid'
    AND d.status IN ('new', 'in_review')
GROUP BY d.id
ORDER BY d.raised_at DESC;
```

### Get Garage Revenue

```sql
SELECT 
    g.company_legal_name,
    COUNT(DISTINCT a.id) AS total_appointments,
    SUM(inv.total_amount) FILTER (WHERE inv.payment_status = 'paid') AS total_revenue,
    SUM(inv.total_amount) FILTER (WHERE inv.payment_status = 'pending') AS pending_revenue
FROM garages g
LEFT JOIN appointments a ON g.id = a.garage_id
LEFT JOIN invoices inv ON a.id = inv.appointment_id
WHERE g.id = 'your-garage-uuid'
    AND a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY g.id, g.company_legal_name;
```

---

## 🌱 Sample Data Population

### Create Test Users

```sql
-- Admin User
INSERT INTO users (full_name, email, phone_number, password_hash, role, account_status, is_email_verified, is_phone_verified)
VALUES ('System Admin', 'admin@autosaaz.com', '+971501234567', '$2b$10$examplehash', 'admin', 'active', true, true);

-- Garage Owner
INSERT INTO users (full_name, email, phone_number, password_hash, role, account_status, is_email_verified, is_phone_verified)
VALUES ('Ahmed Garage Owner', 'ahmed@aaagarage.ae', '+971501234568', '$2b$10$examplehash', 'garage_owner', 'active', true, true);

-- Customer
INSERT INTO users (full_name, email, phone_number, password_hash, role, account_status, is_email_verified, is_phone_verified)
VALUES ('Ali Khan', 'ali.khan@email.com', '+971501234569', '$2b$10$examplehash', 'customer', 'active', true, true);
```

### Create Test Garage

```sql
INSERT INTO garages (owner_id, company_legal_name, trade_license_number, address, street, state, location, latitude, longitude, verification_status, is_active)
VALUES (
    (SELECT id FROM users WHERE email = 'ahmed@aaagarage.ae'),
    'AAA Auto Garage',
    'TL-123456789',
    'Industrial Area 1',
    'Street 15',
    'Dubai',
    'Near Emirates Mall',
    25.1186,
    55.2003,
    'verified',
    true
);
```

### Create Test Services

```sql
INSERT INTO garage_services (garage_id, service_name, service_category, description, min_price, max_price, min_duration_hours, max_duration_hours)
VALUES 
    ((SELECT id FROM garages WHERE company_legal_name = 'AAA Auto Garage'), 'Oil Change', 'oil_change', 'Full synthetic oil change service', 150.00, 300.00, 0.5, 1.0),
    ((SELECT id FROM garages WHERE company_legal_name = 'AAA Auto Garage'), 'AC Repair', 'air_conditioning', 'AC system diagnostics and repair', 300.00, 700.00, 2.0, 4.0),
    ((SELECT id FROM garages WHERE company_legal_name = 'AAA Auto Garage'), 'Brake Pad Replacement', 'brakes', 'Replace worn brake pads', 400.00, 800.00, 1.5, 3.0);
```

---

## 🔧 Maintenance

### Backup Database

**PostgreSQL:**
```bash
pg_dump -U your_username autosaaz_db > backup_$(date +%Y%m%d).sql
```

**Supabase:**
Use Supabase's automatic backups or export via Dashboard

### Monitor Performance

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Update Statistics

```sql
ANALYZE;
VACUUM ANALYZE;
```

---

## 📈 Scaling Considerations

### Indexes

The schema includes comprehensive indexes for common queries. Monitor query performance and add additional indexes as needed:

```sql
-- Example: Add index for frequently filtered columns
CREATE INDEX idx_appointments_service_type ON appointments(service_type);
```

### Partitioning

For high-volume tables (appointments, messages, audit_logs), consider partitioning by date:

```sql
-- Example: Partition appointments by month
CREATE TABLE appointments_2025_01 PARTITION OF appointments
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### Caching

Consider implementing Redis caching for:
- Active appointments
- Garage dashboard statistics
- User sessions
- Frequently accessed garage/customer profiles

---

## 🐛 Troubleshooting

### Common Issues

**Issue: UUID extension not available**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Issue: RLS blocking queries**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

**Issue: Sequence already exists**
```sql
-- Drop and recreate sequence
DROP SEQUENCE IF EXISTS disputes_code_seq CASCADE;
CREATE SEQUENCE disputes_code_seq START 1000;
```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)

---

## 📝 Migration Notes

If you need to migrate from an existing database:

1. Export existing data
2. Run new schema
3. Create data migration scripts
4. Test thoroughly in staging
5. Schedule maintenance window
6. Execute migration
7. Verify data integrity

---

## 🤝 Contributing

When modifying the schema:

1. Create a new migration file (don't modify `DATABASE_SCHEMA.sql`)
2. Document all changes
3. Update this guide
4. Test migrations in development
5. Review with team before production deployment

---

## 📞 Support

For questions or issues:
- Technical Lead: [Your Contact]
- Database Admin: [Your Contact]
- Documentation: [Wiki/Confluence Link]

---

**Last Updated:** October 16, 2025  
**Schema Version:** 1.0  
**Maintained By:** AutoSaaz Development Team

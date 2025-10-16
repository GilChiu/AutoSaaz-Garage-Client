# AutoSaaz Database Entity-Relationship Diagram

## 📊 Database Relationships Overview

This document provides a visual representation of the database schema relationships.

---

## 🎯 Core Entity Relationships

### User Management Domain

```
┌─────────────┐
│    USERS    │ (Central hub for all users)
│  (UUID)     │
├─────────────┤
│ • email     │
│ • phone     │
│ • role      │ ◄─── enum: admin, garage_owner, garage_manager, 
│ • status    │              garage_technician, customer
└─────┬───────┘
      │
      │ 1:N (based on role)
      │
   ┌──┴──────────────────────┬────────────────────┐
   │                         │                    │
   ▼                         ▼                    ▼
┌──────────┐          ┌──────────┐         ┌──────────┐
│ GARAGES  │          │CUSTOMERS │         │  GARAGE  │
│          │          │          │         │  STAFF   │
│ owner_id ├─1:1────▶ │ user_id  ├─1:1───▶ │ user_id  │
│          │          │          │         │ garage_id│
└────┬─────┘          └────┬─────┘         └────┬─────┘
     │                     │                     │
     └─────────┬───────────┴──────────┬──────────┘
               │                      │
               │                      │
               ▼                      ▼
         [Many-to-Many through various entities]
```

---

## 🚗 Vehicle & Customer Domain

```
┌──────────────┐
│  CUSTOMERS   │
│   (UUID)     │
├──────────────┤
│ • user_id FK │
│ • profile    │
│ • loyalty    │
└──────┬───────┘
       │
       │ 1:N (A customer can own multiple vehicles)
       │
       ▼
┌──────────────┐
│  VEHICLES    │
│   (UUID)     │
├──────────────┤
│ • customer_id│ FK ──┐
│ • make       │      │
│ • model      │      │
│ • year       │      │
│ • license    │      │
└──────────────┘      │
                      │
                      │ Used in appointments & inspections
                      │
                      ▼
            [Referenced by appointments]
```

---

## 📅 Booking & Appointment Domain

```
┌─────────────────────────────────────────────────────────────┐
│                    APPOINTMENTS                              │
│                      (UUID)                                  │
├─────────────────────────────────────────────────────────────┤
│ • customer_id      FK ──────────┐                           │
│ • garage_id        FK ────────┐ │                           │
│ • vehicle_id       FK ──────┐ │ │                           │
│ • service_id       FK ────┐ │ │ │                           │
│ • assigned_tech_id FK ──┐ │ │ │ │                           │
│ • status           ENUM │ │ │ │ │                           │
│ • priority         ENUM │ │ │ │ │                           │
└───────┬─────────────────┼─┼─┼─┼─┼───────────────────────────┘
        │                 │ │ │ │ │
        │                 │ │ │ │ │
        │                 │ │ │ │ └────────┐
        │                 │ │ │ │          │
        │                 │ │ │ └────────┐ │
        │                 │ │ │          ▼ ▼
        │                 │ │ │    ┌──────────────┐
        │                 │ │ │    │   GARAGES    │
        │                 │ │ │    │    (UUID)    │
        │                 │ │ │    └──────────────┘
        │                 │ │ │
        │                 │ │ └─────────┐
        │                 │ │           ▼
        │                 │ │     ┌──────────────┐
        │                 │ │     │  CUSTOMERS   │
        │                 │ │     │   (UUID)     │
        │                 │ │     └──────────────┘
        │                 │ │
        │                 │ └───────────┐
        │                 │             ▼
        │                 │       ┌──────────────┐
        │                 │       │  VEHICLES    │
        │                 │       │   (UUID)     │
        │                 │       └──────────────┘
        │                 │
        │                 └─────────────┐
        │                               ▼
        │                         ┌─────────────────┐
        │                         │ GARAGE_SERVICES │
        │                         │     (UUID)      │
        │                         │  • service_name │
        │                         │  • category     │
        │                         │  • price_range  │
        │                         └─────────────────┘
        │
        │ 1:1 (Optional)
        │
        ▼
┌──────────────────┐
│  INSPECTIONS     │
│    (UUID)        │
├──────────────────┤
│ • appointment_id │ FK (Optional)
│ • vehicle_id     │ FK
│ • garage_id      │ FK
│ • tasks[]        │ Array
│ • findings       │ Text
│ • status         │ ENUM
└──────────────────┘
```

---

## 💰 Payment & Billing Domain

```
┌──────────────────┐
│  APPOINTMENTS    │
│     (UUID)       │
└────────┬─────────┘
         │
         │ 1:1 (One appointment → One invoice)
         │
         ▼
┌──────────────────┐
│    INVOICES      │
│     (UUID)       │
├──────────────────┤
│ • appointment_id │ FK (Optional)
│ • customer_id    │ FK
│ • garage_id      │ FK
│ • invoice_number │ Unique auto-generated
│ • subtotal       │
│ • tax_amount     │
│ • total_amount   │
│ • payment_status │ ENUM
└────────┬─────────┘
         │
         │ 1:N (One invoice → Multiple line items)
         │
         ▼
┌──────────────────┐
│  INVOICE_ITEMS   │
│     (UUID)       │
├──────────────────┤
│ • invoice_id     │ FK
│ • description    │
│ • quantity       │
│ • unit_price     │
│ • total_price    │
└──────────────────┘

         │
         │ 1:N (One invoice → Multiple payments if partial)
         │
         ▼
┌──────────────────┐
│    PAYMENTS      │
│     (UUID)       │
├──────────────────┤
│ • invoice_id     │ FK
│ • customer_id    │ FK
│ • garage_id      │ FK
│ • amount         │
│ • payment_method │
│ • transaction_id │
│ • status         │ ENUM
└──────────────────┘
```

---

## 💬 Communication Domain

```
┌──────────────────┐
│   CUSTOMERS      │
│     (UUID)       │
└────────┬─────────┘
         │
         │ N:N (via CHATS)
         │
         ▼
┌──────────────────┐
│     CHATS        │
│     (UUID)       │
├──────────────────┤
│ • customer_id    │ FK
│ • garage_id      │ FK
│ • appointment_id │ FK (Optional)
│ • last_message   │
│ • unread_count   │
└────────┬─────────┘
         │
         │ 1:N (One chat → Many messages)
         │
         ▼
┌──────────────────┐
│    MESSAGES      │
│     (UUID)       │
├──────────────────┤
│ • chat_id        │ FK
│ • sender_id      │ FK → users
│ • sender_type    │ ENUM
│ • message_text   │
│ • is_read        │
│ • created_at     │
└──────────────────┘
         │
         │
         ▼
┌──────────────────┐
│    GARAGES       │
│     (UUID)       │
└──────────────────┘
```

---

## 🔧 Resolution Center Domain

```
┌──────────────────┐
│  APPOINTMENTS    │
│     (UUID)       │
└────────┬─────────┘
         │
         │ 1:1 (Optional - a dispute may relate to appointment)
         │
         ▼
┌──────────────────┐
│    DISPUTES      │
│     (UUID)       │
├──────────────────┤
│ • appointment_id │ FK (Optional)
│ • customer_id    │ FK
│ • garage_id      │ FK
│ • invoice_id     │ FK (Optional)
│ • dispute_code   │ Unique auto-generated
│ • reason         │
│ • status         │ ENUM
│ • resolution     │
│ • resolved_by    │ FK → users
└────────┬─────────┘
         │
         │ 1:N (One dispute → Many messages)
         │
         ▼
┌──────────────────┐
│ DISPUTE_MESSAGES │
│     (UUID)       │
├──────────────────┤
│ • dispute_id     │ FK
│ • sender_id      │ FK → users
│ • sender_type    │ ENUM
│ • message_text   │
│ • created_at     │
└──────────────────┘
```

---

## 🔔 Notification & System Domain

```
┌──────────────────┐
│     USERS        │
│     (UUID)       │
└────────┬─────────┘
         │
         │ 1:N (One user → Many notifications)
         │
         ▼
┌──────────────────────────┐
│     NOTIFICATIONS        │
│        (UUID)            │
├──────────────────────────┤
│ • user_id           FK   │
│ • title                  │
│ • message                │
│ • notification_type      │
│ • related_entity_type    │
│ • related_entity_id      │
│ • is_read                │
│ • delivery_channel       │
└──────────────────────────┘


┌──────────────────┐
│     USERS        │
│     (UUID)       │
└────────┬─────────┘
         │
         │ 1:N (One user → Many refresh tokens)
         │
         ▼
┌──────────────────────────┐
│   REFRESH_TOKENS         │
│        (UUID)            │
├──────────────────────────┤
│ • user_id           FK   │
│ • token             Unique│
│ • expires_at             │
│ • is_revoked             │
│ • device_info       JSONB│
└──────────────────────────┘


┌──────────────────┐
│     USERS        │
│     (UUID)       │
└────────┬─────────┘
         │
         │ 1:N (One user → Many audit log entries)
         │
         ▼
┌──────────────────────────┐
│     AUDIT_LOGS           │
│        (UUID)            │
├──────────────────────────┤
│ • user_id           FK   │
│ • action                 │
│ • entity_type            │
│ • entity_id              │
│ • old_values        JSONB│
│ • new_values        JSONB│
│ • ip_address             │
└──────────────────────────┘
```

---

## 📊 Key Database Views

### v_garage_active_appointments
```sql
Combines: appointments + garages + garage_staff + users
Purpose: Quick view of all active appointments for garage dashboard
Filters: status IN ('pending', 'confirmed', 'in_progress')
         AND appointment_datetime >= CURRENT_DATE
```

### v_customer_booking_history
```sql
Combines: appointments + garages + invoices
Purpose: Complete booking history for customer profile
Sorted by: appointment_datetime DESC
```

### v_garage_dashboard_stats
```sql
Combines: garages + appointments + inspections + disputes + invoices
Purpose: Real-time statistics for garage dashboard
Metrics: 
  - Pending appointments count
  - Confirmed appointments count
  - Completed appointments count
  - Pending inspections count
  - Open disputes count
  - Revenue last 30 days
```

---

## 🔑 Key Indexes

### Performance Indexes

```
users:
  - idx_users_email (email)
  - idx_users_phone (phone_number)
  - idx_users_role (role)

appointments:
  - idx_appointments_customer (customer_id)
  - idx_appointments_garage (garage_id)
  - idx_appointments_status (status)
  - idx_appointments_garage_date_status (garage_id, appointment_date, status)

messages:
  - idx_messages_chat_created (chat_id, created_at DESC)

payments:
  - idx_payments_garage_date (garage_id, payment_date DESC)
```

---

## 🔐 Security Features

### Row Level Security (RLS)

```
garages → appointments:
  ✓ Garages can only SELECT their own appointments
  
customers → appointments:
  ✓ Customers can only SELECT their own appointments
  
Admin users:
  ✓ Bypass all RLS policies (implemented at application level)
```

### Audit Trail

All important operations logged in `audit_logs`:
- User actions (CREATE, UPDATE, DELETE)
- IP address tracking
- Before/after values (JSONB)
- Timestamp tracking

---

## 📈 Data Flow Examples

### Customer Books Appointment Flow

```
1. Customer selects garage
   └─> Query: garages + garage_services

2. Customer selects service & date
   └─> Insert: appointments (status = 'pending')
   └─> Trigger: Create notification for garage

3. Garage confirms appointment
   └─> Update: appointments (status = 'confirmed')
   └─> Trigger: Create notification for customer

4. Technician completes service
   └─> Update: appointments (status = 'completed')
   └─> Insert: inspections (if inspection done)
   └─> Insert: invoices

5. Customer makes payment
   └─> Insert: payments
   └─> Update: invoices (payment_status = 'paid')
   └─> Trigger: Create notification for both parties
```

### Dispute Resolution Flow

```
1. Customer raises dispute
   └─> Insert: disputes (status = 'new')
   └─> Auto-generate: dispute_code
   └─> Trigger: Notification to garage & admin

2. Messages exchanged
   └─> Insert: dispute_messages

3. Admin resolves dispute
   └─> Update: disputes (status = 'resolved', resolution text)
   └─> Trigger: Notifications to customer & garage
```

---

## 🔄 Auto-Generated Fields

| Table | Field | Format | Example |
|-------|-------|--------|---------|
| disputes | dispute_code | DISP-#### | DISP-1045 |
| invoices | invoice_number | INV-YYYYMMDD-#### | INV-20251016-0001 |

Generated via PostgreSQL triggers and sequences.

---

## 📝 Foreign Key Cascade Rules

| Parent Table | Child Table | On Delete |
|--------------|-------------|-----------|
| users | garages | CASCADE |
| users | customers | CASCADE |
| garages | appointments | CASCADE |
| customers | vehicles | CASCADE |
| appointments | inspections | CASCADE |
| invoices | invoice_items | CASCADE |
| chats | messages | CASCADE |
| disputes | dispute_messages | CASCADE |

**Important:** Most deletions cascade to maintain referential integrity.

---

## 🎨 ENUM Types

```sql
user_role:
  admin, garage_owner, garage_manager, garage_technician, customer

account_status:
  active, inactive, suspended, pending_verification

appointment_status:
  pending, confirmed, in_progress, completed, cancelled, no_show

inspection_status:
  pending, in_progress, completed, cancelled

payment_status:
  pending, paid, refunded, failed, cancelled

dispute_status:
  new, in_review, resolved, closed, escalated

service_category:
  engine, transmission, brakes, suspension, electrical,
  air_conditioning, diagnostics, oil_change, tires, battery,
  exhaust, cooling_system, fuel_system, general_maintenance,
  body_work, detailing, other

message_sender_type:
  customer, garage, admin, system

priority_level:
  low, normal, high, urgent
```

---

**Diagram Version:** 1.0  
**Last Updated:** October 16, 2025  
**Maintained By:** AutoSaaz Development Team

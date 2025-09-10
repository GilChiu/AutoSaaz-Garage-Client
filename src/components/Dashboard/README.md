# Dashboard Components

This folder contains the main dashboard components for the garage management system.

## Components

### Dashboard.jsx
Main dashboard layout component that includes:
- Sidebar navigation
- Header with user info and actions
- Main content area with BookingSummary

### Sidebar.jsx
Navigation sidebar with:
- Logo and branding
- Navigation links to all main sections
- Settings and logout at bottom
- Responsive design that collapses on mobile

### BookingSummary.jsx
Displays booking data in a table format with:
- Loading and error states
- Status badges for booking progress
- Responsive table design

## Design Tokens

All components use design tokens from `src/styles/tokens.css`:
- Colors: `--color-primary-orange`, `--color-text-primary`, etc.
- Spacing: `--space-xs` to `--space-2xl` (4px increments)
- Typography: `--font-size-xs` to `--font-size-3xl`
- Shadows, borders, and other UI elements

To adjust the design system, modify the tokens file.

## Data Layer

### Mock vs API Data
The booking data can be switched between mock and API:

1. **Mock Mode (default in development)**: Uses `src/mocks/bookings.json`
2. **API Mode**: Set `REACT_APP_USE_MOCKS=false` to use real API

### Data Flow
1. `useBookings()` hook calls `getBookings()` service
2. Service checks environment flags and decides mock vs API
3. API responses are mapped to UI model via `bookingMappers.js`
4. Components receive clean, typed data objects

### Adding New Data
1. Update types in `src/types/booking.js`
2. Update mapper in `src/services/mappers/bookingMappers.js`
3. Update mock data in `src/mocks/bookings.json`
4. Service layer automatically handles the rest

## Responsive Design

- **Desktop (> 1024px)**: Full sidebar visible, all table columns shown
- **Tablet (768-1024px)**: Sidebar collapses, user info hidden in header
- **Mobile (< 768px)**: Service column hidden in table, compact spacing

## Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA labels on interactive elements
- Focus management for keyboard navigation
- Color contrast meets WCAG guidelines

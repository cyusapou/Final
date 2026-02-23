# Task: Split EcoFleetHome.vue into Router-based Pages

## Status: COMPLETED ✅

## What was done:

### Pages Created:
- [x] 1. LandingPage.vue (`/`) - Hero section with "Board Bus Now" button
- [x] 2. ExpressPage.vue (`/express`) - Express company selection
- [x] 3. TripsPage.vue (`/trips`) - Bus trip listing with date picker and filters
- [x] 4. DestinationPage.vue (`/destination`) - Origin and destination selection
- [x] 5. SummaryPage.vue (`/summary`) - Trip summary and price
- [x] 6. PaymentPage.vue (`/payment`) - Payment options and ticket view
- [x] 7. RoutineTripsPage.vue (`/routine`) - Saved routine trips
- [x] 8. PlannerPage.vue (`/planner`) - Future trip planner

### Shared Components:
- [x] LanguageToggle.vue - Language switcher (EN/RW)
- [x] BottomNav.vue - Responsive navigation (mobile bottom nav, desktop sidebar)
- [x] StepProgress.vue - Booking progress indicator

### Files Updated:
- [x] main.js - All route definitions added
- [x] App.vue - RouterView with BottomNav (single instance)
- [x] store/index.js - Shared state management for passing data between pages
- [x] translations/index.js - Added missing translations

### Key Features:
- Responsive design (mobile bottom nav, desktop sidebar)
- Language toggle (English/Kinyarwanda)
- Search and filter functionality on express/trips pages
- Stop code lookup feature
- Payment processing simulation
- Ticket generation with QR code display
- Routine trips management
- Trip planner functionality

### Routes:
- `/` - Landing page
- `/express` - Express company selection
- `/trips` - Available trips
- `/destination` - Origin & destination selection
- `/summary` - Trip summary
- `/payment` - Payment and ticket
- `/routine` - My routine trips
- `/planner` - Trip planner

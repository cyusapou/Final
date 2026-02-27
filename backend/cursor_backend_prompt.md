# 🚌 ON THE GO — KIGALI BUS SYSTEM: FULL BACKEND + PORTAL DEVELOPMENT PROMPT

---

## CONTEXT & MISSION

You are an expert full-stack developer specializing in transportation management systems. You are extending the existing "On The Go" Kigali Bus Booking & Tracking Application — a Vue 3 + TypeScript + Leaflet frontend — by building its **complete backend infrastructure** including a Node.js/Express server, persistent file-based storage (JSON files on disk), a robust state management layer, and five distinct portals: **Super Admin Portal**, **Admin Portal (Transport Company)**, **Manager Portal**, **Worker Portal**, and **Driver Portal**.

The user account system is already being handled by another developer. Do NOT build a user authentication or registration system. Everything else is yours to build.

**Core Philosophy:**
- The backend must be **feature-friendly** — easy to add new endpoints, new modules, new data types
- Data is stored in **JSON files on disk** (acts like a flat-file database) using Node.js `fs` module — but the entire data access layer must be designed so swapping to MongoDB, PostgreSQL, or any real database requires only replacing the data access functions — never touching business logic or routes
- All portals must be **strikingly beautiful**, role-secured, and capable of **editing live web content in real-time**
- The server must **persist data permanently** on the host machine across restarts
- Think like a Rwandan transportation startup CTO — practical, scalable thinking

---

## PART 1: BACKEND SERVER ARCHITECTURE

### 1.1 — Server Setup (`/server/`)

Create a dedicated `/server/` directory at the root of the project alongside the existing Vue frontend. Structure it as follows:

```
/server/
├── index.js                  # Entry point — starts Express + WebSocket server
├── app.js                    # Express app config (middlewares, routes mounting)
├── config.js                 # Central config (ports, file paths, constants, JWT secret, session duration, etc.)
├── /data/                    # JSON flat-file "database" — this is the persistence layer
│   ├── companies.json
│   ├── buses.json
│   ├── routes.json
│   ├── trips.json
│   ├── drivers.json
│   ├── workers.json
│   ├── managers.json
│   ├── portal_users.json     # Stores all non-passenger portal accounts (admins, managers, drivers, workers)
│   ├── bookings.json
│   ├── payments.json
│   ├── incidents.json
│   ├── maintenance.json
│   ├── announcements.json
│   ├── promotions.json
│   ├── content.json          # Live web content editable from portals (hero text, banners, etc.)
│   ├── analytics_snapshots.json
│   ├── audit_log.json
│   └── settings.json         # System-wide settings (toggleable features, thresholds, configs)
├── /db/                      # Data Access Layer — ALL file I/O lives here ONLY
│   ├── index.js              # Exports all collection helpers
│   ├── fileStore.js          # Core read/write/update/delete primitives for JSON files
│   ├── collections/
│   │   ├── companies.js
│   │   ├── buses.js
│   │   ├── routes.js
│   │   ├── trips.js
│   │   ├── drivers.js
│   │   ├── workers.js
│   │   ├── managers.js
│   │   ├── portalUsers.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   ├── incidents.js
│   │   ├── maintenance.js
│   │   ├── announcements.js
│   │   ├── promotions.js
│   │   ├── content.js
│   │   ├── analyticsSnapshots.js
│   │   ├── auditLog.js
│   │   └── settings.js
├── /state/                   # In-memory reactive state layer (fast read, syncs to disk)
│   ├── index.js              # Central state manager
│   ├── liveState.js          # In-memory store initialized from disk on startup
│   └── syncScheduler.js      # Periodically flushes dirty state to disk (every 30s + on shutdown)
├── /routes/                  # Express route handlers
│   ├── auth.js               # Portal login/logout/token refresh
│   ├── superadmin.js
│   ├── admin.js
│   ├── manager.js
│   ├── worker.js
│   ├── driver.js
│   ├── public.js             # Public-facing routes (content, stations, routes — for the Vue frontend)
│   ├── analytics.js
│   ├── financial.js
│   └── realtime.js           # WebSocket event handlers
├── /middleware/
│   ├── auth.js               # JWT verification middleware
│   ├── roleGuard.js          # Role-based access control (RBAC) middleware
│   ├── rateLimiter.js        # Basic rate limiting per IP/token
│   ├── auditLogger.js        # Auto-logs all write operations
│   ├── validator.js          # Request validation helpers
│   └── errorHandler.js       # Centralized error handling
├── /services/                # Business logic — decoupled from routes and storage
│   ├── authService.js
│   ├── companyService.js
│   ├── busService.js
│   ├── routeService.js
│   ├── tripService.js
│   ├── driverService.js
│   ├── workerService.js
│   ├── bookingService.js
│   ├── paymentService.js
│   ├── financialService.js
│   ├── analyticsService.js
│   ├── contentService.js
│   ├── maintenanceService.js
│   ├── notificationService.js
│   └── reportService.js
├── /websocket/
│   ├── wsServer.js           # WebSocket server setup (ws library)
│   ├── channels.js           # Event channel definitions
│   └── broadcaster.js        # Emit events to connected portals in real-time
└── /utils/
    ├── idGenerator.js        # UUID/nanoid generator
    ├── dateUtils.js
    ├── currencyUtils.js      # RWF formatting and calculations
    ├── validators.js
    └── seedData.js           # Seed script to populate JSON files with realistic demo data
```

### 1.2 — fileStore.js (Core Persistence Layer)

The `fileStore.js` must implement:

```javascript
// These are the ONLY functions that touch the filesystem
// Swap these internals for a DB adapter later without touching anything else

readCollection(collectionName)          // Reads JSON file → returns array
writeCollection(collectionName, data)   // Overwrites entire JSON file
findById(collectionName, id)            // Returns single record by id field
findWhere(collectionName, predicate)    // Filter records by predicate function
insertOne(collectionName, record)       // Appends record, auto-generates id + createdAt + updatedAt
updateOne(collectionName, id, changes)  // Merges changes, updates updatedAt
deleteOne(collectionName, id)           // Soft delete (marks deleted: true, keeps record)
hardDelete(collectionName, id)          // Permanent removal (use sparingly, requires superadmin)
bulkInsert(collectionName, records)     // Batch insert
bulkUpdate(collectionName, updates)     // Batch update
```

**DB Swap Comment Block:** At the top of `fileStore.js`, include a prominently commented section:

```javascript
/**
 * ============================================================
 * DATABASE ADAPTER LAYER — EASY SWAP GUIDE
 * ============================================================
 * This file is the ONLY place that reads/writes data.
 * To switch from flat files to a real database:
 *
 * 1. MongoDB: Replace readCollection/writeCollection with
 *    mongoose model calls. Keep all function signatures identical.
 *
 * 2. PostgreSQL: Replace with pg pool.query() calls.
 *    Each "collection" maps to a table.
 *
 * 3. Supabase/Firebase: Replace with their SDK calls.
 *
 * Business logic in /services/ and routes in /routes/
 * will work WITHOUT ANY CHANGES after swapping this file.
 * ============================================================
 */
```

### 1.3 — State Management Layer (`/state/`)

On server startup:
1. `liveState.js` reads ALL JSON files into memory as JavaScript objects/arrays
2. All API endpoints READ from in-memory state (extremely fast)
3. All WRITE operations update in-memory state AND mark the collection as "dirty"
4. `syncScheduler.js` runs every 30 seconds and flushes all dirty collections to disk
5. On SIGTERM/SIGINT (server shutdown), force-flush all dirty state before exit

```javascript
// liveState.js exports
const state = {
  companies: [],
  buses: [],
  routes: [],
  trips: [],
  drivers: [],
  workers: [],
  managers: [],
  portalUsers: [],
  bookings: [],
  payments: [],
  incidents: [],
  maintenance: [],
  announcements: [],
  promotions: [],
  content: {},
  analyticsSnapshots: [],
  auditLog: [],
  settings: {}
}

// Mark dirty for sync
const dirtyCollections = new Set()
const markDirty = (collectionName) => dirtyCollections.add(collectionName)
const flushDirty = async () => { /* write all dirty to disk */ }
```

### 1.4 — Authentication & Security

- JWT-based authentication for all portal users
- Tokens expire in 8 hours (configurable in config.js)
- Refresh token mechanism (24 hour refresh window)
- All tokens include: `{ userId, role, companyId, permissions[], iat, exp }`
- Role hierarchy: `superadmin > admin > manager > worker > driver`
- RBAC middleware checks both role AND specific permissions (e.g., an admin can be restricted from financial data)
- Rate limiting: 100 requests/minute per token, 10 login attempts/hour per IP
- All passwords hashed with bcrypt (salt rounds: 12)
- Audit log: every create/update/delete operation logs `{ action, entity, entityId, actorId, actorRole, timestamp, before, after, ip }`

**Initial Super Admin Seeding:** On first run, if `portal_users.json` is empty, auto-create one superadmin:
- username: `superadmin`
- password: `OnTheGo@2026!` (force-change on first login)
- Log credentials to console once: `[SETUP] SuperAdmin created. Login: superadmin / OnTheGo@2026!`

---

## PART 2: DATA MODELS

Define these as JavaScript objects with full comment documentation. These are the schema definitions — enforced in services, not in fileStore.

### Company
```javascript
{
  id: "uuid",
  name: "Company Name",
  registrationNumber: "RWA-TRN-XXXX",
  logo: "base64 or URL",
  primaryColor: "#hex",          // Used to theme their portal
  address: "Kigali, Rwanda",
  phone: "+250XXXXXXXXX",
  email: "company@example.com",
  status: "active | suspended | pending_approval",
  licenseExpiry: "ISO date",
  totalBuses: 0,
  totalDrivers: 0,
  totalRoutes: 0,
  subscriptionTier: "basic | standard | premium",
  createdAt, updatedAt, createdBy
}
```

### Bus
```javascript
{
  id: "uuid",
  companyId: "uuid",
  plateNumber: "RAB 000 A",
  model: "Toyota Coaster",
  capacity: 30,
  year: 2020,
  status: "active | maintenance | retired | idle",
  currentDriverId: null,
  currentTripId: null,
  currentLocation: { lat: null, lng: null, lastUpdated: null },
  fuelType: "petrol | diesel | electric | hybrid",
  features: ["AC", "WiFi", "USB", "Wheelchair Access"],
  maintenanceHistory: [],        // Array of maintenance record IDs
  insuranceExpiry: "ISO date",
  inspectionExpiry: "ISO date",
  totalTrips: 0,
  totalKilometers: 0,
  createdAt, updatedAt
}
```

### Route
```javascript
{
  id: "uuid",
  companyId: "uuid",
  name: "Nyabugogo → Kimironko",
  code: "R001",
  startStationId: "uuid",
  endStationId: "uuid",
  waypoints: [{ stationId, order, estimatedMinutesFromStart }],
  distanceKm: 12.5,
  estimatedDurationMinutes: 45,
  baseFare: 500,                 // RWF
  expressMultiplier: 1.5,
  peakHourMultiplier: 1.2,
  status: "active | suspended | under_review",
  operatingDays: ["Mon","Tue","Wed","Thu","Fri","Sat"],
  operatingHours: { start: "05:30", end: "22:00" },
  createdAt, updatedAt
}
```

### Trip
```javascript
{
  id: "uuid",
  companyId: "uuid",
  routeId: "uuid",
  busId: "uuid",
  driverId: "uuid",
  workerId: null,                // Station worker managing boarding
  status: "scheduled | boarding | in_progress | completed | cancelled | delayed",
  scheduledDeparture: "ISO datetime",
  actualDeparture: null,
  scheduledArrival: "ISO datetime",
  actualArrival: null,
  currentLocation: { lat, lng, lastUpdated },
  currentStopIndex: 0,
  passengerCount: 0,
  maxPassengers: 30,
  fare: 500,
  totalRevenue: 0,
  delayReason: null,
  cancellationReason: null,
  notes: "",
  checkpoints: [{ stationId, arrivedAt, departedAt, boardings, alightings }],
  createdAt, updatedAt
}
```

### Driver
```javascript
{
  id: "uuid",
  portalUserId: "uuid",          // Links to portal_users.json
  companyId: "uuid",
  nationalId: "XXXXXXXXXXXXXXXX",
  licenseNumber: "DL-XXXXX",
  licenseExpiry: "ISO date",
  licenseClass: "B | C | D",
  phone: "+250XXXXXXXXX",
  photo: "base64",
  status: "active | on_trip | off_duty | suspended | on_leave",
  currentBusId: null,
  currentTripId: null,
  rating: 4.7,
  totalRatings: 234,
  totalTrips: 0,
  totalKilometers: 0,
  joinDate: "ISO date",
  shiftStart: "06:00",
  shiftEnd: "18:00",
  emergencyContact: { name, phone, relationship },
  incidents: [],                 // Array of incident IDs
  createdAt, updatedAt
}
```

### Worker (Station Staff)
```javascript
{
  id: "uuid",
  portalUserId: "uuid",
  companyId: "uuid",
  stationId: "uuid",
  nationalId: "XXXXXXXXXXXXXXXX",
  phone: "+250XXXXXXXXX",
  photo: "base64",
  shift: "morning | afternoon | night",
  shiftHours: { start: "06:00", end: "14:00" },
  status: "active | off_duty | suspended",
  role: "station_agent | inspector | supervisor",
  assignedRoutes: [],            // Route IDs they manage
  createdAt, updatedAt
}
```

### Manager
```javascript
{
  id: "uuid",
  portalUserId: "uuid",
  companyId: "uuid",
  nationalId: "XXXXXXXXXXXXXXXX",
  phone: "+250XXXXXXXXX",
  photo: "base64",
  department: "operations | fleet | finance | hr",
  managedRoutes: [],
  managedDrivers: [],
  permissions: [],               // Fine-grained permission overrides
  createdAt, updatedAt
}
```

### Booking
```javascript
{
  id: "uuid",
  tripId: "uuid",
  userId: "uuid",                // From user auth system (external)
  seatNumber: null,
  status: "confirmed | checked_in | completed | cancelled | no_show",
  fare: 500,
  paymentId: "uuid",
  bookedAt: "ISO datetime",
  checkedInAt: null,
  qrCode: "generated string",
  specialNeeds: null,
  createdAt, updatedAt
}
```

### Payment
```javascript
{
  id: "uuid",
  bookingId: "uuid",
  userId: "uuid",
  amount: 500,
  currency: "RWF",
  method: "mtn_momo | airtel_money | cash | card",
  status: "pending | completed | failed | refunded",
  transactionRef: "TXN-XXXXX",
  processedAt: null,
  refundedAt: null,
  refundReason: null,
  companyId: "uuid",             // For revenue tracking
  createdAt, updatedAt
}
```

### Incident
```javascript
{
  id: "uuid",
  tripId: "uuid",
  busId: "uuid",
  driverId: "uuid",
  reportedBy: "uuid",
  reporterRole: "driver | worker | manager | system",
  type: "accident | breakdown | complaint | theft | medical | delay | other",
  severity: "low | medium | high | critical",
  title: "",
  description: "",
  location: { lat, lng, description: "Near Kimironko Market" },
  status: "open | investigating | resolved | closed",
  resolution: null,
  images: [],
  createdAt, updatedAt
}
```

### Content (Live Web Content)
```javascript
{
  hero: {
    title: "Move Smarter Across Kigali",
    subtitle: "Track your bus in real-time",
    ctaText: "Start Tracking",
    backgroundImage: null
  },
  announcements: [],
  promotionalBanner: {
    enabled: false,
    text: "",
    backgroundColor: "#22c55e",
    textColor: "#ffffff"
  },
  contactInfo: {
    phone: "+250XXXXXXXXX",
    email: "hello@onthego.rw",
    whatsapp: "+250XXXXXXXXX"
  },
  appDownloadLinks: { android: null, ios: null },
  featuredRoutes: [],
  maintenanceMode: { enabled: false, message: "" },
  lastUpdatedBy: null,
  lastUpdatedAt: null
}
```

---

## PART 3: API ROUTES — COMPLETE SPECIFICATION

All routes prefixed with `/api/v1/`. Include full CRUD + business logic endpoints.

### Public Routes (`/api/v1/public/`)
These serve the existing Vue frontend. No auth required.

```
GET  /public/stations           → All 53 stations (from existing stations.ts, now served dynamically)
GET  /public/routes             → All active routes
GET  /public/routes/:id         → Route details with waypoints
GET  /public/trips/live         → All currently live trips with bus locations
GET  /public/trips/:id          → Trip details
GET  /public/content            → Current live web content (hero, banner, etc.)
GET  /public/announcements      → Active announcements
GET  /public/promotions         → Active promotions
GET  /public/companies          → Public company listing (name, logo only)
POST /public/feedback           → Submit passenger feedback
```

### Auth Routes (`/api/v1/auth/`)
```
POST /auth/login                → { username, password, portal } → JWT token
POST /auth/refresh              → Refresh token
POST /auth/logout               → Invalidate token (add to blacklist array in state)
POST /auth/change-password      → Force change on first login
GET  /auth/me                   → Current portal user profile
```

### Super Admin Routes (`/api/v1/superadmin/`) — Role: superadmin
```
# Transport Company Management
GET    /superadmin/companies                  → All companies with full stats
POST   /superadmin/companies                  → Register new transport company
PUT    /superadmin/companies/:id              → Update company details
DELETE /superadmin/companies/:id              → Suspend/delete company
PATCH  /superadmin/companies/:id/status       → Change status (active/suspended/pending)
PATCH  /superadmin/companies/:id/subscription → Change subscription tier
GET    /superadmin/companies/:id/audit        → Company-specific audit trail

# Portal User Management (all roles except passengers)
GET    /superadmin/users                      → All portal users across all companies
POST   /superadmin/users                      → Create admin/manager/driver/worker
PUT    /superadmin/users/:id                  → Update portal user
DELETE /superadmin/users/:id                  → Deactivate portal user
PATCH  /superadmin/users/:id/reset-password   → Force password reset

# System-wide Analytics
GET    /superadmin/analytics/overview         → Platform-wide KPIs
GET    /superadmin/analytics/revenue          → Revenue breakdown by company, route, period
GET    /superadmin/analytics/trips            → Trip stats across all companies
GET    /superadmin/analytics/drivers          → Driver performance across platform
GET    /superadmin/analytics/incidents        → Incident report platform-wide
GET    /superadmin/analytics/compliance       → License/insurance expiry warnings across all

# Live Content Control
GET    /superadmin/content                    → All content blocks
PUT    /superadmin/content                    → Full content update
PATCH  /superadmin/content/:section           → Update specific section (hero, banner, etc.)
POST   /superadmin/content/maintenance        → Toggle maintenance mode

# System Settings
GET    /superadmin/settings                   → All system settings
PUT    /superadmin/settings                   → Update settings
PATCH  /superadmin/settings/:key              → Update single setting

# Audit & Compliance
GET    /superadmin/audit                      → Full platform audit log (paginated, filterable)
GET    /superadmin/audit/export               → Export audit log as CSV/JSON
POST   /superadmin/compliance/notice          → Send compliance notice to company
GET    /superadmin/compliance/violations      → All compliance violations

# Financial Overview
GET    /superadmin/financial/summary          → Platform revenue summary
GET    /superadmin/financial/by-company       → Revenue per company
GET    /superadmin/financial/by-route         → Revenue per route
GET    /superadmin/financial/trends           → Revenue trends (daily/weekly/monthly)
GET    /superadmin/financial/payments         → All payments with filters
POST   /superadmin/financial/reports/generate → Generate financial report

# Announcements
GET    /superadmin/announcements              → All announcements
POST   /superadmin/announcements              → Create platform-wide announcement
PUT    /superadmin/announcements/:id          → Edit announcement
DELETE /superadmin/announcements/:id          → Remove announcement

# Promotions / Fare Control
GET    /superadmin/promotions                 → All promotions
POST   /superadmin/promotions                 → Create system-wide promotion
PUT    /superadmin/promotions/:id             → Edit promotion
PATCH  /superadmin/promotions/:id/toggle      → Enable/disable promotion
```

### Admin Routes (`/api/v1/admin/`) — Role: admin (scoped to their companyId)
```
# Dashboard
GET    /admin/dashboard                       → Company KPIs, alerts, quick stats

# Fleet Management
GET    /admin/buses                           → Company buses with status
POST   /admin/buses                           → Add new bus to fleet
PUT    /admin/buses/:id                       → Edit bus details
DELETE /admin/buses/:id                       → Retire/remove bus
PATCH  /admin/buses/:id/status                → Change bus status
GET    /admin/buses/:id/history               → Bus trip + maintenance history

# Route Management
GET    /admin/routes                          → Company routes
POST   /admin/routes                          → Create new route
PUT    /admin/routes/:id                      → Edit route
DELETE /admin/routes/:id                      → Deactivate route
PATCH  /admin/routes/:id/fare                 → Update route fare
GET    /admin/routes/:id/performance          → Route-specific analytics

# Trip Management
GET    /admin/trips                           → All trips (filterable by status/date/route)
POST   /admin/trips                           → Schedule new trip
PUT    /admin/trips/:id                       → Edit scheduled trip
DELETE /admin/trips/:id                       → Cancel trip
PATCH  /admin/trips/:id/status                → Update trip status
GET    /admin/trips/live                      → Currently running trips
GET    /admin/trips/:id/bookings              → All bookings for a trip

# Staff Management (Managers, Workers, Drivers)
GET    /admin/staff                           → All staff (managers + workers + drivers)
POST   /admin/staff/managers                  → Hire/create manager
PUT    /admin/staff/managers/:id              → Edit manager
DELETE /admin/staff/managers/:id              → Remove manager
PATCH  /admin/staff/managers/:id/permissions  → Edit manager permissions
GET    /admin/staff/workers                   → All workers
POST   /admin/staff/workers                   → Add worker
PUT    /admin/staff/workers/:id               → Edit worker
DELETE /admin/staff/workers/:id               → Remove worker
GET    /admin/staff/drivers                   → All drivers
POST   /admin/staff/drivers                   → Register driver
PUT    /admin/staff/drivers/:id               → Edit driver
DELETE /admin/staff/drivers/:id               → Remove driver
PATCH  /admin/staff/drivers/:id/status        → Change driver status

# Assignments
POST   /admin/assignments/driver-bus          → Assign driver to bus
POST   /admin/assignments/worker-station      → Assign worker to station
POST   /admin/assignments/driver-trip         → Assign driver to trip
DELETE /admin/assignments/driver-bus/:driverId → Unassign driver from bus

# Financial (Company scope)
GET    /admin/financial/summary               → Company revenue overview
GET    /admin/financial/revenue               → Revenue by route/trip/period
GET    /admin/financial/payments              → Payment records
GET    /admin/financial/expenses              → Fleet + operational expenses
GET    /admin/financial/drivers-payroll       → Driver earnings overview
POST   /admin/financial/expenses              → Log an expense
GET    /admin/financial/reports               → Generated reports list
POST   /admin/financial/reports/generate      → Generate company financial report

# Incidents
GET    /admin/incidents                       → All company incidents
PUT    /admin/incidents/:id                   → Update incident status
POST   /admin/incidents/:id/resolve           → Mark incident resolved

# Maintenance
GET    /admin/maintenance                     → All maintenance records
POST   /admin/maintenance                     → Log maintenance event
PUT    /admin/maintenance/:id                 → Update maintenance record
GET    /admin/maintenance/upcoming            → Buses due for maintenance/inspection soon

# Content (Company-scoped content blocks only)
GET    /admin/content                         → Company-specific content
PUT    /admin/content/promotions              → Manage company promotions
POST   /admin/content/announcements           → Push announcement to passengers on their routes

# Analytics
GET    /admin/analytics/overview              → Full company analytics
GET    /admin/analytics/trips                 → Trip performance
GET    /admin/analytics/routes                → Route performance + load factor
GET    /admin/analytics/drivers               → Driver performance rankings
GET    /admin/analytics/customers             → Passenger counts, repeat bookings
GET    /admin/analytics/revenue               → Revenue charts and breakdowns
```

### Manager Routes (`/api/v1/manager/`) — Role: manager (scoped to companyId + assigned resources)
```
# The manager is essentially a hands-on operator/dispatcher — not a strategic admin.
# They manage the day-to-day: trips, drivers, assignments, schedules.

# Dashboard
GET    /manager/dashboard                     → Today's trips, driver statuses, alerts

# Trip Operations
GET    /manager/trips                         → Trips they manage
POST   /manager/trips                         → Create/schedule a trip
PUT    /manager/trips/:id                     → Edit trip details (time, driver, bus)
PATCH  /manager/trips/:id/status              → Update trip status
PATCH  /manager/trips/:id/delay               → Mark trip delayed + reason
POST   /manager/trips/:id/cancel              → Cancel trip + reason
GET    /manager/trips/live                    → Live tracking view of their trips

# Driver Management
GET    /manager/drivers                       → Drivers under their management
PUT    /manager/drivers/:id                   → Edit driver shift/details
PATCH  /manager/drivers/:id/status            → Change driver availability
GET    /manager/drivers/:id/schedule          → Driver's weekly schedule
POST   /manager/drivers/schedule              → Build/edit driver weekly schedule
GET    /manager/drivers/:id/performance       → Individual driver metrics

# Bus Operations
GET    /manager/buses                         → Buses assigned to their routes
PATCH  /manager/buses/:id/status              → Flag bus for maintenance / mark available
GET    /manager/buses/:id/status              → Current bus status + location

# Worker Coordination
GET    /manager/workers                       → Station workers on their routes
PATCH  /manager/workers/:id/shift             → Update worker shift assignment
POST   /manager/workers/:id/message           → Send instruction/message to worker

# Schedules & Assignments
GET    /manager/schedule                      → Route scheduling view
POST   /manager/assignments                   → Quick assignment: driver + bus → trip
DELETE /manager/assignments/:tripId           → Remove assignment
GET    /manager/assignments/conflicts         → Flag scheduling conflicts

# Incidents (Report + Respond)
GET    /manager/incidents                     → Incidents on their routes
POST   /manager/incidents                     → File an incident report
PUT    /manager/incidents/:id                 → Update incident
PATCH  /manager/incidents/:id/status          → Change incident status

# Reports (Operational)
GET    /manager/reports/daily                 → Today's operational summary
GET    /manager/reports/trips                 → Trip summary report
GET    /manager/reports/drivers               → Driver punctuality + performance
POST   /manager/reports/generate              → Generate operational report (PDF/JSON)

# Maintenance Requests
GET    /manager/maintenance                   → Maintenance requests for their buses
POST   /manager/maintenance                   → Submit maintenance request
```

### Worker Routes (`/api/v1/worker/`) — Role: worker (scoped to their station)
```
# Dashboard
GET    /worker/dashboard                      → Today's arrivals at their station, alerts

# Check-In & Boarding Management
GET    /worker/trips/arriving                 → Upcoming trip arrivals at their station
GET    /worker/trips/:id                      → Trip details + passenger manifest
POST   /worker/trips/:id/checkin/:bookingId   → Check in a passenger (scan QR / manual)
GET    /worker/trips/:id/checkin/status       → Boarding completion status
POST   /worker/trips/:id/boarding-complete    → Signal boarding complete to driver
PATCH  /worker/trips/:id/passenger-count      → Update live passenger count

# Incidents
POST   /worker/incidents                      → Report station/trip incident
GET    /worker/incidents                      → Incidents they've reported

# Communication
GET    /worker/messages                       → Messages from managers
POST   /worker/messages/reply                 → Reply to manager

# Status
PATCH  /worker/status                         → Update own status (on_duty / off_duty)
GET    /worker/schedule                       → My shift schedule

# Station Info
GET    /worker/station                        → Their station details and current trips
```

### Driver Routes (`/api/v1/driver/`) — Role: driver
```
# Dashboard
GET    /driver/dashboard                      → Today's assigned trip, bus info, alerts

# Shift Management
POST   /driver/shift/start                    → Clock in for shift
POST   /driver/shift/end                      → Clock out from shift
GET    /driver/shift/history                  → Past shifts

# Trip Operations
GET    /driver/trips                          → Assigned trips
GET    /driver/trips/current                  → Current active trip
POST   /driver/trips/:id/depart               → Mark trip departed
POST   /driver/trips/:id/arrive               → Mark arrival at checkpoint
PATCH  /driver/trips/:id/location             → Update live bus location (called on interval)
POST   /driver/trips/:id/complete             → Complete trip
POST   /driver/trips/:id/delay                → Report delay + reason

# Navigation
GET    /driver/routes/:id/waypoints           → Full route with all stops + coordinates
GET    /driver/routes/:id/instructions        → Turn-by-turn summary

# Passenger Management
GET    /driver/trips/:id/passengers           → Expected passenger count
POST   /driver/trips/:id/board/:bookingId     → Confirm passenger boarding
POST   /driver/trips/:id/emergency-stop       → Trigger emergency

# Bus & Maintenance
GET    /driver/bus                            → My assigned bus details
POST   /driver/bus/report                     → Report bus issue
GET    /driver/bus/checklist                  → Pre-trip safety checklist template
POST   /driver/bus/checklist                  → Submit completed checklist

# Incidents
POST   /driver/incidents                      → File incident report
GET    /driver/incidents                      → My filed incidents

# Performance
GET    /driver/performance                    → My performance stats and rating
GET    /driver/earnings                       → Earnings summary (if applicable)
```

### Financial Routes (`/api/v1/financial/`) — Role: admin, superadmin
```
GET    /financial/summary                     → { totalRevenue, totalBookings, avgFare, revenueByPeriod }
GET    /financial/revenue/daily               → Daily revenue breakdown
GET    /financial/revenue/weekly              → Weekly trends
GET    /financial/revenue/monthly             → Monthly breakdown
GET    /financial/revenue/by-route            → Revenue per route with occupancy rate
GET    /financial/revenue/by-company          → (superadmin only) cross-company
GET    /financial/revenue/by-payment-method   → MTN MoMo vs Airtel vs Cash split
GET    /financial/payments                    → All payment records (filterable)
GET    /financial/payments/:id                → Single payment details
POST   /financial/payments/refund/:id         → Process refund
GET    /financial/expenses                    → Operational expenses log
POST   /financial/expenses                    → Add expense record
GET    /financial/profitability               → Revenue minus expenses = profit
GET    /financial/reports                     → Saved reports
POST   /financial/reports/generate            → Generate report: { period, type, format }
GET    /financial/alerts                      → Revenue drop alerts, missed targets, etc.
```

### Analytics Routes (`/api/v1/analytics/`)
```
GET    /analytics/overview                    → Platform or company KPI overview
GET    /analytics/trips/stats                 → On-time rate, cancellation rate, delay avg
GET    /analytics/routes/popular              → Most used routes by passenger count
GET    /analytics/routes/revenue              → Routes ranked by revenue
GET    /analytics/routes/occupancy            → Load factor per route (passengers/capacity)
GET    /analytics/drivers/performance         → Driver rankings (rating, on-time %, incidents)
GET    /analytics/passengers/trends           → Daily/weekly passenger volume trends
GET    /analytics/incidents/trends            → Incident frequency and types
GET    /analytics/buses/utilization           → Fleet utilization rate
GET    /analytics/snapshots                   → Saved analytics snapshots
POST   /analytics/snapshots                   → Save current state as snapshot
```

### Real-time WebSocket Events
Use the `ws` npm library. Implement channels:

```javascript
// Server → Client broadcasts
'trip:location_update'          → { tripId, busId, lat, lng, speed, timestamp }
'trip:status_change'            → { tripId, status, message }
'content:updated'               → { section, newContent }                     // Portals refresh UI
'announcement:new'              → { announcement }
'incident:filed'                → { incident }
'bus:status_change'             → { busId, status }
'driver:status_change'          → { driverId, status }
'system:alert'                  → { severity, message }

// Client → Server messages
'driver:location_ping'          → { driverId, tripId, lat, lng }             // Driver app sends GPS
'worker:boarding_update'        → { tripId, count }
```

All portal pages subscribe to relevant events and update their UI in real-time without page refresh.

---

## PART 4: THE PORTALS — FRONTEND UI

Build all portals as a **separate multi-page Vue 3 app** inside `/portals/` at project root. This is completely separate from the main passenger-facing app in `/src/`.

```
/portals/
├── index.html
├── main.js
├── App.vue
├── router/index.js            # Vue Router with role-based route guards
├── store/index.js             # Pinia store (portal-specific state)
├── services/api.js            # Axios instance + interceptors for the backend
├── services/websocket.js      # WebSocket client service
├── composables/
│   ├── useAuth.js             # Auth state, login/logout
│   ├── useRealtime.js         # WebSocket subscription helpers
│   ├── useFinancial.js
│   └── useAnalytics.js
├── /views/
│   ├── LoginView.vue          # Shared beautiful login page
│   ├── /superadmin/
│   │   ├── SuperAdminLayout.vue
│   │   ├── Dashboard.vue
│   │   ├── Companies.vue
│   │   ├── CompanyDetail.vue
│   │   ├── Users.vue
│   │   ├── ContentEditor.vue
│   │   ├── Financial.vue
│   │   ├── Analytics.vue
│   │   ├── Compliance.vue
│   │   ├── Announcements.vue
│   │   ├── SystemSettings.vue
│   │   └── AuditLog.vue
│   ├── /admin/
│   │   ├── AdminLayout.vue
│   │   ├── Dashboard.vue
│   │   ├── Fleet.vue
│   │   ├── BusDetail.vue
│   │   ├── Routes.vue
│   │   ├── RouteDetail.vue
│   │   ├── Trips.vue
│   │   ├── TripDetail.vue
│   │   ├── Staff.vue
│   │   ├── DriverDetail.vue
│   │   ├── Financial.vue
│   │   ├── Analytics.vue
│   │   ├── Incidents.vue
│   │   ├── Maintenance.vue
│   │   └── ContentEditor.vue
│   ├── /manager/
│   │   ├── ManagerLayout.vue
│   │   ├── Dashboard.vue
│   │   ├── LiveTrips.vue
│   │   ├── Schedule.vue
│   │   ├── Drivers.vue
│   │   ├── DriverSchedule.vue
│   │   ├── Incidents.vue
│   │   └── Reports.vue
│   ├── /worker/
│   │   ├── WorkerLayout.vue
│   │   ├── Dashboard.vue
│   │   ├── BoardingManager.vue
│   │   ├── CheckIn.vue
│   │   └── Incidents.vue
│   └── /driver/
│       ├── DriverLayout.vue
│       ├── Dashboard.vue
│       ├── ActiveTrip.vue
│       ├── MyBus.vue
│       ├── Performance.vue
│       └── Incidents.vue
└── /components/
    ├── /shared/
    │   ├── SideNav.vue
    │   ├── TopBar.vue
    │   ├── StatCard.vue
    │   ├── DataTable.vue
    │   ├── ChartLine.vue
    │   ├── ChartBar.vue
    │   ├── ChartDonut.vue
    │   ├── LiveMap.vue           # Leaflet map reused in portals
    │   ├── ConfirmModal.vue
    │   ├── AlertBanner.vue
    │   ├── LoadingState.vue
    │   ├── EmptyState.vue
    │   ├── RoleBadge.vue
    │   ├── StatusPill.vue
    │   └── AuditEntry.vue
    ├── /forms/
    │   ├── BusForm.vue
    │   ├── RouteForm.vue
    │   ├── TripForm.vue
    │   ├── DriverForm.vue
    │   ├── WorkerForm.vue
    │   ├── IncidentForm.vue
    │   └── ContentBlockEditor.vue
    └── /financial/
        ├── RevenueChart.vue
        ├── PaymentTable.vue
        ├── FinancialSummaryCard.vue
        └── ExpenseTracker.vue
```

---

## PART 5: PORTAL DESIGN SPECIFICATIONS

### Design Language
All portals must be **strikingly professional and beautiful**. They are internal operational tools, so design should feel like a premium SaaS dashboard — not a generic admin template.

**Design Direction:** Clean industrial-modern. Dark sidebars. Light content area. African-inspired accent colors (deep green `#166534`, gold `#d97706`, with white and slate). Typography: `DM Sans` for UI, `DM Mono` for data/numbers. Dense but breathable layouts. Micro-animations on state changes.

**Color System (CSS Variables):**
```css
:root {
  --brand-primary: #166534;      /* Deep Rwandan green */
  --brand-accent: #d97706;       /* Warm gold for alerts + CTAs */
  --brand-danger: #dc2626;
  --brand-info: #0ea5e9;
  --sidebar-bg: #0f1923;
  --sidebar-text: #94a3b8;
  --sidebar-active: #ffffff;
  --content-bg: #f8fafc;
  --card-bg: #ffffff;
  --border: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --number-font: 'DM Mono', monospace;
  --ui-font: 'DM Sans', sans-serif;
}
```

Each portal role gets a distinctive accent color on their sidebar indicator:
- Super Admin: `#7c3aed` (regal purple)
- Admin: `#166534` (company green)
- Manager: `#0ea5e9` (operational blue)
- Worker: `#d97706` (warm amber)
- Driver: `#16a34a` (active green)

### Login Page
- Single shared login page at `/portals/login`
- Role is auto-detected from credentials (no role selector needed)
- Beautiful full-screen design: left side is an animated dark panel with "On The Go" branding, Kigali skyline silhouette illustration, and a rotating operational stat (e.g., "47 trips running right now"); right side is a clean white form
- Smooth entrance animations on load
- On login: redirect to appropriate portal based on detected role

### Super Admin Portal — "Command Center"

**Dashboard:**
- A high-density overview panel showing: total companies, total buses running live, total active trips, platform revenue today, total passengers today
- "Health Status" row: 5 indicator pills for Platform, API, Payments, Bus Tracking, Database
- "Compliance Alerts" section: licenses expiring < 30 days, insurance expiring, overdue inspections — color-coded critical/warning/ok
- "Live Activity Feed" sidebar: scrolling log of real-time events (trips departing, incidents filed, new bookings)
- Revenue chart (line chart — last 30 days)
- Company comparison bar chart

**Companies Page:**
- Table with company cards (logo, name, status, bus count, today's revenue, compliance score)
- Click → Company Detail view showing: full profile, fleet list, route list, staff list, financial summary, audit trail
- Add/Edit company inline slide-over panel (not a separate page)
- Suspend company → confirmation modal → immediate effect (all their API tokens invalidated)

**Live Content Editor:**
- Split-pane UI: left = content tree (hero, banner, announcements, contact, features), right = WYSIWYG-style form editor
- Changes trigger WebSocket broadcast to all connected portal clients AND to the main Vue passenger app
- Preview panel showing how the edit looks on the main app
- "Publish" button with confirmation + last-published timestamp visible

**Financial Page:**
- Top row: Total Revenue (RWF), Revenue This Month, Revenue This Week, Revenue Today — all large monospaced numbers
- Revenue by company — horizontal bar chart
- Revenue by payment method — donut chart (MTN MoMo / Airtel / Cash / Card)
- Trend line: daily revenue for last 90 days with 7-day moving average
- Top 10 routes by revenue — table with route name, trips, passengers, revenue, avg fare
- Filterable payments table with export to CSV
- "Anomaly Alerts": auto-flagged payments with unusual amounts or refund spikes

**Audit Log:**
- Full timeline of all operations across the platform
- Filterable by: company, role, action type, entity type, date range
- Each entry shows: actor name, role, action, entity affected, timestamp, IP — expandable to show before/after JSON diff

### Admin Portal — "Ops Central"

**Dashboard:**
- Company-scoped. Shows: fleet status (active/idle/maintenance buses as a visual fleet grid), today's trips timeline, revenue today vs yesterday vs same day last week
- "Action Needed" panel: buses due for maintenance, drivers with expiring licenses, trips without assigned drivers
- Live map showing all company buses moving in real-time (reusing Leaflet)
- Quick stats: On-time rate (%), Average occupancy, Incidents open, Staff on duty

**Fleet Page:**
- Visual bus card grid: each card shows plate number, model, current status (color-coded), current driver, current trip progress, photo
- Filter by status. Sort by last activity.
- Click bus → Bus Detail: history timeline, current status, maintenance log, assignment log, performance metrics
- Add Bus → form modal with all fields

**Routes Page:**
- Route cards with key stats: daily average passengers, revenue per km, on-time rate
- Map preview for each route showing polyline
- Edit route → opens full route editor with station selector, waypoint ordering, fare settings

**Trips Page:**
- Table with rich filters: date, route, status, driver
- Live trip tracker showing real-time position on mini-map
- Bulk reschedule tool
- Schedule builder: visual timeline (like a Gantt chart) for scheduling trips across the week

**Staff Page:**
- Three tabs: Managers | Workers | Drivers
- Each person shown as a card with photo placeholder, status, assignment, performance indicator
- Hire → form that also creates their portal login
- Click person → profile with performance metrics, shift history, incident history

**Financial Page (Company-level):**
- Full financial breakdown matching the service capabilities
- Expense tracker: log fuel, maintenance, tolls, etc. with category tagging
- Profitability view: revenue vs expenses with net margin
- Driver payroll section: hours worked + per-trip compensation calculation
- Export all financial data as CSV

### Manager Portal — "Dispatch Center"

**Tone:** Feels like a busy dispatch board. Information density is high. Quick actions everywhere.

**Dashboard:**
- "Today's Board": a timeline view of all trips on their routes, color coded by status, laid out chronologically
- On-duty drivers: avatar row with status badge
- Bus availability quick view
- 3 big numbers: Trips Today, Drivers On Duty, Incidents Open
- Live alerts: delay notifications, driver status changes, incidents

**Live Trips View:**
- Full-screen Leaflet map with all live buses
- Sidebar list of trips with status + passenger count
- Click trip → trip card popover with driver info, route progress, estimated arrival
- "Delay this trip" button on each trip card
- Real-time updates via WebSocket

**Schedule Builder:**
- Drag-and-drop weekly schedule grid
- Rows: routes. Columns: days. Cells: assigned trip blocks
- Drag a trip to reschedule it. Drag a driver to reassign.
- Conflict detection (driver already assigned, bus in use) shown inline with red overlay

**Driver Management:**
- Driver list with current status, today's assignment, shift time
- Click driver → profile with editable shift times, week schedule view, performance chart, incident list
- "Send Message" button (stored as messages in the system)

### Worker Portal — "Station Desk"

**Tone:** Simple, focused, mobile-optimized. Workers use tablets or phones at the station.

**Dashboard:**
- Big bold clock and station name at the top
- "Next Arrivals" — card stack showing next 3 trips arriving with: route name, ETA, expected passengers, bus plate
- My shift info: start time, end time, hours remaining

**Boarding Manager:**
- When a trip arrives: full-screen boarding mode
- Shows trip details, passenger list
- Large QR scanner button (uses device camera)
- Manual entry fallback (booking ID input)
- Running count: "14 / 30 boarded"
- "Boarding Complete" big button → notifies driver + manager
- Handles edge cases: no-show (mark no-show), walk-in cash passenger (log manually)

**Incident Reporting:**
- Simple form: incident type selector (icons, not dropdown), description, severity
- Photo attachment option
- One-tap submit

### Driver Portal — "Road View"

**Tone:** Extremely simple. Big text. High contrast. Safe to glance at while stationary. Mobile-first.

**Dashboard:**
- "Your Trip Today" card at top: route name, departure time, bus plate
- Bus status: a quick checklist reminder
- My performance: rating badge, on-time percentage this week

**Active Trip View:**
- This is the most important screen for a driver
- Full-screen split: top half = mini live map showing route with current position and next stop; bottom half = trip info
- BIG bold: "Next Stop: Kimironko" with estimated minutes
- Current passenger count (updated by workers)
- Waypoint checklist: tap each stop when arrived/departed
- Emergency button (red, requires hold-to-activate to prevent accidents)
- "Report Delay" inline

**Bus Checklist:**
- Pre-trip safety checklist: Tires OK? Lights OK? Brakes OK? Fuel level? Documents?
- Each item is a large tap target (yes/no)
- Submit sends to admin + manager automatically

**Performance Page:**
- Rating score (large number with star display)
- On-time % — progress circle
- Trips this month — counter
- Incidents this month — counter
- Comparison to last month (up/down arrows)

---

## PART 6: LIVE CONTENT EDITING SYSTEM

This is a key differentiator. Portal users (admin and superadmin) must be able to edit the **main passenger-facing Vue app's content in real-time**.

### How it works:
1. The main Vue app (`/src/`) fetches content from `GET /api/v1/public/content` on load
2. It also subscribes to the WebSocket channel `content:updated`
3. When a portal user edits content and clicks "Publish", the server:
   a. Updates the `content.json` file
   b. Broadcasts `content:updated` event to ALL connected WebSocket clients (including passenger app)
4. The main Vue app receives the event and reactively updates the relevant sections **without page refresh**

### Editable Content Sections:
- **Hero Section**: Title, subtitle, CTA button text, background image (upload as base64)
- **Promotional Banner**: Toggle on/off, text, background color picker, text color picker
- **Announcements**: CRUD list of announcements (title, message, severity, expiry date)
- **Active Promotions**: Promo code, discount type (%, fixed), valid routes, expiry
- **Contact Information**: Phone, email, WhatsApp, social media links
- **Featured Routes**: Manually curated list of highlighted routes shown on landing page
- **App Download Links**: Android / iOS store URLs
- **Maintenance Mode**: Toggle — when on, passenger app shows maintenance screen with custom message

### Vue App Integration:
In the main Vue app, add a `useContent` composable:
```javascript
// src/composables/useContent.js
export function useContent() {
  const content = ref(null)
  
  const fetchContent = async () => {
    const res = await fetch('/api/v1/public/content')
    content.value = await res.json()
  }
  
  // Subscribe to real-time updates
  const ws = useWebSocket()
  ws.on('content:updated', (update) => {
    content.value = { ...content.value, ...update.newContent }
  })
  
  onMounted(fetchContent)
  return { content }
}
```

---

## PART 7: FINANCIAL ANALYSIS ENGINE

The `financialService.js` must implement a comprehensive financial analysis module:

### Core Calculations:
```javascript
// Revenue calculations
calculateTripRevenue(tripId)                          // Sum all completed bookings for a trip
calculateRouteRevenue(routeId, dateRange)             // Revenue for a route over period
calculateCompanyRevenue(companyId, dateRange)          // Company total revenue
calculatePlatformRevenue(dateRange)                   // Platform-wide total

// Trend analysis
getRevenueTrend(companyId, period, granularity)       // Returns array of { date, revenue } points
getRevenueGrowth(companyId, currentPeriod, prevPeriod) // Growth % calculation
getRevenueMovingAverage(data, windowDays)             // N-day moving average

// Profitability
calculateProfitMargin(companyId, dateRange)           // Revenue - expenses / revenue
identifyTopRoutes(companyId, limit, metric)           // Top routes by revenue/passengers/occupancy
identifyUnderperformingRoutes(companyId)              // Routes with low occupancy or revenue drop

// Passenger metrics
calculateAverageFare(companyId, dateRange)
calculateOccupancyRate(tripId)                        // passengerCount / busCapacity
calculateLoadFactor(routeId, dateRange)               // Average occupancy across all trips

// Payment method analysis
getPaymentMethodSplit(companyId, dateRange)           // { mtn: X%, airtel: Y%, cash: Z% }

// Anomaly detection (simple rule-based)
detectRevenueAnomalies(companyId)                     // Sudden drops > 30%, unusual spikes
detectRefundAnomalies(companyId)                      // Refund rate > threshold

// Report generation
generateFinancialReport(companyId, period, type)      // Returns structured JSON report
  // Types: 'summary' | 'detailed' | 'route_breakdown' | 'payroll' | 'expenses'
```

### Financial Dashboard Components:
Each financial dashboard should display:
- **KPI Row:** Total Revenue, Revenue MTD, Revenue YTD, Avg Daily Revenue — all in large monospaced RWF format
- **Revenue Trend Chart:** Line chart — selectable periods (7d, 30d, 90d, 1y), with comparison to previous period as a second line
- **Route Revenue Heatmap:** Visual grid of routes × days showing revenue density
- **Payment Method Donut Chart:** MTN MoMo, Airtel Money, Cash, Card
- **Top Routes Bar Chart:** Top 10 routes by revenue
- **Occupancy Rate Gauge:** Company-wide average occupancy %
- **Recent Transactions Table:** Paginated, searchable, exportable
- **Anomaly Alerts Banner:** If any anomalies detected, show at top with explanation

---

## PART 8: SEED DATA & DEMO SETUP

Create `/server/utils/seedData.js` that populates all JSON files with realistic Rwandan data:

- **3 transport companies:** "Kigali Express Bus", "Rwanda Metro Transport", "Hills Bus Rwanda"
- **Each company has:** 8–12 buses, 10–15 drivers, 3–5 workers, 2 managers, 4–6 routes
- **Routes:** All based on real Kigali routes (Nyabugogo → CBD, CBD → Kimironko, Nyamirambo → Remera, etc.)
- **Trips:** Generate 30 days of historical trip data (completed) + 7 days future (scheduled)
- **Payments:** Corresponding to bookings — mix of MTN MoMo, cash, Airtel
- **Incidents:** 10–20 minor incidents across the history
- **Portal Users:** One admin per company, managers and drivers with login credentials printed to console on seed
- **Content:** Fully populated `content.json` with working hero content, 2 announcements, 1 promotion
- Seed script run with: `node server/utils/seedData.js`
- Add a `npm run seed` script to `package.json`

---

## PART 9: SERVER STARTUP & SCRIPTS

### package.json additions:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run portal:dev\" \"vite\"",
    "server:dev": "nodemon server/index.js",
    "server:start": "node server/index.js",
    "portal:dev": "vite portals --port 3001 --config portals/vite.config.js",
    "portal:build": "vite build portals --config portals/vite.config.js",
    "seed": "node server/utils/seedData.js",
    "build": "vite build"
  }
}
```

### server/index.js startup sequence:
```javascript
// 1. Load config
// 2. Initialize data directory (create /server/data/ and empty JSON files if not exist)
// 3. Load all JSON data into in-memory state (liveState.js)
// 4. Start sync scheduler
// 5. Configure Express app
// 6. Mount all route handlers
// 7. Start WebSocket server
// 8. Start HTTP server on PORT (default 5000)
// 9. Log: "🚌 On The Go Server running on port 5000"
// 10. Log: "📊 Data loaded: X companies, X buses, X trips..."
// 11. Handle SIGTERM/SIGINT → flush dirty state → graceful shutdown

// The portals app is served at /portals route from the Express server
// So accessing http://localhost:5000/portals/ loads the portals frontend
// This means only ONE server needs to run in production
```

### CORS Configuration:
- In development: allow `localhost:5173` (main Vite app) and `localhost:3001` (portals Vite dev)
- In production: allow same origin only
- WebSocket: allow same origins

### Environment Variables (`.env`):
```
PORT=5000
JWT_SECRET=onthego_jwt_secret_change_in_production
JWT_EXPIRES_IN=8h
SYNC_INTERVAL_MS=30000
DATA_DIR=./server/data
SUPERADMIN_INITIAL_PASSWORD=OnTheGo@2026!
```

---

## PART 10: EXTENSIBILITY GUIDELINES

Throughout every file, add comments that guide future extension:

```javascript
// 🔌 EXTENSION POINT: To add a new portal role, follow these steps:
// 1. Add role to config.js ROLES constant
// 2. Create /server/routes/newrole.js with endpoints
// 3. Mount in app.js with appropriate roleGuard middleware
// 4. Add /portals/views/newrole/ directory with views
// 5. Add route guards in portals/router/index.js
// 6. No changes needed to fileStore, state management, or auth system

// 🔌 EXTENSION POINT: To add a new data entity:
// 1. Add JSON file to /server/data/
// 2. Create collection helper in /db/collections/
// 3. Export from /db/index.js
// 4. Add to liveState.js
// 5. Create service in /services/
// 6. Create route in /routes/
// 7. Mount in app.js

// 🔌 EXTENSION POINT: To add real-time notifications for a new event:
// 1. Add event name to /websocket/channels.js
// 2. Call broadcaster.emit(CHANNEL, data) from relevant service
// 3. Subscribe in portal with useRealtime composable
```

---

## PART 11: SECURITY IMPLEMENTATION DETAILS

### Token Blacklist:
```javascript
// In liveState.js
const blacklistedTokens = new Set() // In-memory (persisted to settings.json)
// In auth middleware: check if token is in blacklist before processing
```

### Request Validation:
Every POST/PUT/PATCH endpoint must validate the request body before passing to the service. Use a simple validation helper (no external library):
```javascript
validateRequired(body, ['name', 'plateNumber', 'capacity'])  // Throws 400 if missing
validateEnum(body.status, ['active', 'maintenance', 'retired'])
validateRwandaPhone(body.phone)  // Validates +250XXXXXXXXX format
validateRwandaPlate(body.plateNumber)  // Validates plate format
```

### Company Isolation:
Every admin-level route must enforce company isolation. Add `companyIsolation` middleware:
```javascript
// Automatically injects companyId from JWT token into all queries
// Prevents admin of Company A from accessing Company B's data
// Applied to all /admin/ and /manager/ routes automatically
```

### Audit Everything:
The `auditLogger.js` middleware automatically wraps all write operations (POST/PUT/PATCH/DELETE) and logs:
```javascript
{
  id: uuid,
  timestamp: ISO,
  actorId: from JWT,
  actorName: from JWT,
  actorRole: from JWT,
  companyId: from JWT,
  method: 'POST',
  endpoint: '/api/v1/admin/buses',
  action: 'CREATE_BUS',
  entityType: 'bus',
  entityId: created entity ID,
  summary: 'Created bus RAB 000 A',
  ip: request IP,
  before: null,        // for updates: previous value
  after: newRecord     // resulting record
}
```

---

## PART 12: IMPORTANT IMPLEMENTATION NOTES

1. **Do not touch `/src/` (the passenger Vue app)** except to:
   - Add the `useContent.js` composable
   - Add a WebSocket client initialization in `main.js`
   - Update the API base URL in any existing fetch calls to point to the new server

2. **The portals are a completely separate Vue app** in `/portals/`. They have their own `vite.config.js`, `package.json` dependencies, and router. They are served in production by the Express server at `/portals/`.

3. **Use Pinia for portal state management.** Install it as a separate dependency in the portals app.

4. **Charts**: Use Chart.js (already referenced in project) for all financial and analytics charts in the portals. Wrap each chart in a reusable Vue component.

5. **The Leaflet map in the portals** reuses the existing `@vue-leaflet/vue-leaflet` dependency to show live bus locations on the manager and admin dashboards.

6. **All RWF amounts** are stored as integers (cents equivalent: store 500 RWF as 500). Format for display using `currencyUtils.js` → `formatRWF(500)` → `"RWF 500"`.

7. **Dates**: Store all dates as ISO 8601 strings in JSON. Use `dateUtils.js` helpers for formatting into Kinyarwanda/English readable formats.

8. **Images/Photos**: Store as base64 strings in JSON for now. Add a comment noting this should switch to file storage in production.

9. **Password hashing**: Use `bcryptjs` (pure JS implementation, no native dependencies) — `npm install bcryptjs`.

10. **JWT**: Use `jsonwebtoken` library — `npm install jsonwebtoken`.

11. **WebSocket**: Use the `ws` library — `npm install ws`. Keep it simple — one WebSocket server, multiple channels differentiated by event name.

12. **Every API response** must follow this format:
```javascript
// Success
{ success: true, data: { ... }, message: "Optional success message" }

// Error
{ success: false, error: "Error code", message: "Human readable message", details: {} }

// Paginated list
{ success: true, data: [...], pagination: { total, page, limit, totalPages } }
```

13. **Logging**: Use simple `console.log` with emoji prefixes for server logs:
- `🚀` Server events
- `📊` Data operations  
- `🔐` Auth events
- `⚡` Real-time events
- `⚠️` Warnings
- `❌` Errors
- `💾` Disk sync events

14. **When the portals app is opened for the first time**, show a beautiful onboarding splash for ~1 second with "On The Go Portal" and the current portal role, then transition to dashboard.

15. **All portal tables** must support: column sorting, search/filter, pagination (20 items per page), and CSV export.

---

## FINAL DELIVERABLE CHECKLIST

After completing this implementation, verify:

- [ ] `npm run server:dev` starts the backend server with no errors
- [ ] `npm run seed` populates all JSON files with realistic data
- [ ] `npm run dev` starts both the passenger app and portals simultaneously
- [ ] Logging in as superadmin at `/portals/login` with seeded credentials works
- [ ] Superadmin can add a new transport company
- [ ] Superadmin can edit the homepage hero title and it updates in the main app in real-time
- [ ] Admin portal shows the company's buses, routes, and trips
- [ ] Manager portal shows live trips and driver statuses
- [ ] Worker portal boarding manager can check in a passenger
- [ ] Driver portal active trip view shows route progress
- [ ] Financial dashboard shows charts with seeded data
- [ ] JSON files in `/server/data/` are updated on disk after write operations
- [ ] Server restart reloads all data from JSON files without loss
- [ ] All portals are beautiful, responsive, and match the design specifications
- [ ] Role-based access control prevents cross-role data access
- [ ] Audit log captures all write operations across all portals

---

*Build this system as a senior Rwandan transportation tech startup engineer would — practical, clean, extensible, and something to be proud of. Every portal should feel like it belongs in a product worth paying for.*

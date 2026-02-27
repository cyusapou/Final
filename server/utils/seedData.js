/**
 * ============================================================
 * SEED DATA SCRIPT
 * ============================================================
 * Populates the JSON files with realistic Rwandan demo data
 */

const bcrypt = require('bcryptjs');
const config = require('../config');
const { createMinimalPricing } = require('./createMinimalPricing');
const { createMinimalRoutes } = require('./createMinimalRoutes');
const { 
  initializeDataDirectory,
  insertOne,
  bulkInsert,
  readCollection
} = require('../db/fileStore');

/**
 * Generate realistic Rwandan names
 */
const generateRwandanName = () => {
  const firstNames = ['Jean', 'Marie', 'Joseph', 'Grace', 'Eric', 'Sarah', 'Pierre', 'Chantal', 'Andre', 'Alice', 'Vincent', 'Ange', 'Claudine', 'Emmanuel', 'Diane', 'Tharcisse', 'Gisele', 'Olivier', 'Rachel', 'Benjamin', 'Carine', 'Faustin', 'Eugenie', 'Sylvestre', 'Patricia', 'Gilbert', 'Christine', 'Damien', 'Lydia', 'Herve', 'Nadia'];
  const lastNames = ['Munyaneza', 'Niyonzima', 'Uwimana', 'Mukamunzi', 'Niyonzima', 'Uwimana', 'Munyaneza', 'Niyonzima', 'Uwimana', 'Mukamunzi', 'Niyonzima', 'Uwimana', 'Munyaneza', 'Niyonzima', 'Uwimana', 'Mukamunzi'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

/**
 * Generate Rwandan phone number
 */
const generateRwandanPhone = () => {
  const prefixes = ['788', '789', '790', '791'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 900000) + 100000;
  return `+250${prefix}${number}`;
};

/**
 * Generate license plate
 */
const generateLicensePlate = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `RAB ${String(number).padStart(3, '0')} ${letter}`;
};

/**
 * Create transport companies
 */
const createCompanies = async () => {
  console.log('🏢 Creating transport companies...');
  
  const companies = [
    {
      name: 'Kigali Express Bus',
      registrationNumber: 'RWA-TRN-2023-001',
      logo: null,
      primaryColor: '#166534',
      address: 'Kigali, Rwanda',
      phone: '+250788123001',
      email: 'info@kigaliexpress.rw',
      status: 'active',
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      totalBuses: 12,
      totalDrivers: 15,
      totalRoutes: 8,
      subscriptionTier: 'premium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      name: 'Rwanda Metro Transport',
      registrationNumber: 'RWA-TRN-2023-002',
      logo: null,
      primaryColor: '#0ea5e9',
      address: 'Kigali, Rwanda',
      phone: '+250788123002',
      email: 'contact@rwandametro.rw',
      status: 'active',
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      totalBuses: 10,
      totalDrivers: 12,
      totalRoutes: 6,
      subscriptionTier: 'standard',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      name: 'Hills Bus Rwanda',
      registrationNumber: 'RWA-TRN-2023-003',
      logo: null,
      primaryColor: '#d97706',
      address: 'Kigali, Rwanda',
      phone: '+250788123003',
      email: 'info@hillsbus.rw',
      status: 'active',
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      totalBuses: 8,
      totalDrivers: 10,
      totalRoutes: 5,
      subscriptionTier: 'basic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  for (const company of companies) {
    await insertOne('companies', company);
  }
  
  console.log(`[fas fa-check-circle] Created ${companies.length} transport companies`);
};

/**
 * Create drivers
 */
const createDrivers = async () => {
  console.log('[fas fa-user-tie] Creating drivers...');
  
  const companies = await readCollection('companies');
  const drivers = [];
  
  companies.forEach((company, companyIndex) => {
    const driverCount = companyIndex === 0 ? 15 : companyIndex === 1 ? 12 : 10;
    
    for (let i = 0; i < driverCount; i++) {
      drivers.push({
        companyId: company.id,
        portalUserId: null, // Will be linked to portal users
        nationalId: `1199${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        licenseNumber: generateLicensePlate(),
        firstName: generateRwandanName().split(' ')[0],
        lastName: generateRwandanName().split(' ')[1],
        phone: generateRwandanPhone(),
        email: `driver${companyIndex}${i}@onthego.rw`,
        status: 'active',
        hireDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        totalTrips: Math.floor(Math.random() * 500),
        totalKilometers: Math.floor(Math.random() * 25000),
        rating: 3.5 + Math.random() * 1.5,
        incidents: Math.floor(Math.random() * 3),
        certifications: ['Commercial License', 'Defensive Driving'],
        emergencyContact: {
          name: generateRwandanName(),
          phone: generateRwandanPhone(),
          relationship: 'Spouse'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });
  
  for (const driver of drivers) {
    await insertOne('drivers', driver);
  }
  
  console.log(`[fas fa-check-circle] Created ${drivers.length} drivers`);
};

/**
 * Create portal users
 */
const createPortalUsers = async () => {
  console.log('[fas fa-users] Creating portal users...');
  
  const companies = await readCollection('companies');
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const portalUsers = [];
  
  // Super Admin (already created in server startup)
  // This is handled in index.js
  
  // Company Admins
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    portalUsers.push({
      username: `admin${company.name.toLowerCase().replace(/\s+/g, '')}`,
      password: hashedPassword,
      role: config.ROLES.ADMIN,
      companyId: company.id,
      permissions: ['company_read', 'company_write', 'staff_read', 'staff_write', 'financial_read', 'financial_write', 'routes_read', 'routes_write', 'trips_read', 'trips_write'],
      status: 'active',
      forcePasswordChange: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // Managers
  for (let i = 0; i < companies.length * 2; i++) {
    const company = companies[i % companies.length];
    portalUsers.push({
      username: `manager${i + 1}`,
      password: hashedPassword,
      role: config.ROLES.MANAGER,
      companyId: company.id,
      permissions: ['routes_read', 'routes_write', 'trips_read', 'trips_write', 'drivers_read', 'drivers_write'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // Drivers
  for (let i = 0; i < companies.length * 4; i++) {
    const company = companies[i % companies.length];
    portalUsers.push({
      username: `driver${i + 1}`,
      password: hashedPassword,
      role: config.ROLES.DRIVER,
      companyId: company.id,
      permissions: ['trips_read', 'location_update'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // Workers
  for (let i = 0; i < companies.length * 3; i++) {
    const company = companies[i % companies.length];
    portalUsers.push({
      username: `worker${i + 1}`,
      password: hashedPassword,
      role: config.ROLES.WORKER,
      companyId: company.id,
      permissions: ['trips_read', 'boarding_manage'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  for (const user of portalUsers) {
    await insertOne('portalUsers', user);
  }
  
  console.log(`[fas fa-check-circle] Created ${portalUsers.length} portal users`);
  
  // Print credentials for easy access
  console.log('\n[fas fa-shield-alt] PORTAL USER CREDENTIALS:');
  console.log('=====================================');
  console.log('Super Admin: superadmin / OnTheGo@2026!');
  console.log('\nCompany Admins:');
  portalUsers.filter(u => u.role === config.ROLES.ADMIN).forEach(user => {
    console.log(`${user.username} / password123`);
  });
  console.log('\nManagers:');
  portalUsers.filter(u => u.role === config.ROLES.MANAGER).slice(0, 3).forEach(user => {
    console.log(`${user.username} / password123`);
  });
  console.log('\nDrivers:');
  portalUsers.filter(u => u.role === config.ROLES.DRIVER).slice(0, 3).forEach(user => {
    console.log(`${user.username} / password123`);
  });
  console.log('\nWorkers:');
  portalUsers.filter(u => u.role === config.ROLES.WORKER).slice(0, 3).forEach(user => {
    console.log(`${user.username} / password123`);
  });
  console.log('=====================================');
};

/**
 * Create buses
 */
const createBuses = async () => {
  console.log('🚌 Creating buses...');
  
  const companies = await readCollection('companies');
  const busModels = ['Toyota Coaster', 'Higer Bus', 'Yutong Bus', 'Isuzu Elf', 'Nissan Civilian'];
  const fuelTypes = ['petrol', 'diesel', 'diesel', 'petrol'];
  
  const buses = [];
  
  companies.forEach((company, companyIndex) => {
    const busCount = companyIndex === 0 ? 12 : companyIndex === 1 ? 10 : 8;
    
    for (let i = 0; i < busCount; i++) {
      buses.push({
        companyId: company.id,
        plateNumber: generateLicensePlate(),
        model: busModels[Math.floor(Math.random() * busModels.length)],
        capacity: [25, 30, 35, 40][Math.floor(Math.random() * 4)],
        year: 2018 + Math.floor(Math.random() * 6),
        status: Math.random() > 0.1 ? 'active' : 'maintenance',
        currentDriverId: null,
        currentTripId: null,
        currentLocation: { lat: null, lng: null, lastUpdated: null },
        fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
        features: ['AC', 'WiFi'],
        insuranceExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        inspectionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        maintenanceHistory: [],
        totalTrips: Math.floor(Math.random() * 1000),
        totalKilometers: Math.floor(Math.random() * 50000),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });
  
  for (const bus of buses) {
    await insertOne('buses', bus);
  }
  
  console.log(`[fas fa-check-circle] Created ${buses.length} buses`);
};

/**
 * Create routes
 */
const createRoutes = async () => {
  console.log('[fas fa-road] Creating routes...');
  
  const companies = await readCollection('companies');
  
  const routes = [
    // Kigali Express Bus Routes
    {
      companyId: companies[0].id,
      name: 'Nyabugogo → Kimironko',
      code: 'R001',
      startStationId: 'station-1',
      endStationId: 'station-3',
      waypoints: [
        { stationId: 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-2', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: 'station-3', order: 2, estimatedMinutesFromStart: 30 }
      ],
      distanceKm: 12.5,
      estimatedDurationMinutes: 45,
      baseFare: 500,
      expressMultiplier: 1.5,
      peakHourMultiplier: 1.2,
      status: 'active',
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      operatingHours: { start: '05:30', end: '22:00' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      companyId: companies[0].id,
      name: 'Nyabugogo → Remera',
      code: 'R002',
      startStationId: 'station-1',
      endStationId: 'station-4',
      waypoints: [
        { stationId: 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-4', order: 1, estimatedMinutesFromStart: 25 }
      ],
      distanceKm: 8.5,
      estimatedDurationMinutes: 35,
      baseFare: 400,
      expressMultiplier: 1.5,
      peakHourMultiplier: 1.2,
      status: 'active',
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      operatingHours: { start: '05:30', end: '22:00' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      companyId: companies[0].id,
      name: 'CBD → Kicukiro',
      code: 'R003',
      startStationId: 'station-2',
      endStationId: 'station-5',
      waypoints: [
        { stationId: 'station-2', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-5', order: 1, estimatedMinutesFromStart: 20 }
      ],
      distanceKm: 10.2,
      estimatedDurationMinutes: 40,
      baseFare: 450,
      expressMultiplier: 1.5,
      peakHourMultiplier: 1.2,
      status: 'active',
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      operatingHours: { start: '05:30', end: '22:00' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  for (const route of routes) {
    await insertOne('routes', route);
  }
  
  console.log(`[fas fa-check-circle] Created ${routes.length} routes`);
};

/**
 * Create trips
 */
const createTrips = async () => {
  console.log('[fas fa-map-signs] Creating trips...');
  
  const companies = await readCollection('companies');
  const buses = await readCollection('buses');
  const routes = await readCollection('routes');
  const drivers = await readCollection('drivers');
  
  const trips = [];
  const now = new Date();
  
  // Create trips for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const tripDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    routes.forEach((route, routeIndex) => {
      const availableBuses = buses.filter(bus => 
        bus.companyId === route.companyId && bus.status === 'active'
      );
      const availableDrivers = drivers.filter(driver => 
        driver.companyId === route.companyId && driver.status === 'active'
      );
      
      if (availableBuses.length > 0 && availableDrivers.length > 0) {
        const bus = availableBuses[Math.floor(Math.random() * availableBuses.length)];
        const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
        
        // Create 2-3 trips per route per day
        const tripsPerRoute = Math.floor(Math.random() * 2) + 2;
        
        for (let tripIndex = 0; tripIndex < tripsPerRoute; tripIndex++) {
          const departureHour = 6 + Math.floor(Math.random() * 12); // 6 AM - 6 PM
          const departureTime = new Date(tripDate);
          departureTime.setHours(departureHour, departureTime.getMinutes() + (tripIndex * 30));
          
          const arrivalTime = new Date(departureTime.getTime() + route.estimatedDurationMinutes * 60 * 1000);
          
          trips.push({
            companyId: route.companyId,
            routeId: route.id,
            busId: bus.id,
            driverId: driver.id,
            workerId: null,
            status: Math.random() > 0.7 ? 'completed' : 'scheduled',
            scheduledDeparture: departureTime.toISOString(),
            actualDeparture: Math.random() > 0.7 ? departureTime.toISOString() : null,
            scheduledArrival: arrivalTime.toISOString(),
            actualArrival: Math.random() > 0.7 ? arrivalTime.toISOString() : null,
            currentLocation: Math.random() > 0.7 ? 
              { lat: -1.9536 + (Math.random() - 0.5) * 0.1, lng: 30.0606 + (Math.random() - 0.5) * 0.1, lastUpdated: new Date().toISOString() } : 
              { lat: null, lng: null, lastUpdated: null },
            currentStopIndex: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
            passengerCount: Math.random() > 0.7 ? Math.floor(Math.random() * bus.capacity) : 0,
            maxPassengers: bus.capacity,
            fare: route.baseFare,
            totalRevenue: Math.random() > 0.7 ? route.baseFare * Math.floor(Math.random() * bus.capacity) : 0,
            delayReason: null,
            cancellationReason: null,
            notes: Math.random() > 0.7 ? 'Trip completed successfully' : '',
            checkpoints: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    });
  }
  
  // Add some completed trips from the past 30 days
  for (let i = 0; i < 50; i++) {
    const pastDate = new Date(now.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
    const route = routes && routes.length > 0 ? routes[Math.floor(Math.random() * routes.length)] : { id: 'route-1', companyId: 'company-1' };
    const bus = buses[Math.floor(Math.random() * buses.length)];
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    
    trips.push({
      companyId: route.companyId,
      routeId: route.id,
      busId: bus.id,
      driverId: driver.id,
      workerId: null,
      status: 'completed',
      scheduledDeparture: pastDate.toISOString(),
      actualDeparture: pastDate.toISOString(),
      scheduledArrival: new Date(pastDate.getTime() + route.estimatedDurationMinutes * 60 * 1000).toISOString(),
      actualArrival: new Date(pastDate.getTime() + route.estimatedDurationMinutes * 60 * 1000).toISOString(),
      currentLocation: { lat: null, lng: null, lastUpdated: null },
      currentStopIndex: 3,
      passengerCount: Math.floor(Math.random() * bus.capacity),
      maxPassengers: bus.capacity,
      fare: route.baseFare,
      totalRevenue: route.baseFare * Math.floor(Math.random() * bus.capacity),
      delayReason: null,
      cancellationReason: null,
      notes: 'Completed trip',
      checkpoints: [],
      createdAt: pastDate.toISOString(),
      updatedAt: pastDate.toISOString()
    });
  }
  
  for (const trip of trips) {
    await insertOne('trips', trip);
  }
  
  console.log(`[fas fa-check-circle] Created ${trips.length} trips`);
};

/**
 * Create content
 */
const createContent = async () => {
  console.log('[fas fa-file-alt] Creating content...');
  
  const content = {
    hero: {
      title: 'Move Smarter Across Kigali',
      subtitle: 'Track your bus in real-time',
      ctaText: 'Start Tracking',
      backgroundImage: null
    },
    announcements: [
      {
        id: 'ann-1',
        title: 'New Express Routes Launched',
        message: 'We now offer express services between major Kigali locations with reduced travel time.',
        type: 'info',
        severity: 'low',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ann-2',
        title: 'Holiday Schedule Changes',
        message: 'Special holiday schedules will be in effect from December 20th to January 5th.',
        type: 'warning',
        severity: 'medium',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ],
    promotionalBanner: {
      enabled: true,
      text: '20% OFF on all express routes this week!',
      backgroundColor: '#22c55e',
      textColor: '#ffffff'
    },
    contactInfo: {
      phone: '+250788123456',
      email: 'hello@onthego.rw',
      whatsapp: '+250788123456'
    },
    appDownloadLinks: {
      android: 'https://play.google.com/store/apps/details?id=rw.onthego.app',
      ios: 'https://apps.apple.com/rw/app/onthego/id123456789'
    },
    featuredRoutes: ['R001', 'R002', 'R003'],
    maintenanceMode: {
      enabled: false,
      message: ''
    },
    lastUpdatedBy: 'system',
    lastUpdatedAt: new Date().toISOString()
  };
  
  await insertOne('content', content);
  
  console.log('[fas fa-check-circle] Created initial content');
};

/**
 * Create settings
 */
const createSettings = async () => {
  console.log('[fas fa-cog] Creating settings...');
  
  const settings = {
    blacklistedTokens: [],
    systemMaintenance: false,
    maintenanceMessage: '',
    rateLimitEnabled: true,
    auditLogEnabled: true,
    autoSyncEnabled: true,
    syncInterval: 30000,
    maxLoginAttempts: 5,
    sessionTimeout: 28800000, // 8 hours
    passwordMinLength: 8,
    requireStrongPassword: true,
    enableTwoFactorAuth: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await insertOne('settings', settings);
  
  console.log('[fas fa-check-circle] Created system settings');
};

/**
 * Main seed function
 */
const seedAllData = async () => {
  console.log('[fas fa-seedling] Starting data seeding...');
  console.log('=====================================');
  
  try {
    // Initialize data directory first
    await initializeDataDirectory();
    
    await createCompanies();
    await createDrivers();
    await createPortalUsers();
    await createBuses();
    await createMinimalRoutes(); // Use minimal routes
    await createTrips();
    await createContent();
    await createSettings();
    await createMinimalPricing(); // Use minimal pricing
    
    console.log('=====================================');
    console.log('[fas fa-trophy] Data seeding completed successfully!');
    console.log('[fas fa-chart-bar] System is ready for use with realistic demo data');
    console.log('[fas fa-shield-alt] Use the printed credentials above to access the portals');
    
  } catch (error) {
    console.error('[fas fa-times-circle] Error during data seeding:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedAllData();
}

module.exports = {
  seedAllData,
  createCompanies,
  createPortalUsers,
  createBuses,
  createRoutes,
  createTrips,
  createContent,
  createSettings
};

/**
 * ============================================================
 * REAL RWANDAN ROUTES CREATION
 * ============================================================
 * Creates realistic Rwandan bus routes based on the provided pricing data
 */

const { bulkInsert } = require('../db/fileStore');
const { getCollection } = require('../state');

/**
 * Create real Rwandan bus routes with proper codes
 */
const createRealRoutes = async () => {
  console.log('[fas fa-road] Creating real Rwandan routes...');
  
  const companies = await getCollection('companies');
  const stations = await getCollection('stations');
  
  // Create station mapping
  const stationMap = {};
  if (stations.length === 0) {
    // Create basic stations if none exist
    const basicStations = [
      { id: 'nyabugogo', name: 'Nyabugogo Taxi Park', location: 'Kigali City' },
      { id: 'remera', name: 'Remera Taxi Park', location: 'Kigali City' },
      { id: 'sonatubes', name: 'Sonatubes', location: 'Kigali City' },
      { id: 'rwandex', name: 'Rwandex', location: 'Kigali City' },
      { id: 'cbd', name: 'CBD', location: 'Kigali City' },
      { id: 'kabeza', name: 'Kabeza', location: 'Kigali City' },
      { id: 'kanombe', name: 'Kanombe', location: 'Kigali City' },
      { id: 'airport', name: 'Kigali Airport', location: 'Kigali City' },
      { id: 'kacyiru', name: 'Kacyiru', location: 'Kigali City' },
      { id: 'nyanza', name: 'Nyanza Taxi Park', location: 'Kigali City' },
      { id: 'kicukiro', name: 'Kicukiro Centre', location: 'Kigali City' },
      { id: 'kimironko', name: 'Kimironko Taxi Park', location: 'Kigali City' },
      { id: 'nyamirambo', name: 'Nyamirambo', location: 'Kigali City' },
      { id: 'down-town', name: 'Down Town Taxi Park', location: 'Kigali City' },
      { id: 'gikondo', name: 'Gikondo (Nyenyeli)', location: 'Kigali City' },
      { id: 'bwerankoli', name: 'Bwerankoli', location: 'Kigali City' },
      { id: 'kabuga', name: 'Kabuga', location: 'Kigali City' },
      { id: 'mulindi', name: 'Mulindi', location: 'Kigali City' },
      { id: 'masaka', name: 'Masaka', location: 'Kigali City' },
      { id: 'gasogi', name: 'Gasogi (Cyaruzinge)', location: 'Kigali City' }
    ];
    
    for (const station of basicStations) {
      stationMap[station.id] = station.id;
    }
  } else {
    stations.forEach(station => {
      stationMap[station.name.toLowerCase().replace(/\s+/g, '-')] = station.id;
    });
  }
  
  const routes = [
    // ZONE 1 - Remera based routes
    {
      code: '101',
      name: 'Remera Taxi Park - Sonatubes - Rwandex - CBD',
      startStationId: 'station-remera',
      endStationId: 'station-cbd',
      waypoints: [
        { stationId: 'station-remera', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-sonatubes', order: 1, estimatedMinutesFromStart: 10 },
        { stationId: 'station-rwandex', order: 2, estimatedMinutesFromStart: 20 },
        { stationId: 'station-cbd', order: 3, estimatedMinutesFromStart: 30 }
      ],
      estimatedDurationMinutes: 30,
      distanceKm: 12,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '102',
      name: 'Kabuga - Mulindi - Remera - Sonatubes - Rwandex - Nyabugogo Taxi Park',
      startStation: stationMap['kabuga'] || 'station-5',
      endStation: stationMap['nyabugogo'] || 'station-6',
      waypoints: [
        { stationId: stationMap['kabuga'] || 'station-5', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['mulindi'] || 'station-7', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['remera'] || 'station-1', order: 2, estimatedMinutesFromStart: 25 },
        { stationId: stationMap['sonatubes'] || 'station-3', order: 3, estimatedMinutesFromStart: 35 },
        { stationId: stationMap['rwandex'] || 'station-4', order: 4, estimatedMinutesFromStart: 45 },
        { stationId: stationMap['nyabugogo'] || 'station-6', order: 5, estimatedMinutesFromStart: 55 }
      ],
      estimatedDurationMinutes: 55,
      distanceKm: 18,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '103',
      name: 'Rubilizi - Kabeza - Remera - Sonatubes - Rwandex - CBD',
      startStation: stationMap['kabeza'] || 'station-8',
      endStation: stationMap['cbd'] || 'station-2',
      waypoints: [
        { stationId: stationMap['kabeza'] || 'station-8', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['remera'] || 'station-1', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['sonatubes'] || 'station-3', order: 2, estimatedMinutesFromStart: 25 },
        { stationId: stationMap['rwandex'] || 'station-4', order: 3, estimatedMinutesFromStart: 35 },
        { stationId: stationMap['cbd'] || 'station-2', order: 4, estimatedMinutesFromStart: 45 }
      ],
      estimatedDurationMinutes: 45,
      distanceKm: 15,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '104',
      name: 'Kibaya - Kanombe - Airport - Remera - Sonatubes - Rwandex - CBD',
      startStation: stationMap['kanombe'] || 'station-9',
      endStation: stationMap['cbd'] || 'station-2',
      waypoints: [
        { stationId: stationMap['kanombe'] || 'station-9', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['airport'] || 'station-10', order: 1, estimatedMinutesFromStart: 10 },
        { stationId: stationMap['remera'] || 'station-1', order: 2, estimatedMinutesFromStart: 20 },
        { stationId: stationMap['sonatubes'] || 'station-3', order: 3, estimatedMinutesFromStart: 30 },
        { stationId: stationMap['rwandex'] || 'station-4', order: 4, estimatedMinutesFromStart: 40 },
        { stationId: stationMap['cbd'] || 'station-2', order: 5, estimatedMinutesFromStart: 50 }
      ],
      estimatedDurationMinutes: 50,
      distanceKm: 18,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '105',
      name: 'Remera Taxi Park - Chez Lando - Kacyiru - Nyabugogo Taxi Park',
      startStation: stationMap['remera'] || 'station-1',
      endStation: stationMap['nyabugogo'] || 'station-6',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['kacyiru'] || 'station-11', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['nyabugogo'] || 'station-6', order: 2, estimatedMinutesFromStart: 25 }
      ],
      estimatedDurationMinutes: 25,
      distanceKm: 10,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '106',
      name: 'Remera Taxi Park - 15 - Ndera - Musave',
      startStation: stationMap['remera'] || 'station-1',
      endStation: 'station-106',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-106-1', order: 1, estimatedMinutesFromStart: 20 },
        { stationId: 'station-106-2', order: 2, estimatedMinutesFromStart: 35 },
        { stationId: 'station-106', order: 3, estimatedMinutesFromStart: 45 }
      ],
      estimatedDurationMinutes: 45,
      distanceKm: 15,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '107',
      name: 'Remera Taxi Park - Mulindi - Masaka',
      startStation: stationMap['remera'] || 'station-1',
      endStation: stationMap['masaka'] || 'station-12',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['mulindi'] || 'station-7', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['masaka'] || 'station-12', order: 2, estimatedMinutesFromStart: 30 }
      ],
      estimatedDurationMinutes: 30,
      distanceKm: 12,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '108',
      name: 'Remera Taxi Park - Sonatubes - Nyanza Taxi Park',
      startStation: stationMap['remera'] || 'station-1',
      endStation: stationMap['nyanza'] || 'station-13',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['sonatubes'] || 'station-3', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['nyanza'] || 'station-13', order: 2, estimatedMinutesFromStart: 25 }
      ],
      estimatedDurationMinutes: 25,
      distanceKm: 10,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '109',
      name: 'Remera Taxi Park - Sonatubes - Rwandex - Gikondo (Nyenyeli) - Bwerankoli',
      startStation: stationMap['remera'] || 'station-1',
      endStation: stationMap['bwerankoli'] || 'station-14',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['sonatubes'] || 'station-3', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['rwandex'] || 'station-4', order: 2, estimatedMinutesFromStart: 25 },
        { stationId: stationMap['gikondo'] || 'station-15', order: 3, estimatedMinutesFromStart: 35 },
        { stationId: stationMap['bwerankoli'] || 'station-14', order: 4, estimatedMinutesFromStart: 45 }
      ],
      estimatedDurationMinutes: 45,
      distanceKm: 15,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '110',
      name: 'Kabuga Taxi Park - MASAKA Hospital - Masaka Market',
      startStation: stationMap['kabuga'] || 'station-5',
      endStation: stationMap['masaka'] || 'station-12',
      waypoints: [
        { stationId: stationMap['kabuga'] || 'station-5', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-110-1', order: 1, estimatedMinutesFromStart: 10 },
        { stationId: stationMap['masaka'] || 'station-12', order: 2, estimatedMinutesFromStart: 20 }
      ],
      estimatedDurationMinutes: 20,
      distanceKm: 8,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '111',
      name: 'Kabuga - Mulindi - Remera Taxi Park',
      startStation: stationMap['kabuga'] || 'station-5',
      endStation: stationMap['remera'] || 'station-1',
      waypoints: [
        { stationId: stationMap['kabuga'] || 'station-5', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['mulindi'] || 'station-7', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['remera'] || 'station-1', order: 2, estimatedMinutesFromStart: 25 }
      ],
      estimatedDurationMinutes: 25,
      distanceKm: 10,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '112',
      name: 'Remera Taxi Park - Sonatubes - Rwandex - Nyabugogo Taxi Park',
      startStation: stationMap['remera'] || 'station-1',
      endStation: stationMap['nyabugogo'] || 'station-6',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['sonatubes'] || 'station-3', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['rwandex'] || 'station-4', order: 2, estimatedMinutesFromStart: 25 },
        { stationId: stationMap['nyabugogo'] || 'station-6', order: 3, estimatedMinutesFromStart: 35 }
      ],
      estimatedDurationMinutes: 35,
      distanceKm: 12,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '113',
      name: 'Busanza - Rubilizi - Kabeza - Remera Taxi Park',
      startStation: 'station-113',
      endStation: stationMap['remera'] || 'station-1',
      waypoints: [
        { stationId: 'station-113', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-113-1', order: 1, estimatedMinutesFromStart: 10 },
        { stationId: stationMap['kabeza'] || 'station-8', order: 2, estimatedMinutesFromStart: 20 },
        { stationId: stationMap['remera'] || 'station-1', order: 3, estimatedMinutesFromStart: 30 }
      ],
      estimatedDurationMinutes: 30,
      distanceKm: 12,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '114',
      name: 'Kibaya - Kanombe - Airport - Remera Taxi Park',
      startStation: stationMap['kanombe'] || 'station-9',
      endStation: stationMap['remera'] || 'station-1',
      waypoints: [
        { stationId: stationMap['kanombe'] || 'station-9', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['airport'] || 'station-10', order: 1, estimatedMinutesFromStart: 10 },
        { stationId: stationMap['remera'] || 'station-1', order: 2, estimatedMinutesFromStart: 20 }
      ],
      estimatedDurationMinutes: 20,
      distanceKm: 8,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '115',
      name: 'Remera Taxi Park - Airport - Busanza',
      startStation: stationMap['remera'] || 'station-1',
      endStation: 'station-113',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['airport'] || 'station-10', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: 'station-113', order: 2, estimatedMinutesFromStart: 25 }
      ],
      estimatedDurationMinutes: 25,
      distanceKm: 10,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '120',
      name: 'Remera Taxi Park - 12 - Special Economic Zone',
      startStation: stationMap['remera'] || 'station-1',
      endStation: 'station-120',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-120-1', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: 'station-120', order: 2, estimatedMinutesFromStart: 25 }
      ],
      estimatedDurationMinutes: 25,
      distanceKm: 10,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '121',
      name: 'Remera Taxi Park - 12 - Masoro (UAAC)',
      startStation: stationMap['remera'] || 'station-1',
      endStation: 'station-121',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: 'station-121-1', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: 'station-121', order: 2, estimatedMinutesFromStart: 25 }
      ],
      estimatedDurationMinutes: 25,
      distanceKm: 10,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    },
    {
      code: '122',
      name: 'Remera - Mulindi - Gasogi (Cyaruzinge)',
      startStation: stationMap['remera'] || 'station-1',
      endStation: stationMap['gasogi'] || 'station-16',
      waypoints: [
        { stationId: stationMap['remera'] || 'station-1', order: 0, estimatedMinutesFromStart: 0 },
        { stationId: stationMap['mulindi'] || 'station-7', order: 1, estimatedMinutesFromStart: 15 },
        { stationId: stationMap['gasogi'] || 'station-16', order: 2, estimatedMinutesFromStart: 30 }
      ],
      estimatedDurationMinutes: 30,
      distanceKm: 12,
      companyId: companies[0]?.id || 'company-1',
      isActive: true
    }
  ];
  
  const createdRoutes = await bulkInsert('routes', routes);
  
  console.log(`[fas fa-check-circle] Created ${createdRoutes.length} real Rwandan routes`);
  
  return createdRoutes;
};

module.exports = {
  createRealRoutes
};

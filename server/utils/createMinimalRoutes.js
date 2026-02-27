/**
 * ============================================================
 * MINIMAL ROUTES CREATION
 * ============================================================
 */

const { bulkInsert } = require('../db/fileStore');

const createMinimalRoutes = async () => {
  console.log('[fas fa-road] Creating minimal routes...');
  
  const routes = [
    { code: '101', name: 'Remera - Sonatubes - Rwandex - CBD', fare: 220, zone: 1 },
    { code: '102', name: 'Kabuga - Mulindi - Remera - Sonatubes - Rwandex - Nyabugogo', fare: 517, zone: 1 },
    { code: '103', name: 'Rubilizi - Kabeza - Remera - Sonatubes - Rwandex - CBD', fare: 341, zone: 1 },
    { code: '104', name: 'Kibaya - Kanombe - Airport - Remera - Sonatubes - Rwandex - CBD', fare: 363, zone: 1 },
    { code: '105', name: 'Remera - Chez Lando - Kacyiru - Nyabugogo', fare: 253, zone: 1 },
    { code: '201', name: 'St. Joseph – Kikukiro Centre de Santé – Sonatubes – Rwandex - CBD', fare: 286, zone: 2 },
    { code: '203', name: 'Nyanza - Gatenga Magerwa - Down Town Taxi Park', fare: 277, zone: 2 },
    { code: '301', name: 'Kinyinya - Nyarutarama - RDB - Kimihurura -Down Town Taxi Park', fare: 286, zone: 3 },
    { code: '401', name: 'Nyamirambo (Ryanyuma) - Rafiki - Camp Kigali -CBD', fare: 176, zone: 4 }
  ];
  
  const createdRoutes = await bulkInsert('routes', routes.map(route => ({
    ...route,
    companyId: 'company-1',
    isActive: true,
    estimatedDurationMinutes: Math.floor(Math.random() * 60) + 30,
    distanceKm: Math.floor(Math.random() * 20) + 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })));
  
  console.log(`[fas fa-check-circle] Created ${createdRoutes.length} routes`);
  return createdRoutes;
};

module.exports = {
  createMinimalRoutes
};

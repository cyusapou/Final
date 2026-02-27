/**
 * ============================================================
 * SIMPLE ROUTES CREATION
 * ============================================================
 * Creates basic routes with proper codes for pricing
 */

const { bulkInsert } = require('../db/fileStore');
const { getCollection } = require('../state');

/**
 * Create simple routes with proper codes
 */
const createSimpleRoutes = async () => {
  console.log('[fas fa-road] Creating simple routes...');
  
  const companies = await getCollection('companies');
  
  const routes = [
    // ZONE 1
    { code: '101', name: 'Remera - Sonatubes - Rwandex - CBD', fare: 220, zone: 1 },
    { code: '102', name: 'Kabuga - Mulindi - Remera - Sonatubes - Rwandex - Nyabugogo', fare: 517, zone: 1 },
    { code: '103', name: 'Rubilizi - Kabeza - Remera - Sonatubes - Rwandex - CBD', fare: 341, zone: 1 },
    { code: '104', name: 'Kibaya - Kanombe - Airport - Remera - Sonatubes - Rwandex - CBD', fare: 363, zone: 1 },
    { code: '105', name: 'Remera - Chez Lando - Kacyiru - Nyabugogo', fare: 253, zone: 1 },
    { code: '106', name: 'Remera - 15 - Ndera - Musave', fare: 194, zone: 1 },
    { code: '107', name: 'Remera - Mulindi - Masaka', fare: 273, zone: 1 },
    { code: '108', name: 'Remera - Sonatubes - Nyanza', fare: 185, zone: 1 },
    { code: '109', name: 'Remera - Sonatubes - Rwandex - Gikondo - Bwerankoli', fare: 219, zone: 1 },
    { code: '110', name: 'Kabuga - MASAKA Hospital - Masaka Market', fare: 110, zone: 1 },
    { code: '111', name: 'Kabuga - Mulindi - Remera', fare: 297, zone: 1 },
    { code: '112', name: 'Remera - Sonatubes - Rwandex - Nyabugogo', fare: 220, zone: 1 },
    { code: '113', name: 'Busanza - Rubilizi - Kabeza - Remera', fare: 165, zone: 1 },
    { code: '114', name: 'Kibaya - Kanombe - Airport - Remera', fare: 163, zone: 1 },
    { code: '115', name: 'Remera - Airport - Busanza', fare: 250, zone: 1 },
    { code: '120', name: 'Remera - 12 - Special Economic Zone', fare: 212, zone: 1 },
    { code: '121', name: 'Remera - 12 - Masoro (UAAC)', fare: 209, zone: 1 },
    { code: '122', name: 'Remera - Mulindi - Gasogi (Cyaruzinge)', fare: 310, zone: 1 },
    
    // ZONE 2
    { code: '201', name: 'St. Joseph – Kikukiro Centre de Santé – Sonatubes – Rwandex - CBD', fare: 286, zone: 2 },
    { code: '203', name: 'Nyanza - Gatenga Magerwa - Down Town Taxi Park', fare: 277, zone: 2 },
    { code: '204', name: 'Nyanza - Zion Temple – Rwandex - Nyabugogo Taxi Park', fare: 299, zone: 2 },
    { code: '205', name: 'Bwerankoli – Gikondo (Nyenyeli) – Rwampara – Rugunga - Down Town Taxi Park', fare: 268, zone: 2 },
    { code: '206', name: 'Bwerankoli – Gikondo (Nyenyeli) – Rwampara – Rugunga - Nyabugogo Taxi Park', fare: 271, zone: 2 },
    { code: '207', name: 'Nyanza-Kicukiro Centre-Kagarama-Muyange', fare: 208, zone: 2 },
    { code: '208', name: 'Nyanza Taxi Park - Gahanga', fare: 200, zone: 2 },
    { code: '210', name: 'Nyanza-Kicukiro Centre-Gatenga-MAGERWA-Bwerankoli', fare: 253, zone: 2 },
    { code: '211', name: 'Nyanza Bus Park – Kicukiro Centre– Prince House-Chez Lando-Kacyiru', fare: 259, zone: 2 },
    { code: '212', name: 'St. Joseph – Kicukiro Centre de Santé – Sonatubes – Rwandex - Nyabugogo Taxi Park', fare: 272, zone: 2 },
    { code: '213', name: 'Nyanza Taxi Park- Kicukiro Centre - Prince House – Chez Lando – Stadium – Kimironko Taxi Park', fare: 231, zone: 2 },
    { code: '214', name: 'Nyanza Taxi Park-Gatenga Magerwa -Nyabugogo Taxi Park', fare: 299, zone: 2 },
    { code: '215', name: 'Bwerankoli – Gikindo (Nyenyeli) – Rwandex – Sonatubes – Prince House – Chez Lando – Stadium – Kimironko Taxi Park', fare: 289, zone: 2 },
    
    // ZONE 3
    { code: '301', name: 'Kinyinya - Nyarutarama - RDB - Kimihurura -Down Town Taxi Park', fare: 286, zone: 3 },
    { code: '302', name: 'Kimironko-Stadium - Chez Lando - Kimihurura - CBD', fare: 253, zone: 3 },
    { code: '303', name: 'Batsinda - Kagugu - Gakiriro - Kinamba - Down Town Taxi Park', fare: 216, zone: 3 },
    { code: '304', name: 'Kacyiru - Kimihurura - Down Town Taxi Park', fare: 264, zone: 3 },
    { code: '305', name: 'Kimironko taxi park - Stadium - Chez Lando - Kacyiru - Nyabugogo Taxi Park', fare: 264, zone: 3 },
    { code: '306', name: 'Kimironko Taxi Park - Zindiro - Masizi - Birembo', fare: 216, zone: 3 },
    { code: '307', name: 'Kimironko Taxi Park-Zindiro-AZAM Roundabout-KSEZ', fare: 217, zone: 3 },
    { code: '308', name: 'AZAM Roundabout-Contrôle Technique-Chez Lando - Kimihurura - CBD', fare: 341, zone: 3 },
    { code: '309', name: 'Kimironko Taxi Park- Kibagabaga - Kinyinya', fare: 216, zone: 3 },
    { code: '310', name: 'Batsinda - Kagugu - Gakiriro - Kinamba - Nyabugogo Taxi Park', fare: 216, zone: 3 },
    { code: '311', name: 'Kagugu - Bel Etoile - ULK - Kinamba - Nyabugogo Taxi Park', fare: 216, zone: 3 },
    { code: '313', name: 'Kagugu - Bel Etoile - ULK - Kinamba - Down Town Taxi Park', fare: 216, zone: 3 },
    { code: '314', name: 'Nyabugogo Taxi Park - Kinamba - UTEXRWA - Kibagabaga-Kimironko', fare: 242, zone: 3 },
    { code: '315', name: 'Kinyinya - Utexrwa - Kinamba - Nyabugogo Taxi Park', fare: 275, zone: 3 },
    { code: '316', name: 'AZAM Roundabout - Kimironko Taxi Park', fare: 108, zone: 3 },
    { code: '317', name: 'Kinyinya - UTEXRWA - Kinamba - Down Town Taxi Park', fare: 244, zone: 3 },
    { code: '318', name: 'Batsinda - Kagugu - Kibagabaga - Kimironko Taxi Park', fare: 216, zone: 3 },
    { code: '321', name: 'Nyabugogo taxi park - Batsinda - Gasanze', fare: 326, zone: 3 },
    { code: '322', name: 'Kimironko Taxi Park - Mulindi - Masaka', fare: 253, zone: 3 },
    { code: '323', name: 'AZAM Roundabout - Controle Technique - Chez Lando - Kacyiru-Nyabugogo Taxi Park', fare: 352, zone: 3 },
    { code: '325', name: 'Kabuga - Kigali Parent School - Kimironko Taxi Park', fare: 297, zone: 3 },
    
    // ZONE 4
    { code: '401', name: 'Nyamirambo (Ryanyuma) - Rafiki - Camp Kigali -CBD', fare: 176, zone: 4 },
    { code: '402', name: 'Nyamirambo (Ryanyuma) - Kimisagara-Nyabugogo-Down Town Taxi park- Down Town Taxi Park', fare: 220, zone: 4 },
    { code: '403', name: 'Nyacyonga - Karuruma-Muhima - Down Town Taxi Park', fare: 297, zone: 4 },
    { code: '404', name: 'Bishenyi - Ruyenzi-Giticyinyoni - Nyabugogo', fare: 272, zone: 4 },
    { code: '405', name: 'Nyamirambo- Rwarutabura - Mageragere', fare: 268, zone: 4 },
    { code: '406', name: 'Nyabugogo Taxi Park – Giticyinyoni-Nzove -Rutonde', fare: 277, zone: 4 },
    { code: '407', name: 'Nyabugogo-Karuruma - Nyacyonga', fare: 219, zone: 4 },
    { code: '408', name: 'Nyabugogo - Giticyinyoni - Kanyinya (Taba)', fare: 341, zone: 4 },
    { code: '409', name: 'Nyabugogo taxi park - Ruliba-Karama Complex School', fare: 277, zone: 4 },
    { code: '410', name: 'Nyabugogo - Giticyinyoni - Kanyinya (Taba)', fare: 277, zone: 4 },
    { code: '411', name: 'Nyabugogo Taxi Park – Giticyinyoni-Nzove -Rutonde', fare: 277, zone: 4 },
    { code: '412', name: 'Nyabugogo Taxi Park - Giticyinyoni', fare: 108, zone: 4 },
    { code: '413', name: 'Nyabugogo - Giticyinyoni - Kanyinya (Taba)', fare: 341, zone: 4 },
    { code: '414', name: 'Nyabugogo taxi park - Ruliba-Karama Complex School', fare: 222, zone: 4 },
    { code: '415', name: 'Nyabugogo - Giticyinyoni - Kanyinya (Taba)', fare: 216, zone: 4 }
  ];
  
  const createdRoutes = await bulkInsert('routes', routes.map(route => ({
    ...route,
    companyId: companies[0]?.id || 'company-1',
    isActive: true,
    estimatedDurationMinutes: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
    distanceKm: Math.floor(Math.random() * 20) + 5, // 5-25 km
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })));
  
  console.log(`[fas fa-check-circle] Created ${createdRoutes.length} routes`);
  
  return createdRoutes;
};

module.exports = {
  createSimpleRoutes
};

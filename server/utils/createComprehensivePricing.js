/**
 * ============================================================
 * COMPREHENSIVE PRICING PLANS CREATION
 * ============================================================
 * Creates pricing plans for all Rwandan bus routes based on the provided fare data
 */

const { bulkInsert } = require('../db/fileStore');
const { getCollection } = require('../state');

/**
 * Create comprehensive pricing plans for all routes
 */
const createComprehensivePricing = async () => {
  console.log('[fas fa-coins] Creating comprehensive pricing plans...');
  
  const routes = await getCollection('routes');
  
  // Create route code to ID mapping
  const routeCodeMap = {};
  routes.forEach(route => {
    routeCodeMap[route.code] = route.id;
  });
  
  // Comprehensive pricing data based on the provided fare structure
  const pricingData = [
    // ZONE 1 - Remera based routes
    { routeCode: '101', fare: 220, zone: 1, description: 'Remera Taxi Park-Sonatubes-Rwandex-CBD' },
    { routeCode: '102', fare: 517, zone: 1, description: 'Kabuga-Mulindi-Remera-Sonatubes-Rwandex-Nyabugogo Taxi Park' },
    { routeCode: '103', fare: 341, zone: 1, description: 'Rubilizi-Kabeza-Remera-Sonatubes-Rwandex-CBD' },
    { routeCode: '104', fare: 363, zone: 1, description: 'Kibaya-Kanombe MH-Airport-Remera-Sonatubes-Rwandex-CBD' },
    { routeCode: '105', fare: 253, zone: 1, description: 'Remera Taxi Park-Chez Lando-Kacyiru-Nyabugogo Taxi Park' },
    { routeCode: '106', fare: 194, zone: 1, description: 'Remera Taxi Park-15-Ndera-Musave' },
    { routeCode: '107', fare: 273, zone: 1, description: 'Remera Taxi Park-Mulindi-Masaka' },
    { routeCode: '108', fare: 185, zone: 1, description: 'Remera Taxi Park-Sonatubes-Nyanza Taxi Park' },
    { routeCode: '109', fare: 219, zone: 1, description: 'Remera Taxi Park-Sonatubes-Rwandex-Gikondo (Nyenyeli)-Bwerankoli' },
    { routeCode: '110', fare: 110, zone: 1, description: 'Kabuga Taxi Park-MASAKA Hospital-Masaka Market' },
    { routeCode: '111', fare: 297, zone: 1, description: 'Kabuga-Mulindi-Remera Taxi Park' },
    { routeCode: '112', fare: 220, zone: 1, description: 'Remera Taxi Park-Sonatubes-Rwandex-Nyabugogo Taxi Park' },
    { routeCode: '113', fare: 165, zone: 1, description: 'Busanza-Rubilizi-Kabeza-Remera Taxi Park' },
    { routeCode: '114', fare: 163, zone: 1, description: 'Kibaya-Kanombe MH-Airport-Remera Taxi Park' },
    { routeCode: '115', fare: 250, zone: 1, description: 'Remera Taxi Park-Airport-Busanza' },
    { routeCode: '120', fare: 212, zone: 1, description: 'Remera Taxi Park - 12 - Special Economic Zone' },
    { routeCode: '121', fare: 209, zone: 1, description: 'Remera Taxi Park-12 - Masoro (UAAC)' },
    { routeCode: '122', fare: 310, zone: 1, description: 'Remera - Mulindi - Gasogi (Cyaruzinge)' },
    
    // ZONE 2 - Nyanza based routes
    { routeCode: '201', fare: 286, zone: 2, description: 'St. Joseph – Kikukiro Centre de Santé – Sonatubes – Rwandex - CBD' },
    { routeCode: '203', fare: 277, zone: 2, description: 'Nyanza Taxi Park-Gatenga Magerwa - Down Town Taxi Park' },
    { routeCode: '204', fare: 299, zone: 2, description: 'Nyanza Taxi Park-Zion Temple – Rwandex - Nyabugogo Taxi Park' },
    { routeCode: '205', fare: 268, zone: 2, description: 'Bwerankoli – Gikondo (Nyenyeli) – Rwampara – Rugunga - Down Town Taxi Park' },
    { routeCode: '206', fare: 271, zone: 2, description: 'Bwerankoli – Gikondo (Nyenyeli) – Rwampara – Rugunga - Nyabugogo Taxi Park' },
    { routeCode: '207', fare: 208, zone: 2, description: 'Nyanza-Kicukiro Centre-Kagarama-Muyange' },
    { routeCode: '208', fare: 200, zone: 2, description: 'Nyanza Taxi Park - Gahanga' },
    { routeCode: '210', fare: 253, zone: 2, description: 'Nyanza-Kicukiro Centre-Gatenga-MAGERWA-Bwerankoli' },
    { routeCode: '211', fare: 259, zone: 2, description: 'Nyanza Bus Park – Kicukiro Centre– Prince House-Chez Lando-Kacyiru' },
    { routeCode: '212', fare: 272, zone: 2, description: 'St. Joseph – Kicukiro Centre de Santé – Sonatubes – Rwandex - Nyabugogo Taxi Park' },
    { routeCode: '213', fare: 231, zone: 2, description: 'Nyanza Taxi Park- Kicukiro Centre - Prince House – Chez Lando – Stadium – Kimironko Taxi Park' },
    { routeCode: '214', fare: 299, zone: 2, description: 'Nyanza Taxi Park-Gatenga Magerwa -Nyabugogo Taxi Park' },
    { routeCode: '215', fare: 289, zone: 2, description: 'Bwerankoli – Gikindo (Nyenyeli) – Rwandex – Sonatubes – Prince House – Chez Lando – Stadium – Kimironko Taxi Park' },
    
    // ZONE 3 - Kimironko based routes
    { routeCode: '301', fare: 286, zone: 3, description: 'Kinyinya - Nyarutarama - RDB - Kimihurura -Down Town Taxi Park' },
    { routeCode: '302', fare: 253, zone: 3, description: 'Kimironko-Stadium - Chez Lando - Kimihurura - CBD' },
    { routeCode: '303', fare: 216, zone: 3, description: 'Batsinda - Kagugu - Gakiriro - Kinamba - Down Town Taxi Park' },
    { routeCode: '304', fare: 264, zone: 3, description: 'Kacyiru - Kimihurura - Down Town Taxi Park' },
    { routeCode: '305', fare: 264, zone: 3, description: 'Kimironko taxi park - Stadium - Chez Lando - Kacyiru - Nyabugogo Taxi Park' },
    { routeCode: '306', fare: 216, zone: 3, description: 'Kimironko Taxi Park - Zindiro - Masizi - Birembo' },
    { routeCode: '307', fare: 217, zone: 3, description: 'Kimironko Taxi Park-Zindiro-AZAM Roundabout-KSEZ' },
    { routeCode: '308', fare: 341, zone: 3, description: 'AZAM Roundabout-Contrôle Technique-Chez Lando - Kimihurura - CBD' },
    { routeCode: '309', fare: 216, zone: 3, description: 'Kimironko Taxi Park- Kibagabaga - Kinyinya' },
    { routeCode: '310', fare: 216, zone: 3, description: 'Batsinda - Kagugu - Gakiriro - Kinamba - Nyabugogo Taxi Park' },
    { routeCode: '311', fare: 216, zone: 3, description: 'Kagugu - Bel Etoile - ULK - Kinamba - Nyabugogo Taxi Park' },
    { routeCode: '313', fare: 216, zone: 3, description: 'Kagugu - Bel Etoile - ULK - Kinamba - Down Town Taxi Park' },
    { routeCode: '314', fare: 242, zone: 3, description: 'Nyabugogo Taxi Park - Kinamba - UTEXRWA - Kibagabaga-Kimironko' },
    { routeCode: '315', fare: 275, zone: 3, description: 'Kinyinya - Utexrwa - Kinamba - Nyabugogo Taxi Park' },
    { routeCode: '316', fare: 108, zone: 3, description: 'AZAM Roundabout - Kimironko Taxi Park' },
    { routeCode: '317', fare: 244, zone: 3, description: 'Kinyinya - UTEXRWA - Kinamba - Down Town Taxi Park' },
    { routeCode: '318', fare: 216, zone: 3, description: 'Batsinda - Kagugu - Kibagabaga - Kimironko Taxi Park' },
    { routeCode: '321', fare: 326, zone: 3, description: 'Nyabugogo taxi park - Batsinda - Gasanze' },
    { routeCode: '322', fare: 253, zone: 3, description: 'Kimironko Taxi Park - Mulindi - Masaka' },
    { routeCode: '323', fare: 352, zone: 3, description: 'AZAM Roundabout - Controle Technique - Chez Lando - Kacyiru-Nyabugogo Taxi Park' },
    { routeCode: '325', fare: 297, zone: 3, description: 'Kabuga - Kigali Parent School - Kimironko Taxi Park' },
    
    // ZONE 4 - Nyamirambo based routes
    { routeCode: '401', fare: 176, zone: 4, description: 'Nyamirambo (Ryanyuma) - Rafiki - Camp Kigali -CBD' },
    { routeCode: '402', fare: 220, zone: 4, description: 'Nyamirambo (Ryanyuma) - Kimisagara-Nyabugogo-Down Town Taxi park- Down Town Taxi Park' },
    { routeCode: '403', fare: 297, zone: 4, description: 'Nyacyonga - Karuruma-Muhima - Down Town Taxi Park' },
    { routeCode: '404', fare: 272, zone: 4, description: 'Bishenyi - Ruyenzi-Giticyinyoni - Nyabugogo' },
    { routeCode: '405', fare: 268, zone: 4, description: 'Nyamirambo- Rwarutabura - Mageragere' },
    { routeCode: '406', fare: 277, zone: 4, description: 'Nyabugogo Taxi Park – Giticyinyoni-Nzove -Rutonde' },
    { routeCode: '407', fare: 219, zone: 4, description: 'Nyabugogo-Karuruma - Nyacyonga' },
    { routeCode: '408', fare: 341, zone: 4, description: 'Nyabugogo - Giticyinyoni - Kanyinya (Taba)' },
    { routeCode: '409', fare: 277, zone: 4, description: 'Nyabugogo taxi park - Ruliba-Karama Complex School' },
    { routeCode: '410', fare: 277, zone: 4, description: 'Nyabugogo - Giticyinyoni - Kanyinya (Taba)' },
    { routeCode: '411', fare: 277, zone: 4, description: 'Nyabugogo Taxi Park - Giticyinyoni-Nzove -Rutonde' },
    { routeCode: '412', fare: 108, zone: 4, description: 'Nyabugogo Taxi Park - Giticyinyoni' },
    { routeCode: '413', fare: 341, zone: 4, description: 'Nyabugogo - Giticyinyoni - Kanyinya (Taba)' },
    { routeCode: '414', fare: 222, zone: 4, description: 'Nyabugogo taxi park - Ruliba-Karama Complex School' },
    { routeCode: '415', fare: 216, zone: 4, description: 'Nyabugogo - Giticyinyoni - Kanyinya (Taba)' }
  ];
  
  // Create pricing plans with route IDs
  const pricingPlans = pricingData
    .map(pricing => {
      const routeId = routeCodeMap[pricing.routeCode];
      if (!routeId) {
        console.warn(`[fas fa-exclamation-triangle] Route ${pricing.routeCode} not found, skipping pricing plan`);
        return null;
      }
      
      return {
        routeId,
        routeCode: pricing.routeCode,
        fare: pricing.fare,
        zone: pricing.zone,
        description: pricing.description,
        currency: 'RWF',
        passengerTypes: {
          adult: pricing.fare,
          child: Math.round(pricing.fare * 0.5), // 50% discount
          student: Math.round(pricing.fare * 0.8), // 20% discount
          elderly: Math.round(pricing.fare * 0.7) // 30% discount
        },
        isActive: true,
        effectiveDate: new Date().toISOString()
      };
    })
    .filter(plan => plan !== null); // Remove null entries
  
  const createdPlans = await bulkInsert('pricingPlans', pricingPlans);
  
  console.log(`[fas fa-check-circle] Created ${createdPlans.length} comprehensive pricing plans`);
  console.log(`[fas fa-chart-bar] Pricing zones covered: Zone 1 (${createdPlans.filter(p => p.zone === 1).length}), Zone 2 (${createdPlans.filter(p => p.zone === 2).length}), Zone 3 (${createdPlans.filter(p => p.zone === 3).length}), Zone 4 (${createdPlans.filter(p => p.zone === 4).length})`);
  
  return createdPlans;
};

module.exports = {
  createComprehensivePricing
};

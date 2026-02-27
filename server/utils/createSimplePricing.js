/**
 * ============================================================
 * SIMPLE PRICING CREATION
 * ============================================================
 * Creates pricing plans directly from routes
 */

const { bulkInsert } = require('../db/fileStore');
const { getCollection } = require('../state');

/**
 * Create pricing plans from routes
 */
const createSimplePricing = async () => {
  console.log('[fas fa-coins] Creating simple pricing...');
  
  const routes = await getCollection('routes');
  
  const pricingPlans = routes.map(route => ({
    routeId: route.id,
    routeCode: route.code,
    fare: route.fare,
    zone: route.zone,
    description: route.name,
    currency: 'RWF',
    passengerTypes: {
      adult: route.fare,
      child: Math.round(route.fare * 0.5), // 50% discount
      student: Math.round(route.fare * 0.8), // 20% discount
      elderly: Math.round(route.fare * 0.7) // 30% discount
    },
    isActive: true,
    effectiveDate: new Date().toISOString()
  }));
  
  const createdPlans = await bulkInsert('pricingPlans', pricingPlans);
  
  console.log(`[fas fa-check-circle] Created ${createdPlans.length} pricing plans`);
  console.log(`[fas fa-chart-bar] Pricing zones covered: Zone 1 (${createdPlans.filter(p => p.zone === 1).length}), Zone 2 (${createdPlans.filter(p => p.zone === 2).length}), Zone 3 (${createdPlans.filter(p => p.zone === 3).length}), Zone 4 (${createdPlans.filter(p => p.zone === 4).length})`);
  
  return createdPlans;
};

module.exports = {
  createSimplePricing
};

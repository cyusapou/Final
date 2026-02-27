/**
 * ============================================================
 * MINIMAL PRICING CREATION
 * ============================================================
 */

const { bulkInsert } = require('../db/fileStore');
const { getCollection } = require('../state');

const createMinimalPricing = async () => {
  console.log('[fas fa-coins] Creating minimal pricing...');
  
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
      child: Math.round(route.fare * 0.5),
      student: Math.round(route.fare * 0.8),
      elderly: Math.round(route.fare * 0.7)
    },
    isActive: true,
    effectiveDate: new Date().toISOString()
  }));
  
  const createdPlans = await bulkInsert('pricingPlans', pricingPlans);
  
  console.log(`[fas fa-check-circle] Created ${createdPlans.length} pricing plans`);
  return createdPlans;
};

module.exports = {
  createMinimalPricing
};

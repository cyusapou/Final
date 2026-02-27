/**
 * ============================================================
 * PRICING PLANS CREATION
 * ============================================================
 * Creates pricing plans for all routes based on the provided fare structure
 */

const { bulkInsert } = require('../db/fileStore');
const { getCollection } = require('../state');
const config = require('../config');

/**
 * Create pricing plans for all routes
 */
const createPricingPlans = async () => {
  console.log('[fas fa-coins] Creating pricing plans...');
  
  const routes = await getCollection('routes');
  
  const pricingPlans = [
    // ZONE 1
    { routeId: routes.find(r => r.code === '101')?.id, fare: 220, zone: 1 },
    { routeId: routes.find(r => r.code === '102')?.id, fare: 517, zone: 1 },
    { routeId: routes.find(r => r.code === '103')?.id, fare: 341, zone: 1 },
    { routeId: routes.find(r => r.code === '104')?.id, fare: 363, zone: 1 },
    { routeId: routes.find(r => r.code === '105')?.id, fare: 253, zone: 1 },
    { routeId: routes.find(r => r.code === '106')?.id, fare: 194, zone: 1 },
    { routeId: routes.find(r => r.code === '107')?.id, fare: 273, zone: 1 },
    { routeId: routes.find(r => r.code === '108')?.id, fare: 185, zone: 1 },
    { routeId: routes.find(r => r.code === '109')?.id, fare: 219, zone: 1 },
    { routeId: routes.find(r => r.code === '110')?.id, fare: 110, zone: 1 },
    { routeId: routes.find(r => r.code === '111')?.id, fare: 297, zone: 1 },
    { routeId: routes.find(r => r.code === '112')?.id, fare: 220, zone: 1 },
    { routeId: routes.find(r => r.code === '113')?.id, fare: 165, zone: 1 },
    { routeId: routes.find(r => r.code === '114')?.id, fare: 163, zone: 1 },
    { routeId: routes.find(r => r.code === '115')?.id, fare: 250, zone: 1 },
    { routeId: routes.find(r => r.code === '120')?.id, fare: 212, zone: 1 },
    { routeId: routes.find(r => r.code === '121')?.id, fare: 209, zone: 1 },
    { routeId: routes.find(r => r.code === '122')?.id, fare: 310, zone: 1 },
    
    // ZONE 2
    { routeId: routes.find(r => r.code === '201')?.id, fare: 286, zone: 2 },
    { routeId: routes.find(r => r.code === '203')?.id, fare: 277, zone: 2 },
    { routeId: routes.find(r => r.code === '204')?.id, fare: 299, zone: 2 },
    { routeId: routes.find(r => r.code === '205')?.id, fare: 268, zone: 2 },
    { routeId: routes.find(r => r.code === '206')?.id, fare: 271, zone: 2 },
    { routeId: routes.find(r => r.code === '207')?.id, fare: 208, zone: 2 },
    { routeId: routes.find(r => r.code === '208')?.id, fare: 200, zone: 2 },
    { routeId: routes.find(r => r.code === '210')?.id, fare: 253, zone: 2 },
    { routeId: routes.find(r => r.code === '211')?.id, fare: 259, zone: 2 },
    { routeId: routes.find(r => r.code === '212')?.id, fare: 272, zone: 2 },
    { routeId: routes.find(r => r.code === '213')?.id, fare: 231, zone: 2 },
    { routeId: routes.find(r => r.code === '214')?.id, fare: 299, zone: 2 },
    { routeId: routes.find(r => r.code === '215')?.id, fare: 289, zone: 2 },
    
    // ZONE 3
    { routeId: routes.find(r => r.code === '301')?.id, fare: 286, zone: 3 },
    { routeId: routes.find(r => r.code === '302')?.id, fare: 253, zone: 3 },
    { routeId: routes.find(r => r.code === '303')?.id, fare: 216, zone: 3 },
    { routeId: routes.find(r => r.code === '304')?.id, fare: 264, zone: 3 },
    { routeId: routes.find(r => r.code === '305')?.id, fare: 216, zone: 3 },
    { routeId: routes.find(r => r.code === '306')?.id, fare: 216, zone: 3 },
    { routeId: routes.find(r => r.code === '307')?.id, fare: 217, zone: 3 },
    { routeId: routes.find(r => r.code === '308')?.id, fare: 341, zone: 3 },
    { routeId: routes.find(r => r.code === '309')?.id, fare: 216, zone: 3 },
    { routeId: routes.find(r => r.code === '310')?.id, fare: 216, zone: 3 },
    { routeId: routes.find(r => r.code === '311')?.id, fare: 216, zone: 3 },
    { routeId: routes.find(r => r.code === '313')?.id, fare: 216, zone: 3 },
    { routeId: routes.find(r => r.code === '314')?.id, fare: 242, zone: 3 },
    { routeId: routes.find(r => r.code === '315')?.id, fare: 275, zone: 3 },
    { routeId: routes.find(r => r.code === '316')?.id, fare: 108, zone: 3 },
    { routeId: routes.find(r => r.code === '317')?.id, fare: 244, zone: 3 },
    { routeId: routes.find(r => r.code === '318')?.id, fare: 216, zone: 3 },
    { routeId: routes.find(r => r.code === '321')?.id, fare: 326, zone: 3 },
    { routeId: routes.find(r => r.code === '322')?.id, fare: 253, zone: 3 },
    { routeId: routes.find(r => r.code === '323')?.id, fare: 352, zone: 3 },
    { routeId: routes.find(r => r.code === '325')?.id, fare: 297, zone: 3 },
    
    // ZONE 4
    { routeId: routes.find(r => r.code === '401')?.id, fare: 176, zone: 4 },
    { routeId: routes.find(r => r.code === '402')?.id, fare: 220, zone: 4 },
    { routeId: routes.find(r => r.code === '403')?.id, fare: 297, zone: 4 },
    { routeId: routes.find(r => r.code === '404')?.id, fare: 272, zone: 4 },
    { routeId: routes.find(r => r.code === '405')?.id, fare: 268, zone: 4 },
    { routeId: routes.find(r => r.code === '406')?.id, fare: 277, zone: 4 },
    { routeId: routes.find(r => r.code === '407')?.id, fare: 219, zone: 4 },
    { routeId: routes.find(r => r.code === '408')?.id, fare: 341, zone: 4 },
    { routeId: routes.find(r => r.code === '409')?.id, fare: 277, zone: 4 },
    { routeId: routes.find(r => r.code === '410')?.id, fare: 277, zone: 4 },
    { routeId: routes.find(r => r.code === '411')?.id, fare: 277, zone: 4 },
    { routeId: routes.find(r => r.code === '412')?.id, fare: 108, zone: 4 },
    { routeId: routes.find(r => r.code === '413')?.id, fare: 341, zone: 4 },
    { routeId: routes.find(r => r.code === '414')?.id, fare: 222, zone: 4 },
    { routeId: routes.find(r => r.code === '415')?.id, fare: 216, zone: 4 }
  ].filter(plan => plan.routeId); // Filter out any plans where route wasn't found
  
  const createdPlans = await bulkInsert('pricingPlans', pricingPlans);
  
  console.log(`[fas fa-check-circle] Created ${createdPlans.length} pricing plans`);
  
  return createdPlans;
};

module.exports = {
  createPricingPlans
};

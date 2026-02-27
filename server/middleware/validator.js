/**
 * ============================================================
 * REQUEST VALIDATION MIDDLEWARE
 * ============================================================
 * Validates request bodies before processing
 */

const config = require('../config');

/**
 * Check if all required fields are present
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @throws {Error} If validation fails
 */
const validateRequired = (body, requiredFields) => {
  const missing = requiredFields.filter(field => 
    body[field] === undefined || body[field] === null || body[field] === ''
  );
  
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.code = 'VALIDATION_ERROR';
    error.fields = missing;
    throw error;
  }
};

/**
 * Validate field against allowed enum values
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Name of the field being validated
 * @throws {Error} If validation fails
 */
const validateEnum = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    const error = new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.allowedValues = allowedValues;
    throw error;
  }
};

/**
 * Validate Rwandan phone number format
 * @param {string} phone - Phone number to validate
 * @param {string} fieldName - Name of the field being validated
 * @throws {Error} If validation fails
 */
const validateRwandaPhone = (phone, fieldName) => {
  if (!config.VALIDATION.RWANDA_PHONE.test(phone)) {
    const error = new Error(`${fieldName} must be a valid Rwandan phone number (+2507XXXXXXXX or 07XXXXXXXX)`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.format = 'RWANDA_PHONE';
    throw error;
  }
};

/**
 * Validate Rwandan license plate format
 * @param {string} plate - License plate to validate
 * @param {string} fieldName - Name of the field being validated
 * @throws {Error} If validation fails
 */
const validateRwandaPlate = (plate, fieldName) => {
  if (!config.VALIDATION.RWANDA_PLATE.test(plate)) {
    const error = new Error(`${fieldName} must be a valid Rwandan license plate (RAB XXX A)`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.format = 'RWANDA_PLATE';
    throw error;
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @param {string} fieldName - Name of the field being validated
 * @throws {Error} If validation fails
 */
const validateEmail = (email, fieldName) => {
  if (!config.VALIDATION.EMAIL.test(email)) {
    const error = new Error(`${fieldName} must be a valid email address`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.format = 'EMAIL';
    throw error;
  }
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @param {string} fieldName - Name of the field being validated
 * @throws {Error} If validation fails
 */
const validateUUID = (uuid, fieldName) => {
  if (!config.VALIDATION.UUID.test(uuid)) {
    const error = new Error(`${fieldName} must be a valid UUID`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.format = 'UUID';
    throw error;
  }
};

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {string} fieldName - Name of the field being validated
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @throws {Error} If validation fails
 */
const validateStringLength = (value, fieldName, minLength = 0, maxLength = 255) => {
  if (typeof value !== 'string') {
    const error = new Error(`${fieldName} must be a string`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    throw error;
  }
  
  if (value.length < minLength) {
    const error = new Error(`${fieldName} must be at least ${minLength} characters long`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.minLength = minLength;
    throw error;
  }
  
  if (value.length > maxLength) {
    const error = new Error(`${fieldName} must be no more than ${maxLength} characters long`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.maxLength = maxLength;
    throw error;
  }
};

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {string} fieldName - Name of the field being validated
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @throws {Error} If validation fails
 */
const validateNumberRange = (value, fieldName, min = null, max = null) => {
  if (typeof value !== 'number' || isNaN(value)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    throw error;
  }
  
  if (min !== null && value < min) {
    const error = new Error(`${fieldName} must be at least ${min}`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.min = min;
    throw error;
  }
  
  if (max !== null && value > max) {
    const error = new Error(`${fieldName} must be no more than ${max}`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.max = max;
    throw error;
  }
};

/**
 * Validate date format
 * @param {string} date - Date string to validate
 * @param {string} fieldName - Name of the field being validated
 * @throws {Error} If validation fails
 */
const validateDate = (date, fieldName) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    const error = new Error(`${fieldName} must be a valid date`);
    error.code = 'VALIDATION_ERROR';
    error.field = fieldName;
    error.format = 'DATE';
    throw error;
  }
};

/**
 * Validate coordinate format
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} fieldName - Base field name
 * @throws {Error} If validation fails
 */
const validateCoordinates = (lat, lng, fieldName) => {
  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    const error = new Error(`${fieldName} latitude must be between -90 and 90`);
    error.code = 'VALIDATION_ERROR';
    error.field = `${fieldName}_lat`;
    throw error;
  }
  
  if (typeof lng !== 'number' || lng < -180 || lng > 180) {
    const error = new Error(`${fieldName} longitude must be between -180 and 180`);
    error.code = 'VALIDATION_ERROR';
    error.field = `${fieldName}_lng`;
    throw error;
  }
};

/**
 * Validation middleware factory
 * @param {Function} validationFunction - Validation function to run
 * @returns {Function} Express middleware
 */
const validate = (validationFunction) => {
  return (req, res, next) => {
    try {
      validationFunction(req.body);
      next();
    } catch (error) {
      console.warn(`⚠️ Validation error: ${error.message}`);
      
      return res.status(400).json({
        success: false,
        error: error.code || 'VALIDATION_ERROR',
        message: error.message,
        details: {
          field: error.field,
          format: error.format,
          allowedValues: error.allowedValues,
          minLength: error.minLength,
          maxLength: error.maxLength,
          min: error.min,
          max: error.max
        }
      });
    }
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // Company validation
  company: (body) => {
    validateRequired(body, ['name', 'registrationNumber', 'phone', 'email']);
    validateStringLength(body.name, 'name', 2, 100);
    validateRwandaPhone(body.phone, 'phone');
    validateEmail(body.email, 'email');
    validateEnum(body.status, Object.values(config.COMPANY_STATUS), 'status');
    validateEnum(body.subscriptionTier, Object.values(config.SUBSCRIPTION_TIERS), 'subscriptionTier');
  },
  
  // Bus validation
  bus: (body) => {
    validateRequired(body, ['plateNumber', 'model', 'capacity', 'companyId']);
    validateRwandaPlate(body.plateNumber, 'plateNumber');
    validateStringLength(body.model, 'model', 2, 50);
    validateNumberRange(body.capacity, 'capacity', 1, 100);
    validateEnum(body.status, Object.values(config.BUS_STATUS), 'status');
    validateEnum(body.fuelType, ['petrol', 'diesel', 'electric', 'hybrid'], 'fuelType');
  },
  
  // Route validation
  route: (body) => {
    validateRequired(body, ['name', 'startStationId', 'endStationId', 'baseFare', 'companyId']);
    validateStringLength(body.name, 'name', 2, 100);
    validateNumberRange(body.baseFare, 'baseFare', 100, 50000);
    validateEnum(body.status, ['active', 'suspended', 'under_review'], 'status');
    if (body.waypoints && Array.isArray(body.waypoints)) {
      body.waypoints.forEach((waypoint, index) => {
        validateRequired(waypoint, ['stationId', 'order']);
        validateNumberRange(waypoint.order, `waypoints[${index}].order`, 1, 100);
      });
    }
  },
  
  // Trip validation
  trip: (body) => {
    validateRequired(body, ['routeId', 'busId', 'driverId', 'scheduledDeparture', 'scheduledArrival']);
    validateUUID(body.routeId, 'routeId');
    validateUUID(body.busId, 'busId');
    validateUUID(body.driverId, 'driverId');
    validateDate(body.scheduledDeparture, 'scheduledDeparture');
    validateDate(body.scheduledArrival, 'scheduledArrival');
    validateEnum(body.status, Object.values(config.TRIP_STATUS), 'status');
  },
  
  // Driver validation
  driver: (body) => {
    validateRequired(body, ['portalUserId', 'companyId', 'nationalId', 'licenseNumber']);
    validateStringLength(body.nationalId, 'nationalId', 16, 16);
    validateRwandaPhone(body.phone, 'phone');
    validateEnum(body.status, ['active', 'on_trip', 'off_duty', 'suspended', 'on_leave'], 'status');
  },
  
  // User/Portal User validation
  portalUser: (body) => {
    validateRequired(body, ['username', 'password', 'role']);
    validateStringLength(body.username, 'username', 3, 50);
    validateStringLength(body.password, 'password', 8, 128);
    validateEnum(body.role, Object.values(config.ROLES), 'role');
  }
};

module.exports = {
  validateRequired,
  validateEnum,
  validateRwandaPhone,
  validateRwandaPlate,
  validateEmail,
  validateUUID,
  validateStringLength,
  validateNumberRange,
  validateDate,
  validateCoordinates,
  validate,
  schemas
};

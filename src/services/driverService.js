import { createService } from './api.js'

const service = createService('drivers')

export const driverService = {
  ...service,

  getByPhone(phone) {
    return service.getAll({ phone }).then(d => d[0] || null)
  },

  login(phone, pin) {
    return service.getAll({ phone, pin }).then(d => d[0] || null)
  },
}

export const tripStatusService = createService('tripStatuses')
export const driverSessionService = createService('driverSessions')

import { createService } from './api.js'

const service = createService('workers')

export const workerService = {
  ...service,

  getByPhone(phone) {
    return service.getAll({ phone }).then(w => w[0] || null)
  },

  login(phone, pin) {
    return service.getAll({ phone, pin }).then(w => w[0] || null)
  },
}

export const scanLogService = createService('scanLogs')
export const workerSessionService = createService('workerSessions')

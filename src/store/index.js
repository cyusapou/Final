import { reactive, computed } from 'vue'

// Bus stops data - including Kigali stations and roadside stops with codes
export const stops = [
  // Kigali Stations
  { id: 1, name: 'Nyabugogo Main Station', type: 'station', city: 'Kigali', hasCode: false, code: null },
  { id: 2, name: 'Remera Sonatubes', type: 'station', city: 'Kigali', hasCode: false, code: null },
  { id: 3, name: 'Kimironko Market', type: 'station', city: 'Kigali', hasCode: false, code: null },
  { id: 4, name: 'Kicukiro Centre', type: 'station', city: 'Kigali', hasCode: false, code: null },
  { id: 5, name: 'Kanombe Terminal', type: 'station', city: 'Kigali', hasCode: false, code: null },
  { id: 6, name: 'Gatenga Bus Park', type: 'station', city: 'Kigali', hasCode: false, code: null },
  
  // Kigali Roadside Stops with 4-digit codes
  { id: 101, name: 'Bus Stop 1234', type: 'roadside', city: 'Kigali', hasCode: true, code: '1234', area: 'Kicukiro' },
  { id: 102, name: 'Bus Stop 1423', type: 'roadside', city: 'Kigali', hasCode: true, code: '1423', area: 'Kicukiro' },
  { id: 103, name: 'Bus Stop 2156', type: 'roadside', city: 'Kigali', hasCode: true, code: '2156', area: 'Remera' },
  { id: 104, name: 'Bus Stop 2234', type: 'roadside', city: 'Kigali', hasCode: true, code: '2234', area: 'Remera' },
  { id: 105, name: 'Bus Stop 2341', type: 'roadside', city: 'Kigali', hasCode: true, code: '2341', area: 'Nyabugogo' },
  { id: 106, name: 'Bus Stop 2456', type: 'roadside', city: 'Kigali', hasCode: true, code: '2456', area: 'Nyabugogo' },
  { id: 107, name: 'Bus Stop 3124', type: 'roadside', city: 'Kigali', hasCode: true, code: '3124', area: 'Kimironko' },
  { id: 108, name: 'Bus Stop 3245', type: 'roadside', city: 'Kigali', hasCode: true, code: '3245', area: 'Kimironko' },
  { id: 109, name: 'Bus Stop 3412', type: 'roadside', city: 'Kigali', hasCode: true, code: '3412', area: 'Kanombe' },
  { id: 110, name: 'Bus Stop 3567', type: 'roadside', city: 'Kigali', hasCode: true, code: '3567', area: 'Kanombe' },
  { id: 111, name: 'Bus Stop 4123', type: 'roadside', city: 'Kigali', hasCode: true, code: '4123', area: 'Gatenga' },
  { id: 112, name: 'Bus Stop 4234', type: 'roadside', city: 'Kigali', hasCode: true, code: '4234', area: 'Gatenga' },
  { id: 113, name: 'Bus Stop 4567', type: 'roadside', city: 'Kigali', hasCode: true, code: '4567', area: 'Kigali City Center' },
  { id: 114, name: 'Bus Stop 4678', type: 'roadside', city: 'Kigali', hasCode: true, code: '4678', area: 'Kigali City Center' },
  { id: 115, name: 'Bus Stop 4789', type: 'roadside', city: 'Kigali', hasCode: true, code: '4789', area: 'Kigali City Center' },
  { id: 116, name: 'Bus Stop 4890', type: 'roadside', city: 'Kigali', hasCode: true, code: '4890', area: 'Kigali City Center' },
  
  // Other Rwandan cities - no codes
  { id: 201, name: 'Musanze Main Station', type: 'station', city: 'Musanze', hasCode: false, code: null },
  { id: 202, name: 'Musanze Market', type: 'roadside', city: 'Musanze', hasCode: false, code: null, area: 'Musanze Town' },
  { id: 203, name: 'Rubavu Terminal', type: 'station', city: 'Rubavu', hasCode: false, code: null },
  { id: 204, name: 'Rubavu Beach', type: 'roadside', city: 'Rubavu', hasCode: false, code: null, area: 'Rubavu Town' },
  { id: 205, name: 'Huye Station', type: 'station', city: 'Huye', hasCode: false, code: null },
  { id: 206, name: 'Huye University', type: 'roadside', city: 'Huye', hasCode: false, code: null, area: 'Huye Town' },
  { id: 207, name: 'Rusizi Terminal', type: 'station', city: 'Rusizi', hasCode: false, code: null },
  { id: 208, name: 'Kamembe Town', type: 'roadside', city: 'Rusizi', hasCode: false, code: null, area: 'Kamembe' },
  { id: 209, name: 'Muhanga Terminal', type: 'station', city: 'Muhanga', hasCode: false, code: null },
  { id: 210, name: ' Ruhengeri Station', type: 'station', city: 'Ruhengeri', hasCode: false, code: null },
  { id: 211, name: 'Butare Terminal', type: 'station', city: 'Butare', hasCode: false, code: null },
  { id: 212, name: 'Kibuye Station', type: 'station', city: 'Kibuye', hasCode: false, code: null },
]

// Helper function to find stop by code
export const findStopByCode = (code) => {
  return stops.find(s => s.code === code) || null
}

// Helper function to find stops by city
export const getStopsByCity = (city) => {
  return stops.filter(s => s.city === city)
}

// Helper function to search stops
export const searchStops = (query, city = null) => {
  let results = stops
  if (city) {
    results = results.filter(s => s.city === city)
  }
  if (query) {
    const q = query.toLowerCase()
    results = results.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.area && s.area.toLowerCase().includes(q)) ||
      (s.code && s.code.includes(q))
    )
  }
  return results
}

// Shared state for passing data between pages
export const store = reactive({
  // Selected data
  selectedExpress: null,
  selectedTrip: null,
  selectedDestination: null,
  selectedOriginStop: null,
  selectedDestinationStop: null,
  selectedDate: new Date().toISOString().split('T')[0],
  
  // UI state
  currentLang: 'en',
  darkMode: typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true',
  showTicket: false,
  isProcessing: false,
  stopCode: '',
  
  // Desktop sidebar state
  sidebarOpen: true,
  
  // Routine Trips (saved travel plans)
  routineTrips: [
    {
      id: 1,
      name: 'School',
      originStop: { id: 1, name: 'Nyabugogo Main Station', type: 'station', city: 'Kigali' },
      destinationStop: { id: 211, name: 'Butare Terminal', type: 'station', city: 'Butare' },
      preferredCompanyId: 1,
      usualDepartureTime: '07:30',
      daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
      defaultPaymentMethod: 'mobileMoney'
    },
    {
      id: 2,
      name: 'Work',
      originStop: { id: 2, name: 'Remera Sonatubes', type: 'station', city: 'Kigali' },
      destinationStop: { id: 1, name: 'Nyabugogo Main Station', type: 'station', city: 'Kigali' },
      preferredCompanyId: 2,
      usualDepartureTime: '08:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
      defaultPaymentMethod: 'wallet'
    }
  ],
  
  // Planned Trips (future trips)
  plannedTrips: [],
  
  // Add a new routine trip
  addRoutineTrip(trip) {
    const newId = this.routineTrips.length > 0 
      ? Math.max(...this.routineTrips.map(t => t.id)) + 1 
      : 1
    this.routineTrips.push({
      ...trip,
      id: newId
    })
  },
  
  // Update a routine trip
  updateRoutineTrip(id, updates) {
    const index = this.routineTrips.findIndex(t => t.id === id)
    if (index !== -1) {
      this.routineTrips[index] = { ...this.routineTrips[index], ...updates }
    }
  },
  
  // Delete a routine trip
  deleteRoutineTrip(id) {
    this.routineTrips = this.routineTrips.filter(t => t.id !== id)
  },
  
  // Add a planned trip
  addPlannedTrip(trip) {
    const newId = this.plannedTrips.length > 0 
      ? Math.max(...this.plannedTrips.map(t => t.id)) + 1 
      : 1
    this.plannedTrips.push({
      ...trip,
      id: newId,
      status: 'planned'
    })
  },
  
  // Update planned trip status
  updatePlannedTripStatus(id, status) {
    const trip = this.plannedTrips.find(t => t.id === id)
    if (trip) {
      trip.status = status
    }
  },
  
  // Delete a planned trip
  deletePlannedTrip(id) {
    this.plannedTrips = this.plannedTrips.filter(t => t.id !== id)
  },
  
  // Get today's routines
  getTodaysRoutines() {
    const today = new Date().getDay() // 0 = Sunday
    return this.routineTrips.filter(trip => 
      trip.daysOfWeek && trip.daysOfWeek.includes(today)
    )
  },
  
  // Get upcoming planned trips
  getUpcomingPlannedTrips() {
    const today = new Date().toISOString().split('T')[0]
    return this.plannedTrips
      .filter(t => t.date >= today && t.status === 'planned')
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
  },
  
  // Book a routine trip - pre-fill booking flow
  bookRoutineTrip(routineTrip) {
    // This will pre-fill the booking flow
    this.selectedOriginStop = routineTrip.originStop
    this.selectedDestinationStop = routineTrip.destinationStop
    this.selectedDate = new Date().toISOString().split('T')[0]
    // Return the data needed to navigate to appropriate step
    return {
      origin: routineTrip.originStop,
      destination: routineTrip.destinationStop,
      date: this.selectedDate,
      time: routineTrip.usualDepartureTime,
      companyId: routineTrip.preferredCompanyId
    }
  },
  
  // Get current step based on route
  getCurrentStep() {
    const path = window.location.pathname
    if (path === '/' || path === '') return 1
    if (path === '/express') return 1
    if (path === '/trips') return 2
    if (path === '/destination') return 3
    if (path === '/summary') return 4
    if (path === '/payment') return 5
    return 1
  },
  
  // Reset all selections
  reset() {
    this.selectedExpress = null
    this.selectedTrip = null
    this.selectedDestination = null
    this.selectedOriginStop = null
    this.showTicket = false
    this.isProcessing = false
    this.stopCode = ''
  }
})

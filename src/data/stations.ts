export interface Station {
  id: number
  name: string
  lat: number
  lng: number
  type: 'station' | 'stop'
  area?: string
  description?: string
}

export const stations: Station[] = [
  // WESTERN KIGALI STATIONS
  {
    id: 1,
    name: 'Kigali Genocide Memorial',
    lat: -1.9318266738581038,
    lng: 30.06269452635719,
    type: 'station',
    area: 'Nyarugenge',
    description: 'Memorial Site'
  },
  {
    id: 2,
    name: 'Nyandungu Eco-Park',
    lat: -1.9340946547703213,
    lng: 30.062075614922204,
    type: 'station',
    area: 'Nyarugenge',
    description: 'Eco Park'
  },
  {
    id: 3,
    name: 'Nyamirambo Sector (Central)',
    lat: -1.9390547599710037,
    lng: 30.066897384067246,
    type: 'station',
    area: 'Nyamirambo',
    description: 'Markets/Residential'
  },
  {
    id: 4,
    name: 'Nyamirambo',
    lat: -1.9389510193431603,
    lng: 30.06703578414816,
    type: 'station',
    area: 'Nyamirambo',
    description: 'Central Nyamirambo'
  },
  {
    id: 5,
    name: 'Nyamirambo / Muhima Border',
    lat: -1.9411295711919148,
    lng: 30.069250185442773,
    type: 'station',
    area: 'Nyamirambo',
    description: 'Border Area'
  },
  {
    id: 6,
    name: 'Kimisagara Sector',
    lat: -1.9465033208693892,
    lng: 30.073826614791834,
    type: 'station',
    area: 'Kimisagara',
    description: 'Kimisagara'
  },
  {
    id: 7,
    name: 'Kimisagara',
    lat: -1.948958503037656,
    lng: 30.0745186151964,
    type: 'station',
    area: 'Kimisagara',
    description: 'Central Kimisagara'
  },
  {
    id: 8,
    name: 'Kimisagara / Gitega Edge',
    lat: -1.9473332420025862,
    lng: 30.07555661580325,
    type: 'station',
    area: 'Kimisagara',
    description: 'Edge Area'
  },
  {
    id: 9,
    name: 'Kimisagara (Southern)',
    lat: -1.9507728000455715,
    lng: 30.07292932036252,
    type: 'station',
    area: 'Kimisagara',
    description: 'Southern Part'
  },
  {
    id: 10,
    name: 'Lower Kimisagara / Kicukiro',
    lat: -1.9611006517846243,
    lng: 30.0769706076261,
    type: 'station',
    area: 'Kimisagara',
    description: 'Transition Area'
  },
  {
    id: 11,
    name: 'Southern Kimisagara / Urban',
    lat: -1.9624838414204242,
    lng: 30.077662608030668,
    type: 'station',
    area: 'Kimisagara',
    description: 'Urban Fringe'
  },
  {
    id: 12,
    name: 'Nyamirambo / Central',
    lat: -1.9410329555267818,
    lng: 30.0693452132475,
    type: 'station',
    area: 'Nyamirambo',
    description: 'Central Area'
  },
  {
    id: 13,
    name: 'Muhima or Gisozi Edge',
    lat: -1.929626841820757,
    lng: 30.069219329184914,
    type: 'station',
    area: 'Muhima',
    description: 'Northern Edge'
  },
  {
    id: 14,
    name: 'Muhima Sector',
    lat: -1.9302702068153579,
    lng: 30.07012055138297,
    type: 'station',
    area: 'Muhima',
    description: 'Muhima Area'
  },
  {
    id: 15,
    name: 'Muhima / Central Nyarugenge',
    lat: -1.931817860412816,
    lng: 30.07224082940661,
    type: 'station',
    area: 'Nyarugenge',
    description: 'Central Area'
  },
  {
    id: 16,
    name: 'Nyarugenge Central / KN 2 Rd',
    lat: -1.9341368296430326,
    lng: 30.07662105608674,
    type: 'station',
    area: 'Nyarugenge',
    description: 'Main Road Area'
  },
  {
    id: 17,
    name: 'Nyarugenge / CBD Vicinity',
    lat: -1.934378217170732,
    lng: 30.062053344060757,
    type: 'station',
    area: 'Nyarugenge',
    description: 'Central Business District'
  },

  // NORTHERN KIGALI STATIONS
  {
    id: 18,
    name: 'Kimironko / Northern Remera',
    lat: -1.9507346679890836,
    lng: 30.1225885291653,
    type: 'station',
    area: 'Kimironko',
    description: 'Market Area'
  },
  {
    id: 19,
    name: 'Remera Sector (Central)',
    lat: -1.9545090253310295,
    lng: 30.117782011019518,
    type: 'station',
    area: 'Remera',
    description: 'Near Stadium'
  },
  {
    id: 20,
    name: 'Remera / Kimironko Transition',
    lat: -1.9533625245773485,
    lng: 30.119529352894727,
    type: 'station',
    area: 'Remera',
    description: 'Hilly Residential'
  },
  {
    id: 21,
    name: 'Remera Sector',
    lat: -1.9546171384953759,
    lng: 30.117995043829865,
    type: 'station',
    area: 'Remera',
    description: 'Central Remera'
  },
  {
    id: 22,
    name: 'Remera Central/Southern',
    lat: -1.9562356174892501,
    lng: 30.115363957006476,
    type: 'station',
    area: 'Remera',
    description: 'Hotels/Offices'
  },
  {
    id: 23,
    name: 'Remera / Toward Kanombe',
    lat: -1.9579779665706019,
    lng: 30.111469629467468,
    type: 'station',
    area: 'Remera',
    description: 'Eastern Fringe'
  },
  {
    id: 24,
    name: 'Kanombe / Remera Border',
    lat: -1.9590305482249073,
    lng: 30.11011334106111,
    type: 'station',
    area: 'Kanombe',
    description: 'Airport Road'
  },
  {
    id: 25,
    name: 'Kanombe Sector (Residential)',
    lat: -1.9596198078784712,
    lng: 30.10814887758115,
    type: 'station',
    area: 'Kanombe',
    description: 'Old Airport Area'
  },
  {
    id: 26,
    name: 'Kanombe / Remera Southern Edge',
    lat: -1.9581628975424956,
    lng: 30.104960106811312,
    type: 'station',
    area: 'Kanombe',
    description: 'Southern Edge'
  },
  {
    id: 27,
    name: 'Kanombe / Kagarama Northern',
    lat: -1.9659214361736437,
    lng: 30.10328029333756,
    type: 'station',
    area: 'Kanombe',
    description: 'Kicukiro Transition'
  },
  {
    id: 28,
    name: 'Remera / Kanombe',
    lat: -1.9579624691112312,
    lng: 30.111803192081357,
    type: 'station',
    area: 'Remera',
    description: 'Border Area'
  },
  {
    id: 29,
    name: 'Kanombe',
    lat: -1.959693348045338,
    lng: 30.108154962852975,
    type: 'station',
    area: 'Kanombe',
    description: 'Central Kanombe'
  },
  {
    id: 30,
    name: 'Kanombe Southern',
    lat: -1.9659099045284278,
    lng: 30.10330453620632,
    type: 'station',
    area: 'Kanombe',
    description: 'Southern Area'
  },
  {
    id: 31,
    name: 'Kanombe / Toward Kicukiro',
    lat: -1.968277410333052,
    lng: 30.10288403970271,
    type: 'station',
    area: 'Kanombe',
    description: 'Eastern Outskirts'
  },
  {
    id: 32,
    name: 'Kagarama Northern / Kanombe',
    lat: -1.972401193170589,
    lng: 30.103618698236414,
    type: 'station',
    area: 'Kagarama',
    description: 'Wetlands/Roads'
  },
  {
    id: 33,
    name: 'Kagarama Sector (Southern)',
    lat: -1.9744511529281645,
    lng: 30.10415998652099,
    type: 'station',
    area: 'Kagarama',
    description: 'Extension Area'
  },
  {
    id: 34,
    name: 'Kagarama / Niboye Northern',
    lat: -1.9813069676611572,
    lng: 30.10456626103409,
    type: 'station',
    area: 'Kagarama',
    description: 'Southern Cluster'
  },

  // EASTERN KIGALI STATIONS
  {
    id: 35,
    name: 'Kicukiro Sector / Center',
    lat: -1.9692880999706615,
    lng: 30.086818680225566,
    type: 'station',
    area: 'Kicukiro',
    description: 'Urban Residential'
  },
  {
    id: 36,
    name: 'Kicukiro / Kigarama Border',
    lat: -1.9681416898281716,
    lng: 30.09433847416982,
    type: 'station',
    area: 'Kicukiro',
    description: 'Border Area'
  },
  {
    id: 37,
    name: 'Kigarama Sector (Hilly)',
    lat: -1.9692880999706615,
    lng: 30.10287790119126,
    type: 'station',
    area: 'Kigarama',
    description: 'Hilly Residential'
  },
  {
    id: 38,
    name: 'Kicukiro / Central',
    lat: -1.9761665442466667,
    lng: 30.087137315562185,
    type: 'station',
    area: 'Kicukiro',
    description: 'Central Kicukiro'
  },
  {
    id: 39,
    name: 'Kicukiro Sector (Alt)',
    lat: -1.9764213008955103,
    lng: 30.091789391476855,
    type: 'station',
    area: 'Kicukiro',
    description: 'Alternative Location'
  },
  {
    id: 40,
    name: 'Niboye / Kicukiro Southern',
    lat: -1.9799274757767402,
    lng: 30.10226254788748,
    type: 'station',
    area: 'Kicukiro',
    description: 'Southern Edge'
  },
  {
    id: 41,
    name: 'Niboye / Kagarama Northern',
    lat: -1.981453988893175,
    lng: 30.10451731913245,
    type: 'station',
    area: 'Kagarama',
    description: 'Northern Part'
  },
  {
    id: 42,
    name: 'Kagarama Sector (KK Roads)',
    lat: -1.9774424965095634,
    lng: 30.11295761019042,
    type: 'station',
    area: 'Kagarama',
    description: 'Near KK Roads'
  },
  {
    id: 43,
    name: 'Kagarama / Toward Gahanga',
    lat: -1.9796727639275613,
    lng: 30.11561836144182,
    type: 'station',
    area: 'Kagarama',
    description: 'Toward Gahanga'
  },
  {
    id: 44,
    name: 'Kagarama Sector (Alt)',
    lat: -1.9814741315746673,
    lng: 30.117249144466875,
    type: 'station',
    area: 'Kagarama',
    description: 'Alternative Location'
  },
  {
    id: 45,
    name: 'Gatenga / Southern Kagarama',
    lat: -1.991973490601787,
    lng: 30.096209180040553,
    type: 'station',
    area: 'Gatenga',
    description: 'Southern Area'
  },
  {
    id: 46,
    name: 'Kagarama Southern / Wetlands',
    lat: -1.9958335329701933,
    lng: 30.096123349355025,
    type: 'station',
    area: 'Kagarama',
    description: 'Near Wetlands'
  },
  {
    id: 47,
    name: 'Southern Kagarama / Gahanga',
    lat: -2.001593978001587,
    lng: 30.091174474425323,
    type: 'station',
    area: 'Gahanga',
    description: 'Northern Edge'
  },
  {
    id: 48,
    name: 'Kagarama Central/Southern',
    lat: -1.9900906257574578,
    lng: 30.098942157219163,
    type: 'station',
    area: 'Kagarama',
    description: 'Central Area'
  },
  {
    id: 49,
    name: 'Gahanga / Southern Kagarama',
    lat: -2.001583849474875,
    lng: 30.091200664776398,
    type: 'station',
    area: 'Gahanga',
    description: 'Southern Area'
  },
  {
    id: 50,
    name: 'Gahanga Sector (Outskirts)',
    lat: -2.0121710714341754,
    lng: 30.107574204219222,
    type: 'station',
    area: 'Gahanga',
    description: 'Near Nyamata Road'
  },
  {
    id: 51,
    name: 'Kagarama / Kanombe Transition',
    lat: -1.978363190363113,
    lng: 30.112885759085486,
    type: 'station',
    area: 'Kagarama',
    description: 'Transition Area'
  },
  {
    id: 52,
    name: 'Kanombe / Kagarama Eastern',
    lat: -1.9814716413038216,
    lng: 30.117378425841615,
    type: 'station',
    area: 'Kanombe',
    description: 'Eastern Edge'
  },
  {
    id: 53,
    name: 'Gahanga or Nyarugunga',
    lat: -2.012125270776887,
    lng: 30.107461588251752,
    type: 'station',
    area: 'Gahanga',
    description: 'Southern Outskirts'
  }
]

// Helper function to get station by ID
export const getStationById = (id: number): Station | undefined => {
  return stations.find(station => station.id === id)
}

// Helper function to search stations by name
export const searchStations = (query: string): Station[] => {
  const searchTerm = query.toLowerCase()
  return stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm) ||
    station.area?.toLowerCase().includes(searchTerm) ||
    station.description?.toLowerCase().includes(searchTerm)
  )
}

// Helper function to get stations by area
export const getStationsByArea = (area: string): Station[] => {
  return stations.filter(station => 
    station.area?.toLowerCase() === area.toLowerCase()
  )
}

// Helper function to get all unique areas
export const getAllAreas = (): string[] => {
  const areas = stations
    .map(station => station.area)
    .filter((area): area is string => area !== undefined)
  return [...new Set(areas)].sort()
}

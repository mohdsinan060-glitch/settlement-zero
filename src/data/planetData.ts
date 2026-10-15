/**
 * SETTLEMENT ZERO — CANONICAL PLANETARY DATA
 * Unified coordinate definitions and spherical geodesics for Exoplanet Proxima-Zero.
 */

export interface PlanetaryLocation {
  id: string;
  name: string;
  code: string;
  type: 'colony' | 'wreckage' | 'resource' | 'hazard' | 'outpost';
  latitude: number;
  longitude: number;
  elevation: string;
  terrain: string;
  hazards: string;
  resources: string;
  description: string;
  transitHubAvailable: boolean;
}

export const PLANET_CONSTANTS = {
  name: 'Proxima-Zero',
  system: 'Proxima Centauri // Sector 9',
  radiusKm: 5820, // Fictional planetary radius
  gravityG: 0.84,
  surfaceTempC: -32,
  atmosphericComposition: 'N₂ (71%) / CO₂ (18%) / CH₄ (8%) / Ar (3%)',
  orbitalPeriodDays: 218.4,
  dayLengthHours: 28.6,
};

// Canonical story locations + expanded transit outposts
export const CANONICAL_LOCATIONS: PlanetaryLocation[] = [
  {
    id: 'arcadia-crash',
    name: 'Arcadia-9 Crash Site',
    code: 'SEC-CRASH-01',
    type: 'wreckage',
    latitude: -14.82,
    longitude: -88.04,
    elevation: '+420m (Basalt Shelf)',
    terrain: 'Fractured Impact Plain // Jagged Basalt',
    hazards: 'Volatile hypergolic fuel leaks, sharp titanium shrapnel',
    resources: 'Intact O₂ emergency canisters, high-density avionics capacitors',
    description: 'Scattered command fuselage of Colony Transport Arcadia-9 following atmospheric re-entry fracture.',
    transitHubAvailable: true,
  },
  {
    id: 'cryo-basin',
    name: 'Cryo Basin',
    code: 'SEC-HYDRO-02',
    type: 'resource',
    latitude: -22.15,
    longitude: -74.30,
    elevation: '-180m (Glacial Depression)',
    terrain: 'Sub-surface Glacial Permafrost // Cryo-crust',
    hazards: 'Cryogenic fissures (-68°C), brittle ice bridges',
    resources: 'High-purity H₂O ice deposits (Est. 4.2M metric tons)',
    description: 'Deep thermal depression exhibiting high radar albedo characteristic of extensive subterranean water ice.',
    transitHubAvailable: true,
  },
  {
    id: 'basalt-ridge',
    name: 'Basalt Ridge',
    code: 'SEC-RELAY-03',
    type: 'hazard',
    latitude: -8.40,
    longitude: -96.12,
    elevation: '+1,240m (Volcanic Escarpment)',
    terrain: 'Elevated Volcanic Mesa // Wind-scoured Basalt',
    hazards: 'Severe atmospheric ion storms, high-velocity methane winds (140 km/h)',
    resources: 'Geothermal thermal vents, line-of-sight signal transmission',
    description: 'Topographic high point providing uninterrupted 360° radar telemetry across a 350km perimeter.',
    transitHubAvailable: true,
  },
  {
    id: 'sheltered-valley',
    name: 'Sheltered Valley',
    code: 'SEC-HAB-04',
    type: 'colony',
    latitude: -18.60,
    longitude: -82.45,
    elevation: '+110m (Protected Canyon Basin)',
    terrain: 'Terraced Alluvial Rift // Natural Basalt Palisades',
    hazards: 'Low (Periodic dust eddies, minimal seismic drift)',
    resources: 'Geothermal heat conduits, stable volcanic bedrock foundation',
    description: 'Natural rift canyon shielded from ionizing radiation by 400m vertical palisades. Primary site for Settlement Zero.',
    transitHubAvailable: true,
  },
  {
    id: 'solis-terminus',
    name: 'Solis Terminus Outpost',
    code: 'SEC-SOLIS-05',
    type: 'outpost',
    latitude: -11.20,
    longitude: -79.10,
    elevation: '+310m (Solar Plateau)',
    terrain: 'Flat Silicate Bedrock // Constant Direct Sunlight',
    hazards: 'High ultraviolet exposure, extreme day/night thermal swing',
    resources: 'High-yield solar photon fields, lithium-rich dry salt beds',
    description: 'Primary auxiliary solar collection outpost feeding the regional power grid.',
    transitHubAvailable: true,
  },
  {
    id: 'horizon-crater',
    name: 'Horizon Deep Crater',
    code: 'SEC-DEEP-06',
    type: 'resource',
    latitude: -28.40,
    longitude: -91.50,
    elevation: '-620m (Sub-crust Depression)',
    terrain: 'Impact Breccia // Vitrified Silicate Floor',
    hazards: 'Heavy particulate dust, pocket methane gas vents',
    resources: 'Dense rare-earth titanium seams, heavy mineral nodules',
    description: 'Ancient meteorite impact bowl harboring rich metallurgical deposits essential for advanced colony fabrication.',
    transitHubAvailable: true,
  },
  {
    id: 'borealis-uplink',
    name: 'Borealis Uplink Station',
    code: 'SEC-UPLINK-07',
    type: 'outpost',
    latitude: -4.60,
    longitude: -84.20,
    elevation: '+890m (Northern Ridge)',
    terrain: 'Frozen Quartz Crags // Permafrost Spur',
    hazards: 'Auroral magnetic distortion, sub-zero whiteout winds',
    resources: 'Direct line to Sol Fleet orbital transponders',
    description: 'Deep-space antenna cluster maintaining communications with orbital relay satellites.',
    transitHubAvailable: true,
  },
];

/**
 * Calculates Great-Circle Distance on Proxima-Zero using Haversine formula
 */
export function calculateGreatCircleDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm = PLANET_CONSTANTS.radiusKm
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(radiusKm * c);
}

/**
 * Generates an array of intermediate waypoints along a great-circle arc
 */
export function interpolateGreatCircleArc(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numSteps = 24
): [number, number][] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const λ1 = toRad(lon1);
  const φ2 = toRad(lat2);
  const λ2 = toRad(lon2);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((φ1 - φ2) / 2), 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.pow(Math.sin((λ1 - λ2) / 2), 2)
      )
    );

  if (d === 0) return [[lat1, lon1]];

  const waypoints: [number, number][] = [];
  for (let i = 0; i <= numSteps; i++) {
    const f = i / numSteps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const φi = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λi = Math.atan2(y, x);

    waypoints.push([toDeg(φi), toDeg(λi)]);
  }

  return waypoints;
}

/**
 * Fictional fare calculation model
 * Base Fare: 25 Credits
 * Rate: 1.8 Credits / km
 * Service Charge: 8 Credits
 */
export function calculateFictionalFare(
  distanceKm: number,
  classMultiplier = 1.0
): { base: number; distanceCharge: number; serviceCharge: number; total: number } {
  const base = 25;
  const serviceCharge = 8;
  const distanceCharge = Math.round(distanceKm * 1.8 * classMultiplier);
  const total = base + distanceCharge + serviceCharge;

  return { base, distanceCharge, serviceCharge, total };
}

/**
 * SETTLEMENT ZERO — PLANETARY SIMULATION ENGINE
 * Pure, decoupled simulation engine with deterministic PRNG,
 * interconnected resource dynamics, environmental cycles, and hazard scheduling.
 */

export interface WorldModifiers {
  seed: string;
  seedId: string;
  initialOxygen: number; // 14 - 24%
  initialPower: number; // 30 - 46%
  initialWater: number; // 40 - 75 L
  initialFood: number; // 50 - 90 rations
  initialMaterials: number; // 45 - 85 units
  solarEfficiency: number; // 0.85 - 1.25
  mineralRichness: number; // 0.80 - 1.35
  radiationTier: 'MODERATE' | 'ELEVATED' | 'SEVERE';
  stormFrequencyHours: number; // interval in sol-hours between storm checks
  equipmentCondition: number; // 70 - 95%
}

export interface SimulationClock {
  sol: number; // Sol 1, 2, ...
  solHour: number; // 0 - 23
  solMinute: number; // 0 - 59
  totalElapsedSeconds: number;
  isRunning: boolean;
  speedMultiplier: number; // 1, 2, 5
}

export interface ResourceState {
  current: number;
  max: number;
  ratePerMin: number;
  productionPerMin: number;
  consumptionPerMin: number;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'DEFICIT' | 'SURPLUS';
}

export interface SimulationVitals {
  crewHealth: number; // 0 - 100%
  habitatIntegrity: number; // 0 - 100%
  radiationAmbient: number; // mSv/h
  radiationInternal: number; // mSv/h
  surfaceTemp: number; // °C
  internalTemp: number; // °C
  powerGeneration: number; // kW
  powerDemand: number; // kW
  activeSurvivors: number; // 42
  causalAlerts: string[]; // Active causal messages
}

export interface ScheduledHazard {
  id: string;
  title: string;
  description: string;
  hazardLevel: 'LOW' | 'MODERATE' | 'SEVERE';
  triggerSolHour: number; // Trigger time in total sol hours
  warningSeconds: number; // Duration of warning phase
  durationSeconds: number; // Duration of storm/hazard phase
  state: 'PENDING' | 'WARNING' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
  warningSecondsRemaining: number;
  durationSecondsRemaining: number;
  tacticalAdvice: string;
  choices: {
    id: string;
    label: string;
    consequenceText: string;
    tradeoffSummary: string;
    cost: {
      power?: number;
      materials?: number;
      water?: number;
      oxygen?: number;
    };
    effect: {
      readiness?: number;
      materials?: number;
      power?: number;
      integrity?: number;
      health?: number;
      mitigateStorm?: boolean;
    };
  }[];
}

export interface SavedColonyProgress {
  diagnosticStep: number;
  resupplyCompleted: boolean;
  wreckageInspected: boolean;
  wreckageSuppliesCollected: boolean;
  scannedDiscoveryIds: string[];
  constructedProjects: string[];
  settlementEstablished: boolean;
  eventLog: string[];
  activeRovers: {
    id: string;
    targetId: string;
    targetName: string;
    progress: number;
    status: 'TRANSIT' | 'SCANNING' | 'RETURNED';
    yieldSummary: string;
  }[];
}

export interface FullSimulationState {
  modifiers: WorldModifiers;
  clock: SimulationClock;
  oxygen: ResourceState;
  water: ResourceState;
  power: ResourceState;
  food: ResourceState;
  materials: ResourceState;
  vitals: SimulationVitals;
  activeHazards: ScheduledHazard[];
  historicalHazards: string[];
  lastTickTimestamp: number;
  colonyProgress?: SavedColonyProgress;
}

// PRNG: Mulberry32 deterministic generator
export function createPRNG(seedString: string) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 2654435761);
  }
  let a = (h ^ (h >>> 16)) >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate world modifiers deterministically from seed
export function generateWorldModifiers(seed: string): WorldModifiers {
  const prng = createPRNG(seed);

  const cleanSeed = seed.trim().toUpperCase() || 'EXP-PROXIMA-01';
  let hashNum = 0;
  for (let i = 0; i < cleanSeed.length; i++) {
    hashNum = (hashNum * 31 + cleanSeed.charCodeAt(i)) % 10000;
  }
  const seedId = `EXP-${String(Math.abs(hashNum)).padStart(4, '0')}-Z`;

  const initialOxygen = Math.round(15 + prng() * 9); // 15 - 24%
  const initialPower = Math.round(30 + prng() * 16); // 30 - 46%
  const initialWater = Math.round(45 + prng() * 30); // 45 - 75 L
  const initialFood = Math.round(60 + prng() * 30); // 60 - 90 rations
  const initialMaterials = Math.round(50 + prng() * 35); // 50 - 85 units

  const solarEfficiency = parseFloat((0.85 + prng() * 0.4).toFixed(2)); // 0.85 - 1.25
  const mineralRichness = parseFloat((0.8 + prng() * 0.55).toFixed(2)); // 0.80 - 1.35

  const radVal = prng();
  const radiationTier: 'MODERATE' | 'ELEVATED' | 'SEVERE' =
    radVal < 0.5 ? 'MODERATE' : radVal < 0.82 ? 'ELEVATED' : 'SEVERE';

  const stormFrequencyHours = Math.round(14 + prng() * 16); // 14 - 30 sol hours
  const equipmentCondition = Math.round(72 + prng() * 24); // 72 - 96%

  return {
    seed: cleanSeed,
    seedId,
    initialOxygen,
    initialPower,
    initialWater,
    initialFood,
    initialMaterials,
    solarEfficiency,
    mineralRichness,
    radiationTier,
    stormFrequencyHours,
    equipmentCondition
  };
}

// Generate deterministic schedule of planetary hazard events
export function generateHazardSchedule(modifiers: WorldModifiers): ScheduledHazard[] {
  const prng = createPRNG(modifiers.seed + '-HAZARDS');

  const hazardCatalog: Omit<ScheduledHazard, 'state' | 'warningSecondsRemaining' | 'durationSecondsRemaining' | 'triggerSolHour'>[] = [
    {
      id: 'hazard-ion-shear',
      title: 'ION WIND SHEAR // ATMOSPHERIC SURGE',
      description: 'A high-velocity methane-ion front is sweeping over Basalt Ridge toward the crash site. Surface sensors detect electromagnetic surges.',
      hazardLevel: 'SEVERE',
      warningSeconds: 45,
      durationSeconds: 60,
      tacticalAdvice: 'Z-01: Ion fronts induce electrical shorts in unshielded arrays. Diverting power to deflectors prevents hull damage, but costs precious battery reserves.',
      choices: [
        {
          id: 'divert-power-deflectors',
          label: 'Divert Battery to Deflectors',
          consequenceText: '-12 kW Power Draw. Full electrical grid protected from surge.',
          tradeoffSummary: 'High battery consumption // 100% damage prevention',
          cost: { power: 12 },
          effect: { integrity: 2, mitigateStorm: true }
        },
        {
          id: 'reinforce-filters-materials',
          label: 'Reinforce Scrubber Filters with Titanium',
          consequenceText: '-8 Construction Materials. Life support pumps remain nominal.',
          tradeoffSummary: 'Consumes materials // Spares battery reserves',
          cost: { materials: 8 },
          effect: { readiness: 4, mitigateStorm: true }
        },
        {
          id: 'brace-impact-minimal',
          label: 'Emergency Low-Power Lockdown',
          consequenceText: 'Non-critical electronics shut down. Minor integrity abrasion (-4%).',
          tradeoffSummary: 'No resource cost // -4% Habitat Integrity',
          cost: {},
          effect: { integrity: -4 }
        }
      ]
    },
    {
      id: 'hazard-dust-eddy',
      title: 'BASALT DUST EDDY // RADIATOR CHOKE',
      description: 'Particulate basalt dust has choked primary radiator coils on the auxiliary generator. Solar collection efficiency is dropping rapidly.',
      hazardLevel: 'MODERATE',
      warningSeconds: 40,
      durationSeconds: 50,
      tacticalAdvice: 'Z-01: Fine basalt grains abrade solar panels. We can seal the arrays at the cost of daytime solar generation, or use drone salvage protocols.',
      choices: [
        {
          id: 'seal-photovoltaics',
          label: 'Seal Photovoltaic Array Seals',
          consequenceText: '-6 kW solar collection during storm. Prevents motor abrasions.',
          tradeoffSummary: 'Reduced solar generation // Zero hardware degradation',
          cost: { power: 6 },
          effect: { integrity: 4, mitigateStorm: true }
        },
        {
          id: 'drone-dust-scavenge',
          label: 'Deploy Scavenger Drone into Dust Eddy',
          consequenceText: '+16 Basalt Alloy Materials, but draws -4% O2 buffer.',
          tradeoffSummary: 'Rich material haul // Minor O2 expenditure',
          cost: { oxygen: 4 },
          effect: { materials: 16 }
        }
      ]
    },
    {
      id: 'hazard-cryo-fissure',
      title: 'CRYO FISSURE PRESSURE DROP',
      description: 'A subterranean thermal sink in Cryo Basin has ruptured an ice shelf. Sub-zero gases are venting near the extraction perimeter.',
      hazardLevel: 'MODERATE',
      warningSeconds: 50,
      durationSeconds: 55,
      tacticalAdvice: 'Z-01: The thermal drop threatens water pumps. Injecting emergency thermal coolant preserves water flow, or we can divert extraction power.',
      choices: [
        {
          id: 'inject-thermal-coolant',
          label: 'Inject Emergency Thermal Slurry',
          consequenceText: '-6 Materials, but stabilizes water flow (+18 L reserves).',
          tradeoffSummary: 'Uses materials // Boosts colony water reserves',
          cost: { materials: 6 },
          effect: { readiness: 5 }
        },
        {
          id: 'throttle-pumps',
          label: 'Throttle Extraction Pumps to 25%',
          consequenceText: 'Water production paused for duration of the thermal sink.',
          tradeoffSummary: 'Zero material cost // Temporary water deficit',
          cost: {},
          effect: {}
        }
      ]
    },
    {
      id: 'hazard-radiation-flare',
      title: 'STELLAR PROMINENCE // RADIATION SPIKE',
      description: 'Proxima-Zero has emitted a coronal particle flare. Ambient surface radiation is climbing to dangerous ionizing thresholds.',
      hazardLevel: 'SEVERE',
      warningSeconds: 45,
      durationSeconds: 70,
      tacticalAdvice: 'Z-01: Radiation exceeds safe EVA limits. Habitat Dome 01 provides natural shielding, but unhoused crew require medical rad-wash.',
      choices: [
        {
          id: 'activate-mag-shield',
          label: 'Overdrive Geodesic Magnetic Shield',
          consequenceText: '-14 kW Power. Full colony perimeter shielded from radiation.',
          tradeoffSummary: 'High battery drain // Complete radiation immunity',
          cost: { power: 14 },
          effect: { health: 5, mitigateStorm: true }
        },
        {
          id: 'bunker-down',
          label: 'Bunker Inside Basalt Crevice',
          consequenceText: 'Crew sheltered in rock fissures. Expedition rovers halted.',
          tradeoffSummary: 'Zero resource cost // Minor crew fatigue (-3% health)',
          cost: {},
          effect: { health: -3 }
        }
      ]
    }
  ];

  // Schedule hazards across the expedition timeline
  const schedule: ScheduledHazard[] = [];
  let currentHour = 2.5 + prng() * 2; // First hazard between Sol 1 02:30 and 04:30

  for (let i = 0; i < 4; i++) {
    const template = hazardCatalog[i % hazardCatalog.length];
    schedule.push({
      ...template,
      triggerSolHour: parseFloat(currentHour.toFixed(2)),
      state: 'PENDING',
      warningSecondsRemaining: template.warningSeconds,
      durationSecondsRemaining: template.durationSeconds
    });
    currentHour += modifiers.stormFrequencyHours * (0.8 + prng() * 0.4);
  }

  return schedule;
}

// Initial full simulation state factory
export function createInitialSimulationState(seed: string): FullSimulationState {
  const modifiers = generateWorldModifiers(seed);
  const activeHazards = generateHazardSchedule(modifiers);

  return {
    modifiers,
    clock: {
      sol: 1,
      solHour: 6,
      solMinute: 30,
      totalElapsedSeconds: 0,
      isRunning: true,
      speedMultiplier: 1
    },
    oxygen: {
      current: modifiers.initialOxygen,
      max: 100,
      ratePerMin: -1.2,
      productionPerMin: 0,
      consumptionPerMin: 1.2,
      status: modifiers.initialOxygen <= 20 ? 'CRITICAL' : 'WARNING'
    },
    water: {
      current: modifiers.initialWater,
      max: 150,
      ratePerMin: -0.6,
      productionPerMin: 0,
      consumptionPerMin: 0.6,
      status: 'NOMINAL'
    },
    power: {
      current: modifiers.initialPower,
      max: 100,
      ratePerMin: 0.5,
      productionPerMin: 22.0,
      consumptionPerMin: 18.5,
      status: 'SURPLUS'
    },
    food: {
      current: modifiers.initialFood,
      max: 120,
      ratePerMin: -0.4,
      productionPerMin: 0,
      consumptionPerMin: 0.4,
      status: 'NOMINAL'
    },
    materials: {
      current: modifiers.initialMaterials,
      max: 200,
      ratePerMin: 0,
      productionPerMin: 0,
      consumptionPerMin: 0,
      status: 'NOMINAL'
    },
    vitals: {
      crewHealth: 92,
      habitatIntegrity: modifiers.equipmentCondition,
      radiationAmbient: modifiers.radiationTier === 'SEVERE' ? 1.8 : modifiers.radiationTier === 'ELEVATED' ? 1.1 : 0.4,
      radiationInternal: 0.18,
      surfaceTemp: -32,
      internalTemp: 21,
      powerGeneration: 22.0,
      powerDemand: 18.5,
      activeSurvivors: 42,
      causalAlerts: []
    },
    activeHazards,
    historicalHazards: [],
    lastTickTimestamp: Date.now()
  };
}

/**
 * Pure simulation advance function:
 * Simulates deltaSeconds of game time given external colony milestones.
 */
export function advanceSimulation(
  state: FullSimulationState,
  deltaSeconds: number,
  colonyContext: {
    diagnosticStep: number;
    resupplyCompleted: boolean;
    wreckageSuppliesCollected: boolean;
    constructedProjects: string[];
    waterDepositsFound: number;
    discoveriesScannedCount: number;
  }
): FullSimulationState {
  if (!state.clock.isRunning || deltaSeconds <= 0) {
    return {
      ...state,
      lastTickTimestamp: Date.now()
    };
  }

  // Cap delta to prevent massive jumps when tab was asleep
  const effectiveDelta = Math.min(deltaSeconds, 60) * state.clock.speedMultiplier;
  const deltaMinutes = effectiveDelta / 60;

  // Advance simulation clock
  const totalSeconds = state.clock.totalElapsedSeconds + effectiveDelta;
  // 1 Sol = 24 in-game hours. Let 1 real minute at 1x = 1 in-game hour (1 second = 1 game minute)
  const totalGameMinutes = Math.floor(totalSeconds);
  const solHour = (6 + Math.floor(totalGameMinutes / 60)) % 24;
  const solMinute = totalGameMinutes % 60;
  const sol = 1 + Math.floor((6 * 60 + totalGameMinutes) / (24 * 60));

  const currentTotalSolHours = (sol - 1) * 24 + solHour + solMinute / 60;

  // --- 1. Environmental Cycles ---
  // Diurnal temperature curve: coldest at 03:00 (-64°C), peak at 13:00 (-18°C)
  const sunAngle = ((solHour + solMinute / 60 - 6) / 24) * 2 * Math.PI;
  const baseSurfaceTemp = Math.round(-42 + Math.sin(sunAngle) * 22);

  // Solar availability: daylight from 06:00 to 18:00
  const isDaylight = solHour >= 6 && solHour < 18;
  const daylightIntensity = isDaylight
    ? Math.sin(((solHour - 6 + solMinute / 60) / 12) * Math.PI)
    : 0;

  // --- 2. Hazard Scheduler Progression ---
  let isStormActive = false;
  let isRadiationFlareActive = false;
  const updatedHazards = state.activeHazards.map((hazard) => {
    let nextHazard = { ...hazard };

    if (nextHazard.state === 'PENDING') {
      if (currentTotalSolHours >= nextHazard.triggerSolHour) {
        nextHazard.state = 'WARNING';
        nextHazard.warningSecondsRemaining = nextHazard.warningSeconds;
      }
    } else if (nextHazard.state === 'WARNING') {
      nextHazard.warningSecondsRemaining -= effectiveDelta;
      if (nextHazard.warningSecondsRemaining <= 0) {
        nextHazard.state = 'ACTIVE';
        nextHazard.durationSecondsRemaining = nextHazard.durationSeconds;
      }
    } else if (nextHazard.state === 'ACTIVE') {
      nextHazard.durationSecondsRemaining -= effectiveDelta;
      if (nextHazard.id.includes('dust') || nextHazard.id.includes('ion')) {
        isStormActive = true;
      }
      if (nextHazard.id.includes('radiation')) {
        isRadiationFlareActive = true;
      }
      if (nextHazard.durationSecondsRemaining <= 0) {
        nextHazard.state = 'EXPIRED';
      }
    }
    return nextHazard;
  });

  const alerts: string[] = [];

  // --- 3. Power Dynamics ---
  // Base RTG generator provides constant 14 kW
  let powerGen = 14.0;

  // Solar Array collection
  let solarGen = daylightIntensity * 16.0 * state.modifiers.solarEfficiency;
  if (isStormActive) {
    solarGen *= 0.35; // Storm dust reduces solar by 65%
    alerts.push('Basalt storm active: solar photovoltaic generation reduced by 65%.');
  }
  powerGen += solarGen;

  // Infrastructure module additions
  if (colonyContext.constructedProjects.includes('proj-power')) {
    powerGen += 24.0; // Auxiliary Power Substation adds 24 kW
  }

  // Power Demand calculation
  let powerDemand = 10.0; // Base baseline habitat electronics & avionics
  if (colonyContext.constructedProjects.includes('proj-life-support')) {
    powerDemand += 8.0; // O2 Scrubber Hub
  }
  if (colonyContext.constructedProjects.includes('proj-water')) {
    powerDemand += 7.5; // Cryo-Water Extractor
  }
  if (colonyContext.constructedProjects.includes('proj-habitat')) {
    powerDemand += 6.5; // Geodesic Biosphere Dome thermal core
  }
  if (colonyContext.constructedProjects.includes('proj-comms')) {
    powerDemand += 4.0; // Phased Deep Space Telemetry Array
  }

  // Net power balance
  const netPowerKw = powerGen - powerDemand;
  // Battery storage calculation
  const batteryDelta = (netPowerKw * deltaMinutes) / 2.0; // Scaled for playability
  let currentPower = Math.max(0, Math.min(state.power.max, state.power.current + batteryDelta));
  const hasPowerDeficit = currentPower <= 0;

  if (hasPowerDeficit) {
    alerts.push('CRITICAL POWER DEFICIT: Non-essential systems offline. Oxygen scrubbers throttled.');
  }

  // --- 4. Oxygen Dynamics ---
  const crewCount = state.vitals.activeSurvivors;
  // Crew consumes O2
  let o2Consumption = crewCount * 0.025; // % per minute

  let o2Production = 0;
  if (colonyContext.resupplyCompleted) {
    o2Production += 2.5; // Steady resupply buffer
  }
  if (colonyContext.constructedProjects.includes('proj-life-support') && !hasPowerDeficit) {
    o2Production += 3.2; // O2 Scrubber running cleanly
  }
  if (colonyContext.diagnosticStep >= 3) {
    // Regulator leak isolated
    o2Consumption *= 0.5;
  }

  // If power deficit, production cuts off
  if (hasPowerDeficit) {
    o2Production = 0;
  }

  const netO2Rate = o2Production - o2Consumption;
  const currentO2 = Math.max(0, Math.min(state.oxygen.max, state.oxygen.current + netO2Rate * deltaMinutes));

  if (currentO2 <= 20) {
    alerts.push('OXYGEN BUFFER CRITICAL: Crew hypoxia danger.');
  }

  // --- 5. Water Dynamics ---
  const waterConsumption = crewCount * 0.035; // L per minute
  let waterProduction = 0;

  if (
    colonyContext.constructedProjects.includes('proj-water') &&
    colonyContext.waterDepositsFound > 0 &&
    !hasPowerDeficit
  ) {
    waterProduction += 4.2; // Extractor nominal
  }

  const netWaterRate = waterProduction - waterConsumption;
  const currentWater = Math.max(0, Math.min(state.water.max, state.water.current + netWaterRate * deltaMinutes));

  if (currentWater <= 10) {
    alerts.push('WATER RESERVES DEPLETED: Dehydration risks mounting.');
  }

  // --- 6. Food Dynamics ---
  const foodConsumption = crewCount * 0.02; // Rations per min
  // Minor baseline recycling
  const foodProduction = colonyContext.constructedProjects.includes('proj-habitat') && currentWater > 15 ? 1.4 : 0;
  const netFoodRate = foodProduction - foodConsumption;
  const currentFood = Math.max(0, Math.min(state.food.max, state.food.current + netFoodRate * deltaMinutes));

  // --- 7. Habitat Integrity & Temperature ---
  let surfaceTemp = baseSurfaceTemp;
  if (isStormActive) {
    surfaceTemp -= 18; // Storm chill
  }

  let internalTemp = 21.0;
  if (hasPowerDeficit) {
    // Habitat cools rapidly toward surface temp
    internalTemp = Math.max(surfaceTemp, state.vitals.internalTemp - 0.4 * deltaMinutes);
    alerts.push('Internal habitat thermal coils unpowered: temperature declining.');
  } else {
    // Heating active
    internalTemp = Math.min(21.5, state.vitals.internalTemp + 0.8 * deltaMinutes);
  }

  // Integrity degradation
  let integrityDelta = 0;
  if (isStormActive && !colonyContext.constructedProjects.includes('proj-habitat')) {
    integrityDelta -= 0.6 * deltaMinutes; // Storm wear without dome
  }
  const currentIntegrity = Math.max(5, Math.min(100, state.vitals.habitatIntegrity + integrityDelta));

  // --- 8. Radiation Dynamics ---
  let ambientRad = state.modifiers.radiationTier === 'SEVERE' ? 2.2 : 0.8;
  if (isRadiationFlareActive) {
    ambientRad += 3.4;
    alerts.push('STELLAR RADIATION FLARE: Ionizing radiation spiked to dangerous levels.');
  }
  let internalRad = ambientRad * 0.45;
  if (colonyContext.constructedProjects.includes('proj-habitat')) {
    internalRad *= 0.08; // 92% radiation reduction in dome
  }

  // --- 9. Crew Health Dynamics ---
  let healthDelta = 0;
  if (currentO2 <= 15) healthDelta -= 1.2 * deltaMinutes;
  else if (currentO2 <= 25) healthDelta -= 0.4 * deltaMinutes;

  if (currentWater <= 5) healthDelta -= 1.0 * deltaMinutes;
  if (currentFood <= 5) healthDelta -= 0.6 * deltaMinutes;
  if (internalRad > 1.2) healthDelta -= 0.8 * deltaMinutes;
  if (internalTemp < 10) healthDelta -= 0.8 * deltaMinutes;

  // Recovery when conditions are optimal
  if (currentO2 > 60 && currentWater > 25 && currentFood > 20 && internalTemp > 18 && internalRad < 0.4) {
    healthDelta += 0.5 * deltaMinutes;
  }
  const currentCrewHealth = Math.max(5, Math.min(100, state.vitals.crewHealth + healthDelta));

  return {
    ...state,
    clock: {
      ...state.clock,
      sol,
      solHour,
      solMinute,
      totalElapsedSeconds: totalSeconds
    },
    oxygen: {
      ...state.oxygen,
      current: parseFloat(currentO2.toFixed(1)),
      ratePerMin: parseFloat(netO2Rate.toFixed(2)),
      productionPerMin: parseFloat(o2Production.toFixed(2)),
      consumptionPerMin: parseFloat(o2Consumption.toFixed(2)),
      status: currentO2 <= 20 ? 'CRITICAL' : currentO2 < 50 ? 'WARNING' : 'NOMINAL'
    },
    water: {
      ...state.water,
      current: parseFloat(currentWater.toFixed(1)),
      ratePerMin: parseFloat(netWaterRate.toFixed(2)),
      productionPerMin: parseFloat(waterProduction.toFixed(2)),
      consumptionPerMin: parseFloat(waterConsumption.toFixed(2)),
      status: currentWater <= 15 ? 'CRITICAL' : currentWater < 40 ? 'WARNING' : 'NOMINAL'
    },
    power: {
      ...state.power,
      current: parseFloat(currentPower.toFixed(1)),
      ratePerMin: parseFloat(netPowerKw.toFixed(2)),
      productionPerMin: parseFloat(powerGen.toFixed(1)),
      consumptionPerMin: parseFloat(powerDemand.toFixed(1)),
      status: hasPowerDeficit ? 'DEFICIT' : netPowerKw < 0 ? 'WARNING' : 'SURPLUS'
    },
    food: {
      ...state.food,
      current: parseFloat(currentFood.toFixed(1)),
      ratePerMin: parseFloat(netFoodRate.toFixed(2)),
      productionPerMin: parseFloat(foodProduction.toFixed(2)),
      consumptionPerMin: parseFloat(foodConsumption.toFixed(2)),
      status: currentFood <= 15 ? 'CRITICAL' : currentFood < 35 ? 'WARNING' : 'NOMINAL'
    },
    materials: {
      ...state.materials,
      current: parseFloat(state.materials.current.toFixed(1))
    },
    vitals: {
      crewHealth: parseFloat(currentCrewHealth.toFixed(1)),
      habitatIntegrity: parseFloat(currentIntegrity.toFixed(1)),
      radiationAmbient: parseFloat(ambientRad.toFixed(2)),
      radiationInternal: parseFloat(internalRad.toFixed(2)),
      surfaceTemp: Math.round(surfaceTemp),
      internalTemp: parseFloat(internalTemp.toFixed(1)),
      powerGeneration: parseFloat(powerGen.toFixed(1)),
      powerDemand: parseFloat(powerDemand.toFixed(1)),
      activeSurvivors: state.vitals.activeSurvivors,
      causalAlerts: alerts
    },
    activeHazards: updatedHazards,
    lastTickTimestamp: Date.now()
  };
}

// Local storage key for persistent expedition data
export const SIMULATION_STORAGE_KEY = 'settlement_zero_simulation_v2';

export function saveSimulationToStorage(state: FullSimulationState) {
  try {
    localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Unable to persist simulation to localStorage:', err);
  }
}

export function loadSimulationFromStorage(): FullSimulationState | null {
  try {
    const raw = localStorage.getItem(SIMULATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.modifiers && parsed.clock) {
      // Refresh lastTickTimestamp to avoid huge delta skip
      parsed.lastTickTimestamp = Date.now();
      return parsed;
    }
  } catch (err) {
    console.warn('Unable to parse simulation from localStorage:', err);
  }
  return null;
}

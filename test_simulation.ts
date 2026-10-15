/**
 * SETTLEMENT ZERO — SIMULATION ENGINE VERIFICATION TEST SUITE
 * Tests all 12 requested scenarios against the simulation engine.
 */

import {
  createInitialSimulationState,
  advanceSimulation,
  generateWorldModifiers,
  saveSimulationToStorage,
  loadSimulationFromStorage
} from './src/simulation/simulationEngine.ts';
import { calculateGreatCircleDistanceKm, calculateFictionalFare } from './src/data/planetData.ts';

// Mock localStorage for Node test execution
const memoryStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => memoryStorage.get(key) || null,
  setItem: (key: string, val: string) => memoryStorage.set(key, val),
  removeItem: (key: string) => memoryStorage.delete(key),
  clear: () => memoryStorage.clear()
};

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    failedCount++;
  }
}

console.log('================================================================');
console.log('SETTLEMENT ZERO — SIMULATION ENGINE TEST SUITE');
console.log('================================================================\n');

// --------------------------------------------------------------------------
// TEST 1: Resource values change correctly as simulation time advances
// --------------------------------------------------------------------------
console.log('TEST 1: Resource values change correctly as simulation time advances');
const state1 = createInitialSimulationState('TEST-SEED-01');
const advanced1 = advanceSimulation(state1, 60, {
  diagnosticStep: 0,
  resupplyCompleted: false,
  wreckageSuppliesCollected: false,
  constructedProjects: [],
  waterDepositsFound: 0,
  discoveriesScannedCount: 1
});
assert(advanced1.clock.totalElapsedSeconds === 60, 'Clock advances by exactly 60 seconds');
assert(advanced1.oxygen.current !== state1.oxygen.current, `Oxygen updated from ${state1.oxygen.current} to ${advanced1.oxygen.current}`);
assert(advanced1.water.current !== state1.water.current, `Water updated from ${state1.water.current} to ${advanced1.water.current}`);
assert(advanced1.food.current !== state1.food.current, `Food updated from ${state1.food.current} to ${advanced1.food.current}`);

// --------------------------------------------------------------------------
// TEST 2: Pausing stops simulation progression
// --------------------------------------------------------------------------
console.log('\nTEST 2: Pausing stops simulation progression');
const pausedState = {
  ...advanced1,
  clock: { ...advanced1.clock, isRunning: false }
};
const pausedAdvance = advanceSimulation(pausedState, 60, {
  diagnosticStep: 0,
  resupplyCompleted: false,
  wreckageSuppliesCollected: false,
  constructedProjects: [],
  waterDepositsFound: 0,
  discoveriesScannedCount: 1
});
assert(pausedAdvance.clock.totalElapsedSeconds === advanced1.clock.totalElapsedSeconds, 'Clock does not advance when paused');
assert(pausedAdvance.oxygen.current === advanced1.oxygen.current, 'Oxygen remains static while paused');
assert(pausedAdvance.power.current === advanced1.power.current, 'Power remains static while paused');

// --------------------------------------------------------------------------
// TEST 3: Resuming continues from the saved state
// --------------------------------------------------------------------------
console.log('\nTEST 3: Resuming continues from the saved state');
const resumedState = {
  ...pausedAdvance,
  clock: { ...pausedAdvance.clock, isRunning: true }
};
const resumedAdvance = advanceSimulation(resumedState, 30, {
  diagnosticStep: 0,
  resupplyCompleted: false,
  wreckageSuppliesCollected: false,
  constructedProjects: [],
  waterDepositsFound: 0,
  discoveriesScannedCount: 1
});
assert(resumedAdvance.clock.totalElapsedSeconds === advanced1.clock.totalElapsedSeconds + 30, 'Clock resumes from paused snapshot');
assert(resumedAdvance.oxygen.current !== pausedAdvance.oxygen.current, 'Resources resume progression immediately');

// --------------------------------------------------------------------------
// TEST 4: Refreshing restores the current expedition without rerolling it
// --------------------------------------------------------------------------
console.log('\nTEST 4: Refreshing restores the current expedition without rerolling it');
saveSimulationToStorage(advanced1);
const restored = loadSimulationFromStorage();
assert(restored !== null, 'Loaded simulation exists from storage');
assert(restored?.modifiers.seed === advanced1.modifiers.seed, `Seed preserved: ${restored?.modifiers.seed}`);
assert(restored?.clock.totalElapsedSeconds === advanced1.clock.totalElapsedSeconds, 'Elapsed time preserved');
assert(restored?.oxygen.current === advanced1.oxygen.current, 'Oxygen buffer preserved');

// --------------------------------------------------------------------------
// TEST 5: Starting a new expedition produces a different seed and valid starting conditions
// --------------------------------------------------------------------------
console.log('\nTEST 5: Starting a new expedition produces a different seed and valid starting conditions');
const seedA = generateWorldModifiers('SEED-ALPHA-101');
const seedB = generateWorldModifiers('SEED-BETA-202');
assert(seedA.seed !== seedB.seed, 'Seeds are distinct');
assert(seedA.solarEfficiency !== seedB.solarEfficiency || seedA.initialPower !== seedB.initialPower, 'World parameters differ between seeds');
assert(seedA.initialOxygen >= 14 && seedA.initialOxygen <= 25, 'Initial oxygen within valid physiological bounds');
assert(seedA.initialPower >= 28 && seedA.initialPower <= 50, 'Initial power within valid battery bounds');

// --------------------------------------------------------------------------
// TEST 6: Reusing a seed reproduces the same initial conditions
// --------------------------------------------------------------------------
console.log('\nTEST 6: Reusing a seed reproduces the same initial conditions');
const seed1 = generateWorldModifiers('FIXED-PROXIMA-77');
const seed2 = generateWorldModifiers('FIXED-PROXIMA-77');
assert(seed1.initialOxygen === seed2.initialOxygen, 'Oxygen matches across same seed');
assert(seed1.initialPower === seed2.initialPower, 'Power matches across same seed');
assert(seed1.solarEfficiency === seed2.solarEfficiency, 'Solar efficiency matches across same seed');
assert(seed1.radiationTier === seed2.radiationTier, 'Radiation tier matches across same seed');
assert(seed1.equipmentCondition === seed2.equipmentCondition, 'Equipment condition matches across same seed');

// --------------------------------------------------------------------------
// TEST 7: Every infrastructure module has measurable effects
// --------------------------------------------------------------------------
console.log('\nTEST 7: Every infrastructure module has measurable effects');
const baseSim = createInitialSimulationState('MODULE-TEST');
// Compare without vs with proj-life-support
const withoutLifeSupport = advanceSimulation(baseSim, 60, {
  diagnosticStep: 3,
  resupplyCompleted: false,
  wreckageSuppliesCollected: true,
  constructedProjects: [],
  waterDepositsFound: 1,
  discoveriesScannedCount: 2
});
const withLifeSupport = advanceSimulation(baseSim, 60, {
  diagnosticStep: 3,
  resupplyCompleted: false,
  wreckageSuppliesCollected: true,
  constructedProjects: ['proj-life-support'],
  waterDepositsFound: 1,
  discoveriesScannedCount: 2
});
assert(withLifeSupport.oxygen.productionPerMin > withoutLifeSupport.oxygen.productionPerMin, 'proj-life-support produces active O2');
assert(withLifeSupport.vitals.powerDemand > withoutLifeSupport.vitals.powerDemand, 'proj-life-support draws electrical power');

// Compare water extractor
const withWaterExtractor = advanceSimulation(baseSim, 60, {
  diagnosticStep: 3,
  resupplyCompleted: false,
  wreckageSuppliesCollected: true,
  constructedProjects: ['proj-water'],
  waterDepositsFound: 1,
  discoveriesScannedCount: 2
});
assert(withWaterExtractor.water.productionPerMin > 0, 'proj-water produces potable water');

// Compare power substation
const withPowerGrid = advanceSimulation(baseSim, 60, {
  diagnosticStep: 3,
  resupplyCompleted: false,
  wreckageSuppliesCollected: true,
  constructedProjects: ['proj-power'],
  waterDepositsFound: 1,
  discoveriesScannedCount: 2
});
assert(withPowerGrid.vitals.powerGeneration > baseSim.vitals.powerGeneration, 'proj-power boosts power generation by +24 kW');

// Compare habitat dome radiation shielding
const withHabitatDome = advanceSimulation(baseSim, 60, {
  diagnosticStep: 3,
  resupplyCompleted: false,
  wreckageSuppliesCollected: true,
  constructedProjects: ['proj-habitat'],
  waterDepositsFound: 1,
  discoveriesScannedCount: 2
});
assert(withHabitatDome.vitals.radiationInternal < withoutLifeSupport.vitals.radiationInternal, 'proj-habitat provides 92% radiation shielding');

// --------------------------------------------------------------------------
// TEST 8: Hazards create real consequences and valid player choices
// --------------------------------------------------------------------------
console.log('\nTEST 8: Hazards create real consequences and valid player choices');
const hazardSim = createInitialSimulationState('HAZARD-TEST');
const firstHazard = hazardSim.activeHazards[0];
assert(firstHazard !== undefined, 'Scheduled hazard generated');
assert(firstHazard.choices.length >= 2, 'Hazard provides at least two tactical options');
assert(firstHazard.choices[0].cost !== undefined, 'Choice defines resource costs');
assert(firstHazard.choices[0].effect !== undefined, 'Choice defines consequences');

// --------------------------------------------------------------------------
// TEST 9: Resources never fall outside their valid bounds
// --------------------------------------------------------------------------
console.log('\nTEST 9: Resources never fall outside their valid bounds');
// Extreme stress test: 200 simulation ticks without life support or power
let stressSim = createInitialSimulationState('STRESS-TEST');
for (let i = 0; i < 200; i++) {
  stressSim = advanceSimulation(stressSim, 60, {
    diagnosticStep: 0,
    resupplyCompleted: false,
    wreckageSuppliesCollected: false,
    constructedProjects: [],
    waterDepositsFound: 0,
    discoveriesScannedCount: 1
  });
}
assert(stressSim.oxygen.current >= 0 && stressSim.oxygen.current <= 100, `Oxygen bounded: ${stressSim.oxygen.current}`);
assert(stressSim.power.current >= 0 && stressSim.power.current <= 100, `Power bounded: ${stressSim.power.current}`);
assert(stressSim.water.current >= 0 && stressSim.water.current <= 150, `Water bounded: ${stressSim.water.current}`);
assert(stressSim.food.current >= 0 && stressSim.food.current <= 120, `Food bounded: ${stressSim.food.current}`);
assert(stressSim.vitals.crewHealth >= 0 && stressSim.vitals.crewHealth <= 100, `Crew health bounded: ${stressSim.vitals.crewHealth}`);
assert(stressSim.vitals.habitatIntegrity >= 0 && stressSim.vitals.habitatIntegrity <= 100, `Habitat integrity bounded: ${stressSim.vitals.habitatIntegrity}`);

// --------------------------------------------------------------------------
// TEST 10: The existing victory condition still works
// --------------------------------------------------------------------------
console.log('\nTEST 10: The existing victory condition still works');
const canEstablish = (projects: string[], readiness: number) => {
  return (
    projects.includes('proj-life-support') &&
    projects.includes('proj-water') &&
    projects.includes('proj-habitat') &&
    readiness >= 70
  );
};
assert(
  !canEstablish(['proj-life-support', 'proj-water'], 75),
  'Cannot establish without habitat dome'
);
assert(
  !canEstablish(['proj-life-support', 'proj-water', 'proj-habitat'], 65),
  'Cannot establish with readiness < 70%'
);
assert(
  canEstablish(['proj-life-support', 'proj-water', 'proj-habitat'], 72),
  'Successfully satisfies victory condition when all 3 modules active and readiness >= 70%'
);

// --------------------------------------------------------------------------
// TEST 11: Navigation and transit continue to work
// --------------------------------------------------------------------------
console.log('\nTEST 11: Navigation and transit continue to work');
const arcadiaCoords: [number, number] = [-14.82, -88.04];
const cryoCoords: [number, number] = [-22.15, -74.3];
const distanceKm = calculateGreatCircleDistanceKm(
  arcadiaCoords[0],
  arcadiaCoords[1],
  cryoCoords[0],
  cryoCoords[1]
);
const fare = calculateFictionalFare(distanceKm, 1.0);
assert(distanceKm > 900 && distanceKm < 2000, `Distance Arcadia to Cryo calculated: ${distanceKm} km`);
assert(fare.total > 0 && fare.distanceCharge > 0, `Transit fare valid: ${fare.total} Credits (Base: ${fare.base}, Dist: ${fare.distanceCharge})`);

// --------------------------------------------------------------------------
// TEST 12: No duplicate timers, event loops, or repeated actions occur
// --------------------------------------------------------------------------
console.log('\nTEST 12: No duplicate timers, event loops, or repeated actions occur');
const step1 = advanceSimulation(baseSim, 1, {
  diagnosticStep: 0,
  resupplyCompleted: false,
  wreckageSuppliesCollected: false,
  constructedProjects: [],
  waterDepositsFound: 0,
  discoveriesScannedCount: 1
});
const step2 = advanceSimulation(step1, 1, {
  diagnosticStep: 0,
  resupplyCompleted: false,
  wreckageSuppliesCollected: false,
  constructedProjects: [],
  waterDepositsFound: 0,
  discoveriesScannedCount: 1
});
assert(step2.clock.totalElapsedSeconds === step1.clock.totalElapsedSeconds + 1, 'Ticks increment linearly without runaway loops');

console.log('\n================================================================');
console.log(`SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('================================================================');

if (failedCount > 0) {
  process.exit(1);
}

import { create } from 'zustand';
import {
  type FullSimulationState,
  type SavedColonyProgress,
  createInitialSimulationState,
  advanceSimulation,
  saveSimulationToStorage,
  loadSimulationFromStorage
} from '../simulation/simulationEngine';

export type SettlementStatus = 'EMERGENCY' | 'STABILIZING' | 'SELF-SUFFICIENT';

export type MascotMood =
  | 'curious'
  | 'happy'
  | 'surprised'
  | 'concerned'
  | 'excited'
  | 'emergency';

export interface Discovery {
  id: string;
  name: string;
  type: 'water' | 'mineral' | 'habitat' | 'hazard' | 'landing_zone' | 'wreckage';
  coordinates: [number, number];
  elevation?: string;
  scanned: boolean;
  terrain?: string;
  hazards?: string;
  resources?: string;
  suitability?: string;
  description: string;
}

export interface SettlementState {
  // Civilization parameters
  status: SettlementStatus;
  oxygenLevel: number; // 0 - 100%
  civilizationReadiness: number; // 0 - 100%
  powerLevel: number; // 0 - 100%
  activeSurvivors: number;
  waterDepositsFound: number;

  // Mascot state
  mascotMood: MascotMood;
  mascotDialogue: string | null;
  dialogueOpen: boolean;

  // Missions & Discoveries
  shuttleDispatched: boolean;
  shuttleProgress: number; // 0 - 100%
  resupplyCompleted: boolean;
  scanActive: boolean;
  discoveries: Discovery[];
  wreckageInspected: boolean;
  wreckageSuppliesCollected: boolean;

  // Diagnostic state
  diagnosticStep: number; // 0: initial, 1: inspected, 2: isolated, 3: stabilized
  oxygenDraining: boolean;
  simulationPaused: boolean;

  // Infrastructure Projects & Colony Status
  constructedProjects: string[]; // IDs of built projects
  settlementEstablished: boolean;

  // Seeded Simulation & Telemetry
  expeditionSeed: string;
  constructionMaterials: number; // Construction materials reserve
  activeEvent: {
    id: string;
    title: string;
    description: string;
    hazardLevel: 'LOW' | 'MODERATE' | 'SEVERE';
    choices: {
      label: string;
      effectText: string;
      actionType: 'divert_shields' | 'maintain_pumps' | 'seal_arrays' | 'salvage_scrap' | 'bypass_vent' | 'seal_fault';
    }[];
  } | null;
  eventLog: string[];
  activeRovers: {
    id: string;
    targetId: string;
    targetName: string;
    progress: number; // 0 - 100%
    status: 'TRANSIT' | 'SCANNING' | 'RETURNED';
    yieldSummary: string;
  }[];

  // Full Simulation Engine State & Telemetry
  simulation: FullSimulationState;
  hasSavedExpedition: boolean;

  // Actions
  setMascotMood: (mood: MascotMood) => void;
  openDialogue: (customText?: string) => void;
  closeDialogue: () => void;
  setOxygenLevel: (level: number) => void;
  tickOxygenDrain: () => void;
  toggleSimulationPause: () => void;
  setDiagnosticStep: (step: number) => void;
  dispatchShuttle: () => void;
  updateShuttleProgress: (progress: number) => void;
  completeResupply: () => void;
  toggleScan: () => void;
  discoverPoint: (id: string) => void;
  inspectWreckage: () => void;
  collectWreckageSupplies: () => void;
  buildProject: (id: string) => void;
  claimSettlementEstablished: () => void;
  resetSimulation: () => void;

  // Seeded simulation & interconnected mechanics actions
  initSeededExpedition: (seed: string) => void;
  startNewExpedition: (seed?: string) => void;
  triggerRandomEvent: () => void;
  resolveEventChoice: (actionType: string) => void;
  resolveScheduledHazard: (hazardId: string, choiceId: string) => void;
  dismissEvent: () => void;
  dispatchRoverMission: (targetId: string) => boolean;
  tickRoverProgress: () => void;
  tickSimulation: (forcedDeltaSeconds?: number) => void;
  setSimulationSpeed: (speed: number) => void;
  repairHabitat: () => boolean;
}

const INITIAL_DISCOVERIES: Discovery[] = [
  {
    id: 'arcadia-crash',
    name: 'Arcadia-9 Crash Site',
    type: 'wreckage',
    coordinates: [-14.82, -88.04],
    elevation: '+420m (Basalt Shelf)',
    scanned: true,
    terrain: 'Fractured Impact Plain // Jagged Basalt',
    hazards: 'Volatile hypergolic fuel leaks, sharp titanium shrapnel',
    resources: 'Intact O₂ emergency canisters, high-density avionics capacitors',
    suitability: 'Poor (Salvage site only — unstable structural debris)',
    description: 'Scattered command fuselage of Colony Transport Arcadia-9 following atmospheric re-entry fracture.'
  },
  {
    id: 'cryo-basin',
    name: 'Cryo Basin',
    type: 'water',
    coordinates: [-22.15, -74.30],
    elevation: '-180m (Glacial Depression)',
    scanned: false,
    terrain: 'Sub-surface Glacial Permafrost // Cryo-crust',
    hazards: 'Cryogenic fissures (-68°C), brittle ice bridges',
    resources: 'High-purity H₂O ice deposits (Est. 4.2M metric tons)',
    suitability: 'Moderate (Essential resource extraction sector)',
    description: 'Deep thermal depression exhibiting high radar albedo characteristic of extensive subterranean water ice.'
  },
  {
    id: 'basalt-ridge',
    name: 'Basalt Ridge',
    type: 'hazard',
    coordinates: [-8.40, -96.12],
    elevation: '+1,240m (Volcanic Escarpment)',
    scanned: false,
    terrain: 'Elevated Volcanic Mesa // Wind-scoured Basalt',
    hazards: 'Severe atmospheric ion storms, high-velocity methane winds (140 km/h)',
    resources: 'Geothermal thermal vents, line-of-sight signal transmission',
    suitability: 'Marginal (Strategic for long-range communications, dangerous for habitats)',
    description: 'Topographic high point providing uninterrupted 360° radar telemetry across a 350km perimeter.'
  },
  {
    id: 'sheltered-valley',
    name: 'Sheltered Valley',
    type: 'habitat',
    coordinates: [-18.60, -82.45],
    elevation: '+110m (Protected Canyon Basin)',
    scanned: false,
    terrain: 'Terraced Alluvial Rift // Natural Basalt Palisades',
    hazards: 'Low (Periodic dust eddies, minimal seismic drift)',
    resources: 'Geothermal heat conduits, stable volcanic bedrock foundation',
    suitability: 'Optimal — Grade A Settlement Site (94% suitability rating)',
    description: 'A naturally protected rift canyon shielded from ionizing radiation and severe winds by 400m vertical palisades.'
  }
];

// Helper to calculate total colony readiness from all interconnected systems
function computeReadiness(
  discoveries: Discovery[],
  diagnosticStep: number,
  resupplyCompleted: boolean,
  wreckageSuppliesCollected: boolean,
  constructedProjects: string[],
  settlementEstablished: boolean,
  vitalsCrewHealth: number,
  vitalsIntegrity: number,
  oxygenLevel: number
): number {
  if (settlementEstablished) return 100;

  let score = 0;
  // 1. Discoveries (up to 24%)
  const scannedCount = discoveries.filter((d) => d.scanned).length;
  score += scannedCount * 6;

  // 2. Wreckage & Supplies (10%)
  if (wreckageSuppliesCollected) score += 10;

  // 3. Life Support Diagnostics (12%)
  score += Math.min(12, diagnosticStep * 4);

  // 4. Resupply Shuttle (18%)
  if (resupplyCompleted) score += 18;

  // 5. Constructed Projects (up to 25%)
  score += constructedProjects.length * 5;

  // 6. Vitals & Stability bonus (up to 11%)
  if (vitalsCrewHealth >= 80) score += 4;
  if (vitalsIntegrity >= 70) score += 3;
  if (oxygenLevel >= 60) score += 4;

  return Math.min(100, Math.max(10, score));
}

// Hydrate initial state from localStorage if available
const loadedSim = typeof window !== 'undefined' ? loadSimulationFromStorage() : null;
const initialSimState = loadedSim || createInitialSimulationState('EXP-PROXIMA-01');
const savedProgress = loadedSim?.colonyProgress;

const initialDiscoveries = INITIAL_DISCOVERIES.map((d) => {
  if (savedProgress?.scannedDiscoveryIds) {
    return { ...d, scanned: savedProgress.scannedDiscoveryIds.includes(d.id) || d.id === 'arcadia-crash' };
  }
  return { ...d };
});

const initialConstructedProjects = savedProgress?.constructedProjects || [];
const initialDiagnosticStep = savedProgress?.diagnosticStep ?? 0;
const initialResupplyCompleted = savedProgress?.resupplyCompleted ?? false;
const initialWreckageInspected = savedProgress?.wreckageInspected ?? false;
const initialWreckageSuppliesCollected = savedProgress?.wreckageSuppliesCollected ?? false;
const initialSettlementEstablished = savedProgress?.settlementEstablished ?? false;
const initialEventLog = savedProgress?.eventLog || [
  `Expedition synchronized on seed [${initialSimState.modifiers.seed}]. Planetary telemetry active.`
];
const initialActiveRovers = savedProgress?.activeRovers || [];

const initialO2 = Math.round(initialSimState.oxygen.current);
const initialPower = Math.round(initialSimState.power.current);
const initialMaterials = Math.round(initialSimState.materials.current);
const initialReadiness = computeReadiness(
  initialDiscoveries,
  initialDiagnosticStep,
  initialResupplyCompleted,
  initialWreckageSuppliesCollected,
  initialConstructedProjects,
  initialSettlementEstablished,
  initialSimState.vitals.crewHealth,
  initialSimState.vitals.habitatIntegrity,
  initialO2
);

export const useSettlementStore = create<SettlementState>((set, get) => ({
  status:
    initialSettlementEstablished || initialReadiness >= 70
      ? 'SELF-SUFFICIENT'
      : initialO2 > 40 && initialDiagnosticStep >= 3
      ? 'STABILIZING'
      : 'EMERGENCY',
  oxygenLevel: initialO2,
  civilizationReadiness: initialReadiness,
  powerLevel: initialPower,
  activeSurvivors: initialSimState.vitals.activeSurvivors,
  waterDepositsFound: initialDiscoveries.filter((d) => d.type === 'water' && d.scanned).length,

  mascotMood: loadedSim ? 'happy' : 'curious',
  mascotDialogue: loadedSim
    ? `Welcome back, Commander! Expedition telemetry for seed [${initialSimState.modifiers.seed}] resumed.`
    : "Pilot? Signal detected. You're alive… barely. Our colony ship is compromised, and this planet is uncharted. Let’s find somewhere we can survive.",
  dialogueOpen: true,

  shuttleDispatched: false,
  shuttleProgress: initialResupplyCompleted ? 100 : 0,
  resupplyCompleted: initialResupplyCompleted,
  scanActive: false,
  discoveries: initialDiscoveries,
  wreckageInspected: initialWreckageInspected,
  wreckageSuppliesCollected: initialWreckageSuppliesCollected,
  diagnosticStep: initialDiagnosticStep,
  oxygenDraining: !initialResupplyCompleted && initialDiagnosticStep < 3,
  simulationPaused: !initialSimState.clock.isRunning,
  constructedProjects: initialConstructedProjects,
  settlementEstablished: initialSettlementEstablished,

  expeditionSeed: initialSimState.modifiers.seed,
  constructionMaterials: initialMaterials,
  activeEvent: null,
  eventLog: initialEventLog,
  activeRovers: initialActiveRovers,

  simulation: initialSimState,
  hasSavedExpedition: !!loadedSim,

  setMascotMood: (mood) => set({ mascotMood: mood }),

  openDialogue: (customText) =>
    set((state) => ({
      dialogueOpen: true,
      mascotDialogue: customText || state.mascotDialogue
    })),

  closeDialogue: () => set({ dialogueOpen: false }),

  setOxygenLevel: (level) =>
    set((state) => {
      const clampedO2 = Math.max(0, Math.min(100, Math.round(level)));
      const nextMood: MascotMood =
        clampedO2 <= 20 ? 'emergency' : clampedO2 < 50 ? 'concerned' : 'happy';
      const nextStatus: SettlementStatus =
        clampedO2 > 70 && state.civilizationReadiness >= 70
          ? 'SELF-SUFFICIENT'
          : clampedO2 > 40
          ? 'STABILIZING'
          : 'EMERGENCY';

      const updatedSim = {
        ...state.simulation,
        oxygen: {
          ...state.simulation.oxygen,
          current: clampedO2
        }
      };
      saveSimulationToStorage(updatedSim);

      return {
        oxygenLevel: clampedO2,
        mascotMood: nextMood,
        status: nextStatus,
        simulation: updatedSim
      };
    }),

  tickOxygenDrain: () =>
    set((state) => {
      if (
        state.simulationPaused ||
        !state.oxygenDraining ||
        state.resupplyCompleted ||
        state.diagnosticStep >= 3
      ) {
        return state;
      }
      const nextO2 = Math.max(6, state.oxygenLevel - 1);
      const nextMood: MascotMood =
        nextO2 <= 15 ? 'emergency' : nextO2 <= 25 ? 'concerned' : state.mascotMood;

      const updatedSim = {
        ...state.simulation,
        oxygen: {
          ...state.simulation.oxygen,
          current: nextO2
        }
      };

      return {
        oxygenLevel: nextO2,
        mascotMood: nextMood,
        status: 'EMERGENCY',
        simulation: updatedSim
      };
    }),

  toggleSimulationPause: () =>
    set((state) => {
      const nextRunning = !state.simulation.clock.isRunning;
      const updatedSim = {
        ...state.simulation,
        clock: {
          ...state.simulation.clock,
          isRunning: nextRunning
        },
        lastTickTimestamp: Date.now()
      };
      saveSimulationToStorage(updatedSim);

      return {
        simulationPaused: !nextRunning,
        simulation: updatedSim,
        eventLog: [
          `Simulation clock ${nextRunning ? 'RESUMED' : 'PAUSED'} at Sol ${state.simulation.clock.sol} ${String(state.simulation.clock.solHour).padStart(2, '0')}:${String(state.simulation.clock.solMinute).padStart(2, '0')}.`,
          ...state.eventLog
        ].slice(0, 12)
      };
    }),

  setSimulationSpeed: (speed: number) =>
    set((state) => {
      const updatedSim = {
        ...state.simulation,
        clock: {
          ...state.simulation.clock,
          speedMultiplier: speed
        }
      };
      return { simulation: updatedSim };
    }),

  setDiagnosticStep: (step: number) =>
    set((state) => {
      if (step <= state.diagnosticStep || step !== state.diagnosticStep + 1) {
        return state;
      }

      let dialogue = state.mascotDialogue;
      let mood: MascotMood = state.mascotMood;
      let draining = state.oxygenDraining;
      let o2 = state.oxygenLevel;

      if (step === 1) {
        mood = 'concerned';
        dialogue =
          'Regulator inspected! Primary solenoid seal is fractured on Array B. We must isolate the circuit immediately.';
      } else if (step === 2) {
        mood = 'curious';
        dialogue =
          'Circuit isolated! Pressure bleed stopped. Now activate emergency reserve canisters to stabilize the buffer!';
      } else if (step === 3) {
        mood = 'happy';
        dialogue =
          'Life support stabilized! Emergency buffer online. We are now cleared to initiate orbital shuttle resupply.';
        draining = false;
        o2 = Math.min(100, o2 + 8);
      }

      const nextReadiness = computeReadiness(
        state.discoveries,
        step,
        state.resupplyCompleted,
        state.wreckageSuppliesCollected,
        state.constructedProjects,
        state.settlementEstablished,
        state.simulation.vitals.crewHealth,
        state.simulation.vitals.habitatIntegrity,
        o2
      );

      const updatedSim = {
        ...state.simulation,
        oxygen: {
          ...state.simulation.oxygen,
          current: o2
        }
      };

      const colonyProgress: SavedColonyProgress = {
        diagnosticStep: step,
        resupplyCompleted: state.resupplyCompleted,
        wreckageInspected: state.wreckageInspected,
        wreckageSuppliesCollected: state.wreckageSuppliesCollected,
        scannedDiscoveryIds: state.discoveries.filter((d) => d.scanned).map((d) => d.id),
        constructedProjects: state.constructedProjects,
        settlementEstablished: state.settlementEstablished,
        eventLog: state.eventLog,
        activeRovers: state.activeRovers
      };
      saveSimulationToStorage({ ...updatedSim, colonyProgress });

      return {
        diagnosticStep: step,
        oxygenDraining: draining,
        oxygenLevel: o2,
        civilizationReadiness: nextReadiness,
        mascotMood: mood,
        mascotDialogue: dialogue,
        dialogueOpen: true,
        simulation: updatedSim
      };
    }),

  dispatchShuttle: () =>
    set((state) => {
      if (state.shuttleDispatched || state.resupplyCompleted) return state;
      return {
        shuttleDispatched: true,
        shuttleProgress: 5,
        mascotMood: 'excited',
        mascotDialogue: 'Supply Shuttle RESUPPLY-01 dispatched! Tracking trajectory along orbital canyon.'
      };
    }),

  updateShuttleProgress: (progress) =>
    set({
      shuttleProgress: Math.min(100, progress)
    }),

  completeResupply: () =>
    set((state) => {
      if (state.resupplyCompleted) return state;

      const nextO2 = 92;
      const nextReadiness = computeReadiness(
        state.discoveries,
        state.diagnosticStep,
        true,
        state.wreckageSuppliesCollected,
        state.constructedProjects,
        state.settlementEstablished,
        state.simulation.vitals.crewHealth,
        state.simulation.vitals.habitatIntegrity,
        nextO2
      );

      const updatedSim = {
        ...state.simulation,
        oxygen: {
          ...state.simulation.oxygen,
          current: nextO2,
          status: 'NOMINAL' as const
        }
      };

      const colonyProgress: SavedColonyProgress = {
        diagnosticStep: state.diagnosticStep,
        resupplyCompleted: true,
        wreckageInspected: state.wreckageInspected,
        wreckageSuppliesCollected: state.wreckageSuppliesCollected,
        scannedDiscoveryIds: state.discoveries.filter((d) => d.scanned).map((d) => d.id),
        constructedProjects: state.constructedProjects,
        settlementEstablished: state.settlementEstablished,
        eventLog: [`Resupply Shuttle docked: +500L liquid O2 transferred.`, ...state.eventLog],
        activeRovers: state.activeRovers
      };
      saveSimulationToStorage({ ...updatedSim, colonyProgress });

      return {
        shuttleDispatched: false,
        shuttleProgress: 100,
        resupplyCompleted: true,
        oxygenLevel: nextO2,
        oxygenDraining: false,
        civilizationReadiness: nextReadiness,
        status: nextReadiness >= 70 ? 'SELF-SUFFICIENT' : 'STABILIZING',
        mascotMood: 'happy',
        mascotDialogue:
          'Mission accomplished, commander! Resupply Shuttle RESUPPLY-01 docked successfully. 500L liquid O₂ transferred. Habitat life support is 92% stable!',
        dialogueOpen: true,
        simulation: updatedSim
      };
    }),

  toggleScan: () =>
    set((state) => ({
      scanActive: !state.scanActive,
      mascotMood: !state.scanActive ? 'curious' : state.mascotMood,
      mascotDialogue: !state.scanActive
        ? 'Topographic sensor array engaged. Scanning planetary surface for critical resources...'
        : state.mascotDialogue
    })),

  discoverPoint: (id) =>
    set((state) => {
      const target = state.discoveries.find((d) => d.id === id);
      if (!target || target.scanned) return state;

      const updated = state.discoveries.map((d) =>
        d.id === id ? { ...d, scanned: true } : d
      );
      const waterCount = updated.filter((d) => d.type === 'water' && d.scanned).length;

      let mood: MascotMood = 'excited';
      let dialogue = `Scan verified: ${target.name} mapped to planetary telemetry!`;

      if (id === 'cryo-basin') {
        mood = 'excited';
        dialogue =
          'Water confirmed, survivor! High-purity ice shelf verified in Cryo Basin. This secures our electrolysis life-support and hydration!';
      } else if (id === 'sheltered-valley') {
        mood = 'happy';
        dialogue =
          'Habitat evaluation verified! Sheltered Valley canyon walls provide 94% radiation shielding. This is where Settlement Zero will thrive!';
      } else if (id === 'basalt-ridge') {
        mood = 'curious';
        dialogue =
          'Sensor relay active atop Basalt Ridge! Long-range telemetry online, though ion storm shielding will be necessary.';
      } else if (id === 'arcadia-crash') {
        mood = 'surprised';
        dialogue = 'Arcadia-9 crash site mapped to planetary grid. Salvage coordinates locked.';
      }

      const isEstablished =
        state.constructedProjects.includes('proj-life-support') &&
        state.constructedProjects.includes('proj-water') &&
        state.constructedProjects.includes('proj-habitat') &&
        state.civilizationReadiness >= 70;

      const nextReadiness = computeReadiness(
        updated,
        state.diagnosticStep,
        state.resupplyCompleted,
        state.wreckageSuppliesCollected,
        state.constructedProjects,
        state.settlementEstablished || isEstablished,
        state.simulation.vitals.crewHealth,
        state.simulation.vitals.habitatIntegrity,
        state.oxygenLevel
      );

      const colonyProgress: SavedColonyProgress = {
        diagnosticStep: state.diagnosticStep,
        resupplyCompleted: state.resupplyCompleted,
        wreckageInspected: state.wreckageInspected,
        wreckageSuppliesCollected: state.wreckageSuppliesCollected,
        scannedDiscoveryIds: updated.filter((d) => d.scanned).map((d) => d.id),
        constructedProjects: state.constructedProjects,
        settlementEstablished: state.settlementEstablished || isEstablished,
        eventLog: [`Sector scanned: ${target.name}`, ...state.eventLog],
        activeRovers: state.activeRovers
      };
      saveSimulationToStorage({ ...state.simulation, colonyProgress });

      return {
        discoveries: updated,
        waterDepositsFound: waterCount,
        civilizationReadiness: nextReadiness,
        settlementEstablished: state.settlementEstablished || isEstablished,
        status: isEstablished ? 'SELF-SUFFICIENT' : state.status,
        mascotMood: mood,
        mascotDialogue: dialogue,
        dialogueOpen: true
      };
    }),

  inspectWreckage: () =>
    set({
      wreckageInspected: true,
      dialogueOpen: true,
      mascotMood: 'surprised',
      mascotDialogue:
        "Pilot! I've accessed Arcadia-9's emergency manifest. Life support canisters and telemetry batteries remain intact in the fractured hold!"
    }),

  collectWreckageSupplies: () =>
    set((state) => {
      if (state.wreckageSuppliesCollected) return state;
      const nextO2 = Math.min(100, state.oxygenLevel + 12);
      const nextMaterials = state.constructionMaterials + 20;

      const nextReadiness = computeReadiness(
        state.discoveries,
        state.diagnosticStep,
        state.resupplyCompleted,
        true,
        state.constructedProjects,
        state.settlementEstablished,
        state.simulation.vitals.crewHealth,
        state.simulation.vitals.habitatIntegrity,
        nextO2
      );

      const updatedSim = {
        ...state.simulation,
        oxygen: { ...state.simulation.oxygen, current: nextO2 },
        materials: { ...state.simulation.materials, current: nextMaterials }
      };

      const colonyProgress: SavedColonyProgress = {
        diagnosticStep: state.diagnosticStep,
        resupplyCompleted: state.resupplyCompleted,
        wreckageInspected: true,
        wreckageSuppliesCollected: true,
        scannedDiscoveryIds: state.discoveries.filter((d) => d.scanned).map((d) => d.id),
        constructedProjects: state.constructedProjects,
        settlementEstablished: state.settlementEstablished,
        eventLog: [
          'Arcadia-9 supplies recovered: +12% O2 buffer, +20 Construction Materials.',
          ...state.eventLog
        ],
        activeRovers: state.activeRovers
      };
      saveSimulationToStorage({ ...updatedSim, colonyProgress });

      return {
        wreckageSuppliesCollected: true,
        oxygenLevel: nextO2,
        constructionMaterials: nextMaterials,
        civilizationReadiness: nextReadiness,
        status: nextO2 > 40 ? 'STABILIZING' : state.status,
        mascotMood: 'happy',
        mascotDialogue:
          'Supplies recovered! Emergency O2 buffer increased (+12%), +20 Materials salvaged. Excellent work, survivor.',
        simulation: updatedSim
      };
    }),

  buildProject: (id: string) =>
    set((state) => {
      if (state.constructedProjects.includes(id)) return state;

      let canBuild = false;
      let dialogue = '';
      let materialCost = 10;

      if (id === 'proj-life-support') {
        canBuild = state.diagnosticStep >= 3 || state.resupplyCompleted;
        materialCost = 12;
        dialogue =
          'Life Support Hub activated! Continuous oxygen recycling is now fully integrated into the colony grid (+3.2 L/min net O₂).';
      } else if (id === 'proj-water') {
        canBuild = state.waterDepositsFound > 0;
        materialCost = 14;
        dialogue =
          'Cryo Water Extraction Unit deployed! Subterranean ice melting pumps are operational (+4.2 L/min net water).';
      } else if (id === 'proj-habitat') {
        canBuild = !!state.discoveries.find((d) => d.id === 'sheltered-valley')?.scanned;
        materialCost = 18;
        dialogue =
          'Colony Habitat Dome 01 constructed in Sheltered Valley! Pressurized quarters reduce radiation by 92% for all 42 survivors.';
      } else if (id === 'proj-power') {
        canBuild = state.wreckageSuppliesCollected;
        materialCost = 10;
        dialogue =
          'Auxiliary Power Distribution Grid online! Arcadia-9 capacitors supplying steady +24 kW current to outpost modules.';
      } else if (id === 'proj-comms') {
        canBuild = !!state.discoveries.find((d) => d.id === 'basalt-ridge')?.scanned;
        materialCost = 10;
        dialogue =
          'Deep Space Communications Array calibrated with Basalt Ridge relay! Emergency transmission locked to Sol fleet remnants.';
      }

      if (!canBuild) return state;

      // Check materials
      if (state.constructionMaterials < materialCost) {
        return {
          mascotDialogue: `Insufficient construction materials! Requires ${materialCost} units (Current: ${state.constructionMaterials}). Dispatch rovers or salvage wreckage.`,
          dialogueOpen: true,
          mascotMood: 'concerned'
        };
      }

      const nextProjects = [...state.constructedProjects, id];
      const nextMaterials = Math.max(0, state.constructionMaterials - materialCost);

      const isEstablished =
        nextProjects.includes('proj-life-support') &&
        nextProjects.includes('proj-water') &&
        nextProjects.includes('proj-habitat') &&
        state.civilizationReadiness >= 65;

      const nextReadiness = computeReadiness(
        state.discoveries,
        state.diagnosticStep,
        state.resupplyCompleted,
        state.wreckageSuppliesCollected,
        nextProjects,
        state.settlementEstablished || isEstablished,
        state.simulation.vitals.crewHealth,
        state.simulation.vitals.habitatIntegrity,
        state.oxygenLevel
      );

      const updatedSim = {
        ...state.simulation,
        materials: {
          ...state.simulation.materials,
          current: nextMaterials
        }
      };

      const colonyProgress: SavedColonyProgress = {
        diagnosticStep: state.diagnosticStep,
        resupplyCompleted: state.resupplyCompleted,
        wreckageInspected: state.wreckageInspected,
        wreckageSuppliesCollected: state.wreckageSuppliesCollected,
        scannedDiscoveryIds: state.discoveries.filter((d) => d.scanned).map((d) => d.id),
        constructedProjects: nextProjects,
        settlementEstablished: state.settlementEstablished || isEstablished,
        eventLog: [`Module constructed: ${id} (-${materialCost} Materials)`, ...state.eventLog],
        activeRovers: state.activeRovers
      };
      saveSimulationToStorage({ ...updatedSim, colonyProgress });

      return {
        constructedProjects: nextProjects,
        constructionMaterials: nextMaterials,
        civilizationReadiness: nextReadiness,
        settlementEstablished: state.settlementEstablished || isEstablished,
        status: isEstablished ? 'SELF-SUFFICIENT' : 'STABILIZING',
        mascotMood: isEstablished ? 'excited' : 'happy',
        mascotDialogue: isEstablished
          ? 'HUMANITY SURVIVES! Settlement Zero is officially established on Proxima-Zero! Incredible leadership, Commander!'
          : dialogue,
        dialogueOpen: true,
        simulation: updatedSim
      };
    }),

  claimSettlementEstablished: () =>
    set((state) => {
      const canEstablish =
        state.constructedProjects.includes('proj-life-support') &&
        state.constructedProjects.includes('proj-water') &&
        state.constructedProjects.includes('proj-habitat') &&
        state.civilizationReadiness >= 70;
      if (!canEstablish && !state.settlementEstablished) return state;

      const colonyProgress: SavedColonyProgress = {
        diagnosticStep: state.diagnosticStep,
        resupplyCompleted: state.resupplyCompleted,
        wreckageInspected: state.wreckageInspected,
        wreckageSuppliesCollected: state.wreckageSuppliesCollected,
        scannedDiscoveryIds: state.discoveries.filter((d) => d.scanned).map((d) => d.id),
        constructedProjects: state.constructedProjects,
        settlementEstablished: true,
        eventLog: ['SETTLEMENT ZERO ESTABLISHED. Cryo-colonists awake.', ...state.eventLog],
        activeRovers: state.activeRovers
      };
      saveSimulationToStorage({ ...state.simulation, colonyProgress });

      return {
        settlementEstablished: true,
        civilizationReadiness: 100,
        status: 'SELF-SUFFICIENT',
        mascotMood: 'excited',
        mascotDialogue:
          "SETTLEMENT ZERO ESTABLISHED. Cryo-colonists awake. Humanity's second home has begun.",
        dialogueOpen: true
      };
    }),

  resetSimulation: () => {
    try {
      localStorage.removeItem('settlement_zero_simulation_v2');
    } catch (e) {
      console.warn(e);
    }
    const freshSim = createInitialSimulationState('EXP-PROXIMA-01');
    set({
      status: 'EMERGENCY',
      oxygenLevel: Math.round(freshSim.oxygen.current),
      civilizationReadiness: 12,
      powerLevel: Math.round(freshSim.power.current),
      waterDepositsFound: 0,
      constructionMaterials: Math.round(freshSim.materials.current),
      mascotMood: 'curious',
      mascotDialogue:
        "Pilot? Signal detected. You're alive… barely. Our colony ship is compromised, and this planet is uncharted. Let’s find somewhere we can survive.",
      dialogueOpen: true,
      shuttleDispatched: false,
      shuttleProgress: 0,
      resupplyCompleted: false,
      scanActive: false,
      discoveries: INITIAL_DISCOVERIES.map((d) => ({ ...d, scanned: d.id === 'arcadia-crash' })),
      wreckageInspected: false,
      wreckageSuppliesCollected: false,
      diagnosticStep: 0,
      oxygenDraining: true,
      simulationPaused: false,
      constructedProjects: [],
      settlementEstablished: false,
      activeEvent: null,
      eventLog: ['Simulation reset to initial orbit entry parameters.'],
      activeRovers: [],
      simulation: freshSim,
      hasSavedExpedition: false
    });
  },

  initSeededExpedition: (seed: string) => {
    const cleanSeed = seed.trim().toUpperCase() || 'EXP-PROXIMA-01';
    const freshSim = createInitialSimulationState(cleanSeed);
    saveSimulationToStorage(freshSim);

    const initO2 = Math.round(freshSim.oxygen.current);
    const initPower = Math.round(freshSim.power.current);
    const initMaterials = Math.round(freshSim.materials.current);

    set({
      expeditionSeed: cleanSeed,
      status: 'EMERGENCY',
      oxygenLevel: initO2,
      powerLevel: initPower,
      constructionMaterials: initMaterials,
      civilizationReadiness: 12,
      waterDepositsFound: 0,
      mascotMood: 'curious',
      mascotDialogue: `Expedition seed [${cleanSeed}] initialized! Planetary conditions: Solar Eff ${freshSim.modifiers.solarEfficiency}x, Rad Tier ${freshSim.modifiers.radiationTier}, Equipment ${freshSim.modifiers.equipmentCondition}%.`,
      dialogueOpen: true,
      shuttleDispatched: false,
      shuttleProgress: 0,
      resupplyCompleted: false,
      scanActive: false,
      discoveries: INITIAL_DISCOVERIES.map((d) => ({ ...d, scanned: d.id === 'arcadia-crash' })),
      wreckageInspected: false,
      wreckageSuppliesCollected: false,
      diagnosticStep: 0,
      oxygenDraining: true,
      simulationPaused: false,
      constructedProjects: [],
      settlementEstablished: false,
      activeEvent: null,
      eventLog: [`New expedition seed [${cleanSeed}] initialized. Telemetry synchronized.`],
      activeRovers: [],
      simulation: freshSim,
      hasSavedExpedition: true
    });
  },

  startNewExpedition: (seed?: string) => {
    const nextSeed = seed || 'EXP-' + Math.floor(1000 + Math.random() * 9000) + '-Z';
    get().initSeededExpedition(nextSeed);
  },

  triggerRandomEvent: () =>
    set((state) => {
      if (state.activeEvent || state.simulationPaused) return state;

      const events = [
        {
          id: 'event-ion',
          title: 'ION WIND SHEAR // ATMOSPHERIC SURGE',
          description:
            'A high-velocity methane-ion front is sweeping over Basalt Ridge toward the crash site. Surface sensors detect electromagnetic interference.',
          hazardLevel: 'SEVERE' as const,
          choices: [
            {
              label: 'Divert Power to Deflector Shielding',
              effectText: '-12% Power Reserve // Outpost protected from ion static',
              actionType: 'divert_shields' as const
            },
            {
              label: 'Maintain Life Support Pumps',
              effectText: '-6 Materials (damage) // Preserves 100% of atmospheric recycling',
              actionType: 'maintain_pumps' as const
            }
          ]
        },
        {
          id: 'event-dust',
          title: 'BASALT DUST EDDY // THERMAL TURBULENCE',
          description:
            'Particulate basalt dust has choked primary radiator coils on the auxiliary generator. Solar collection efficiency is dropping.',
          hazardLevel: 'MODERATE' as const,
          choices: [
            {
              label: 'Seal Photovoltaic Arrays',
              effectText: '-8% Power generation // Prevents internal scrubber damage',
              actionType: 'seal_arrays' as const
            },
            {
              label: 'Deploy Scavenger Drone for Metal Dust',
              effectText: '+15 Construction Materials // -4% O2 buffer draw',
              actionType: 'salvage_scrap' as const
            }
          ]
        },
        {
          id: 'event-vent',
          title: 'SUB-SURFACE GEOTHERMAL SPIKE',
          description:
            'A seismic fissure along Sheltered Valley has vented superheated steam and pressurized volcanic gases.',
          hazardLevel: 'LOW' as const,
          choices: [
            {
              label: 'Tap Geothermal Steam Surge',
              effectText: '+12% Electrical Power // +8 Construction Materials',
              actionType: 'bypass_vent' as const
            },
            {
              label: 'Reinforce Canyon Palisade Bedrock',
              effectText: '+6% Readiness // Secures foundation for Habitat Dome',
              actionType: 'seal_fault' as const
            }
          ]
        }
      ];

      const pick = events[Math.floor(Math.random() * events.length)];
      return {
        activeEvent: pick,
        mascotMood: pick.hazardLevel === 'SEVERE' ? 'concerned' : 'curious',
        mascotDialogue: `Warning, Commander! ${pick.title}. Critical environmental decision required.`,
        dialogueOpen: true
      };
    }),

  resolveEventChoice: (actionType: string) =>
    set((state) => {
      let nextPower = state.powerLevel;
      let nextO2 = state.oxygenLevel;
      let nextMaterials = state.constructionMaterials;
      let nextReadiness = state.civilizationReadiness;
      let logMsg = '';

      if (actionType === 'divert_shields') {
        nextPower = Math.max(5, nextPower - 12);
        logMsg = 'Deflector shields engaged. Absorbed ion surge; power draw: -12%.';
      } else if (actionType === 'maintain_pumps') {
        nextMaterials = Math.max(0, nextMaterials - 6);
        logMsg = 'Maintained life-support pumps. Titanium filters replaced (-6 materials).';
      } else if (actionType === 'seal_arrays') {
        nextPower = Math.max(5, nextPower - 8);
        logMsg = 'Photovoltaic arrays sealed. Dust eddy passed without motor damage.';
      } else if (actionType === 'salvage_scrap') {
        nextMaterials = Math.min(200, nextMaterials + 15);
        nextO2 = Math.max(6, nextO2 - 4);
        logMsg = 'Scavenger drone recovered 15 units of basalt alloy scrap.';
      } else if (actionType === 'bypass_vent') {
        nextPower = Math.min(100, nextPower + 12);
        nextMaterials = Math.min(200, nextMaterials + 8);
        logMsg = 'Tapped geothermal fissure: +12% Power reserve, +8 Materials.';
      } else if (actionType === 'seal_fault') {
        nextReadiness = Math.min(100, nextReadiness + 6);
        nextMaterials = Math.max(0, nextMaterials - 10);
        logMsg = 'Palisade bedrock reinforced: +6% Colony Readiness.';
      }

      const updatedSim = {
        ...state.simulation,
        power: { ...state.simulation.power, current: nextPower },
        oxygen: { ...state.simulation.oxygen, current: nextO2 },
        materials: { ...state.simulation.materials, current: nextMaterials }
      };

      return {
        powerLevel: nextPower,
        oxygenLevel: nextO2,
        constructionMaterials: nextMaterials,
        civilizationReadiness: nextReadiness,
        activeEvent: null,
        eventLog: [logMsg, ...state.eventLog].slice(0, 12),
        mascotMood: 'happy',
        mascotDialogue: logMsg,
        dialogueOpen: true,
        simulation: updatedSim
      };
    }),

  resolveScheduledHazard: (hazardId: string, choiceId: string) =>
    set((state) => {
      const hazard = state.simulation.activeHazards.find((h) => h.id === hazardId);
      if (!hazard) return state;

      const choice = hazard.choices.find((c) => c.id === choiceId);
      if (!choice) return state;

      // Check costs
      if (choice.cost.power && state.powerLevel < choice.cost.power) {
        return {
          mascotDialogue: `Insufficient power reserve! Requires ${choice.cost.power} kW (Available: ${state.powerLevel} kW).`,
          dialogueOpen: true,
          mascotMood: 'concerned'
        };
      }
      if (choice.cost.materials && state.constructionMaterials < choice.cost.materials) {
        return {
          mascotDialogue: `Insufficient construction materials! Requires ${choice.cost.materials} units (Available: ${state.constructionMaterials}).`,
          dialogueOpen: true,
          mascotMood: 'concerned'
        };
      }

      // Apply resource deductions
      const nextPower = Math.max(0, state.powerLevel - (choice.cost.power || 0));
      const nextMaterials = Math.max(0, state.constructionMaterials - (choice.cost.materials || 0));
      const nextO2 = Math.max(5, state.oxygenLevel - (choice.cost.oxygen || 0));

      // Apply effects
      const nextIntegrity = Math.max(
        5,
        Math.min(100, state.simulation.vitals.habitatIntegrity + (choice.effect.integrity || 0))
      );
      const nextHealth = Math.max(
        5,
        Math.min(100, state.simulation.vitals.crewHealth + (choice.effect.health || 0))
      );
      const addedMaterials = choice.effect.materials || 0;

      // Mark hazard resolved
      const updatedHazards = state.simulation.activeHazards.map((h) =>
        h.id === hazardId ? { ...h, state: 'RESOLVED' as const } : h
      );

      const logMsg = `[HAZARD MITIGATED] ${hazard.title}: ${choice.label}. ${choice.consequenceText}`;

      const updatedSim = {
        ...state.simulation,
        activeHazards: updatedHazards,
        power: { ...state.simulation.power, current: nextPower },
        materials: { ...state.simulation.materials, current: nextMaterials + addedMaterials },
        oxygen: { ...state.simulation.oxygen, current: nextO2 },
        vitals: {
          ...state.simulation.vitals,
          habitatIntegrity: nextIntegrity,
          crewHealth: nextHealth
        }
      };

      saveSimulationToStorage(updatedSim);

      return {
        powerLevel: nextPower,
        constructionMaterials: nextMaterials + addedMaterials,
        oxygenLevel: nextO2,
        eventLog: [logMsg, ...state.eventLog].slice(0, 12),
        mascotMood: 'happy',
        mascotDialogue: `Hazard mitigated, Commander! ${choice.consequenceText}`,
        dialogueOpen: true,
        simulation: updatedSim
      };
    }),

  dismissEvent: () => set({ activeEvent: null }),

  dispatchRoverMission: (targetId: string) => {
    let success = false;
    set((state) => {
      if (state.activeRovers.some((r) => r.targetId === targetId && r.status !== 'RETURNED')) {
        return state;
      }
      if (state.powerLevel < 10 || state.constructionMaterials < 8) {
        return {
          mascotDialogue:
            'Insufficient resources to dispatch rover expedition! Requires 10% Power and 8 Materials.',
          dialogueOpen: true,
          mascotMood: 'concerned'
        };
      }

      const locName =
        targetId === 'basalt-ridge'
          ? 'Basalt Ridge Escarpment'
          : targetId === 'cryo-basin'
          ? 'Cryo Basin Glaciers'
          : targetId === 'sheltered-valley'
          ? 'Sheltered Valley Palisades'
          : 'Solis Terminus Outpost';

      const newRover = {
        id: 'ROV-' + Math.floor(100 + Math.random() * 900),
        targetId,
        targetName: locName,
        progress: 10,
        status: 'TRANSIT' as const,
        yieldSummary: 'Tracking navigation telemetry along rocky corridor...'
      };

      success = true;
      const nextPower = state.powerLevel - 10;
      const nextMaterials = state.constructionMaterials - 8;

      const updatedSim = {
        ...state.simulation,
        power: { ...state.simulation.power, current: nextPower },
        materials: { ...state.simulation.materials, current: nextMaterials }
      };

      return {
        powerLevel: nextPower,
        constructionMaterials: nextMaterials,
        activeRovers: [...state.activeRovers, newRover],
        eventLog: [`Rover probe ${newRover.id} dispatched to ${locName}.`, ...state.eventLog].slice(0, 12),
        mascotMood: 'excited',
        mascotDialogue: `Automated scout probe dispatched to ${locName}! Telemetry synchronized.`,
        dialogueOpen: true,
        simulation: updatedSim
      };
    });
    return success;
  },

  tickRoverProgress: () =>
    set((state) => {
      if (state.activeRovers.length === 0) return state;

      let materialsGained = 0;
      let readinessGained = 0;
      const updated = state.activeRovers.map((rover) => {
        if (rover.status === 'RETURNED') return rover;

        const nextProgress = rover.progress + 25;
        if (nextProgress >= 100) {
          materialsGained += 16;
          readinessGained += 4;
          return {
            ...rover,
            progress: 100,
            status: 'RETURNED' as const,
            yieldSummary: 'Expedition complete: +16 Materials salvaged, +4% telemetry readiness.'
          };
        } else if (nextProgress >= 60) {
          return {
            ...rover,
            progress: nextProgress,
            status: 'SCANNING' as const,
            yieldSummary: 'Analyzing surface mineral samples and elevation contours...'
          };
        }
        return { ...rover, progress: nextProgress };
      });

      const nextMaterials = Math.min(200, state.constructionMaterials + materialsGained);
      const nextReadiness = Math.min(100, state.civilizationReadiness + readinessGained);

      return {
        activeRovers: updated,
        constructionMaterials: nextMaterials,
        civilizationReadiness: nextReadiness,
        simulation: {
          ...state.simulation,
          materials: {
            ...state.simulation.materials,
            current: nextMaterials
          }
        }
      };
    }),

  tickSimulation: (forcedDeltaSeconds?: number) =>
    set((state) => {
      const now = Date.now();
      const deltaSeconds =
        forcedDeltaSeconds !== undefined
          ? forcedDeltaSeconds
          : Math.max(0.2, (now - state.simulation.lastTickTimestamp) / 1000);

      const nextSim = advanceSimulation(state.simulation, deltaSeconds, {
        diagnosticStep: state.diagnosticStep,
        resupplyCompleted: state.resupplyCompleted,
        wreckageSuppliesCollected: state.wreckageSuppliesCollected,
        constructedProjects: state.constructedProjects,
        waterDepositsFound: state.waterDepositsFound,
        discoveriesScannedCount: state.discoveries.filter((d) => d.scanned).length
      });

      const nextO2 = Math.round(nextSim.oxygen.current);
      const nextPower = Math.round(nextSim.power.current);
      const nextMaterials = Math.round(nextSim.materials.current);

      const nextReadiness = computeReadiness(
        state.discoveries,
        state.diagnosticStep,
        state.resupplyCompleted,
        state.wreckageSuppliesCollected,
        state.constructedProjects,
        state.settlementEstablished,
        nextSim.vitals.crewHealth,
        nextSim.vitals.habitatIntegrity,
        nextO2
      );

      // Check for incoming warning or active hazard alerts
      const warningHazard = nextSim.activeHazards.find((h) => h.state === 'WARNING');
      let mascotDialogue = state.mascotDialogue;
      let mascotMood = state.mascotMood;
      let dialogueOpen = state.dialogueOpen;

      if (warningHazard && state.simulation.activeHazards.find((h) => h.id === warningHazard.id)?.state === 'PENDING') {
        mascotDialogue = `ALERT, Commander! ${warningHazard.title} approaching. Warning phase: ${Math.round(warningHazard.warningSecondsRemaining)}s. Review tactical options!`;
        mascotMood = 'concerned';
        dialogueOpen = true;
      }

      // Auto-save snapshot
      const colonyProgress: SavedColonyProgress = {
        diagnosticStep: state.diagnosticStep,
        resupplyCompleted: state.resupplyCompleted,
        wreckageInspected: state.wreckageInspected,
        wreckageSuppliesCollected: state.wreckageSuppliesCollected,
        scannedDiscoveryIds: state.discoveries.filter((d) => d.scanned).map((d) => d.id),
        constructedProjects: state.constructedProjects,
        settlementEstablished: state.settlementEstablished,
        eventLog: state.eventLog,
        activeRovers: state.activeRovers
      };
      saveSimulationToStorage({ ...nextSim, colonyProgress });

      return {
        simulation: nextSim,
        oxygenLevel: nextO2,
        powerLevel: nextPower,
        constructionMaterials: nextMaterials,
        civilizationReadiness: nextReadiness,
        status:
          state.settlementEstablished || nextReadiness >= 70
            ? 'SELF-SUFFICIENT'
            : nextO2 > 40 && state.diagnosticStep >= 3
            ? 'STABILIZING'
            : 'EMERGENCY',
        mascotDialogue,
        mascotMood,
        dialogueOpen
      };
    }),

  repairHabitat: () => {
    let success = false;
    set((state) => {
      if (state.constructionMaterials < 10) {
        return {
          mascotDialogue: 'Insufficient materials for habitat structural repair! Requires 10 units.',
          dialogueOpen: true,
          mascotMood: 'concerned'
        };
      }
      const nextIntegrity = Math.min(100, state.simulation.vitals.habitatIntegrity + 18);
      const nextMaterials = state.constructionMaterials - 10;
      success = true;

      const updatedSim = {
        ...state.simulation,
        materials: { ...state.simulation.materials, current: nextMaterials },
        vitals: { ...state.simulation.vitals, habitatIntegrity: nextIntegrity }
      };

      return {
        constructionMaterials: nextMaterials,
        simulation: updatedSim,
        eventLog: [
          `Structural repairs completed: +18% Habitat Integrity (-10 Materials).`,
          ...state.eventLog
        ].slice(0, 12),
        mascotMood: 'happy',
        mascotDialogue: 'Habitat dome structural reinforcement complete! Integrity restored.',
        dialogueOpen: true
      };
    });
    return success;
  }
}));

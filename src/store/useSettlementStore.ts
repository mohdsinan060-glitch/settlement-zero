import { create } from 'zustand';

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
  powerLevel: number;
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

  // Phase 5: Life Support Emergency & Diagnostic state
  diagnosticStep: number; // 0: initial, 1: inspected, 2: isolated, 3: stabilized
  oxygenDraining: boolean;
  simulationPaused: boolean;

  // Phase 6: Colony Command Center & Infrastructure Projects
  constructedProjects: string[]; // IDs of built projects
  settlementEstablished: boolean;

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

export const useSettlementStore = create<SettlementState>((set) => ({
  status: 'EMERGENCY',
  oxygenLevel: 18,
  civilizationReadiness: 12,
  powerLevel: 34,
  activeSurvivors: 42,
  waterDepositsFound: 0,

  mascotMood: 'curious',
  mascotDialogue: "Pilot? Signal detected. You're alive… barely. Our colony ship is compromised, and this planet is uncharted. Let’s find somewhere we can survive.",
  dialogueOpen: true,

  shuttleDispatched: false,
  shuttleProgress: 0,
  resupplyCompleted: false,
  scanActive: false,
  discoveries: INITIAL_DISCOVERIES,
  wreckageInspected: false,
  wreckageSuppliesCollected: false,
  diagnosticStep: 0,
  oxygenDraining: true,
  simulationPaused: false,
  constructedProjects: [],
  settlementEstablished: false,

  setMascotMood: (mood) => set({ mascotMood: mood }),

  openDialogue: (customText) =>
    set((state) => ({
      dialogueOpen: true,
      mascotDialogue: customText || state.mascotDialogue
    })),

  closeDialogue: () => set({ dialogueOpen: false }),

  setOxygenLevel: (level) =>
    set((state) => {
      const nextMood: MascotMood =
        level <= 20 ? 'emergency' : level < 50 ? 'concerned' : 'happy';
      const nextStatus: SettlementStatus =
        level > 70 && state.civilizationReadiness > 60
          ? 'SELF-SUFFICIENT'
          : level > 40
          ? 'STABILIZING'
          : 'EMERGENCY';

      return {
        oxygenLevel: Math.max(0, Math.min(100, level)),
        mascotMood: nextMood,
        status: nextStatus
      };
    }),

  tickOxygenDrain: () =>
    set((state) => {
      if (state.simulationPaused || !state.oxygenDraining || state.resupplyCompleted || state.diagnosticStep >= 3) {
        return state;
      }
      const nextO2 = Math.max(6, state.oxygenLevel - 1);
      const nextMood: MascotMood = nextO2 <= 15 ? 'emergency' : nextO2 <= 25 ? 'concerned' : state.mascotMood;
      return {
        oxygenLevel: nextO2,
        mascotMood: nextMood,
        status: 'EMERGENCY'
      };
    }),

  toggleSimulationPause: () =>
    set((state) => ({
      simulationPaused: !state.simulationPaused
    })),

  setDiagnosticStep: (step: number) =>
    set((state) => {
      // Prevent skipping steps or re-applying already completed steps
      if (step <= state.diagnosticStep || step !== state.diagnosticStep + 1) {
        return state;
      }

      let dialogue = state.mascotDialogue;
      let mood: MascotMood = state.mascotMood;
      let draining = state.oxygenDraining;
      let o2 = state.oxygenLevel;
      let readiness = state.civilizationReadiness;

      if (step === 1) {
        mood = 'concerned';
        dialogue = "Regulator inspected! Primary solenoid seal is fractured on Array B. We must isolate the circuit immediately.";
      } else if (step === 2) {
        mood = 'curious';
        dialogue = "Circuit isolated! Pressure bleed stopped. Now activate emergency reserve canisters to stabilize the buffer!";
        readiness = Math.min(100, readiness + 5);
      } else if (step === 3) {
        mood = 'happy';
        dialogue = "Life support stabilized! Emergency buffer online. We are now cleared to initiate orbital shuttle resupply.";
        draining = false;
        o2 = Math.min(100, o2 + 8);
        readiness = Math.min(100, readiness + 10);
      }

      return {
        diagnosticStep: step,
        oxygenDraining: draining,
        oxygenLevel: o2,
        civilizationReadiness: readiness,
        mascotMood: mood,
        mascotDialogue: dialogue,
        dialogueOpen: true,
      };
    }),

  dispatchShuttle: () =>
    set((state) => {
      if (state.shuttleDispatched || state.resupplyCompleted) return state;
      return {
        shuttleDispatched: true,
        shuttleProgress: 5,
        mascotMood: 'excited',
        mascotDialogue: "Supply Shuttle RESUPPLY-01 dispatched! Tracking trajectory along orbital canyon."
      };
    }),

  updateShuttleProgress: (progress) =>
    set({
      shuttleProgress: Math.min(100, progress)
    }),

  completeResupply: () =>
    set((state) => {
      if (state.resupplyCompleted) return state;
      const nextReadiness = Math.min(100, state.civilizationReadiness + 30);
      return {
        shuttleDispatched: false,
        shuttleProgress: 100,
        resupplyCompleted: true,
        oxygenLevel: 92,
        oxygenDraining: false,
        civilizationReadiness: nextReadiness,
        status: nextReadiness > 60 ? 'SELF-SUFFICIENT' : 'STABILIZING',
        mascotMood: 'happy',
        mascotDialogue: "Mission accomplished, commander! Resupply Shuttle RESUPPLY-01 docked successfully. 500L liquid O₂ transferred. Habitat life support is 92% stable!",
        dialogueOpen: true,
      };
    }),

  toggleScan: () =>
    set((state) => ({
      scanActive: !state.scanActive,
      mascotMood: !state.scanActive ? 'curious' : state.mascotMood,
      mascotDialogue: !state.scanActive
        ? "Topographic sensor array engaged. Scanning planetary surface for critical resources..."
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

      // Incremental readiness boost per sector discovery
      const pointReadiness = id === 'cryo-basin' ? 8 : id === 'sheltered-valley' ? 8 : 6;
      const nextReadiness = Math.min(100, state.civilizationReadiness + pointReadiness);

      let mood: MascotMood = 'excited';
      let dialogue = `Scan verified: ${target.name} mapped to planetary telemetry!`;

      if (id === 'cryo-basin') {
        mood = 'excited';
        dialogue = "Water confirmed, survivor! High-purity ice shelf verified in Cryo Basin. This secures our electrolysis life-support and hydration!";
      } else if (id === 'sheltered-valley') {
        mood = 'happy';
        dialogue = "Habitat evaluation verified! Sheltered Valley canyon walls provide 94% radiation shielding. This is where Settlement Zero will thrive!";
      } else if (id === 'basalt-ridge') {
        mood = 'curious';
        dialogue = "Sensor relay active atop Basalt Ridge! Long-range telemetry online, though ion storm shielding will be necessary.";
      } else if (id === 'arcadia-crash') {
        mood = 'surprised';
        dialogue = "Arcadia-9 crash site mapped to planetary grid. Salvage coordinates locked.";
      }

      const isEstablished =
        state.constructedProjects.includes('proj-life-support') &&
        state.constructedProjects.includes('proj-water') &&
        state.constructedProjects.includes('proj-habitat') &&
        nextReadiness >= 70;

      return {
        discoveries: updated,
        waterDepositsFound: waterCount,
        civilizationReadiness: nextReadiness,
        settlementEstablished: state.settlementEstablished || isEstablished,
        status: isEstablished ? 'SELF-SUFFICIENT' : state.status,
        mascotMood: mood,
        mascotDialogue: dialogue,
        dialogueOpen: true,
      };
    }),

  inspectWreckage: () =>
    set({
      wreckageInspected: true,
      dialogueOpen: true,
      mascotMood: 'surprised',
      mascotDialogue: "Pilot! I've accessed Arcadia-9's emergency manifest. Life support canisters and telemetry batteries remain intact in the fractured hold!"
    }),

  collectWreckageSupplies: () =>
    set((state) => {
      if (state.wreckageSuppliesCollected) return state;
      const nextO2 = Math.min(100, state.oxygenLevel + 12);
      const nextReadiness = Math.min(100, state.civilizationReadiness + 14);
      return {
        wreckageSuppliesCollected: true,
        oxygenLevel: nextO2,
        civilizationReadiness: nextReadiness,
        status: nextO2 > 40 ? 'STABILIZING' : state.status,
        mascotMood: 'happy',
        mascotDialogue: "Supplies recovered! Emergency O2 buffer increased (+12%) and survival beacon synchronized. Excellent work, survivor."
      };
    }),

  buildProject: (id: string) =>
    set((state) => {
      if (state.constructedProjects.includes(id)) return state;

      let canBuild = false;
      let readinessGain = 10;
      let dialogue = "";

      if (id === 'proj-life-support') {
        canBuild = state.diagnosticStep >= 3 || state.resupplyCompleted;
        readinessGain = 12;
        dialogue = "Life Support Hub activated! Continuous oxygen recycling is now fully integrated into the colony grid.";
      } else if (id === 'proj-water') {
        canBuild = state.waterDepositsFound > 0;
        readinessGain = 15;
        dialogue = "Cryo Water Extraction Unit deployed! Subterranean ice melting pumps are operational.";
      } else if (id === 'proj-habitat') {
        canBuild = !!state.discoveries.find((d) => d.id === 'sheltered-valley')?.scanned;
        readinessGain = 15;
        dialogue = "Colony Habitat Dome 01 constructed in Sheltered Valley! Pressurized quarters ready for all 42 survivors.";
      } else if (id === 'proj-power') {
        canBuild = state.wreckageSuppliesCollected;
        readinessGain = 12;
        dialogue = "Auxiliary Power Distribution Grid online! Arcadia-9 capacitors supplying steady current to outpost modules.";
      } else if (id === 'proj-comms') {
        canBuild = !!state.discoveries.find((d) => d.id === 'basalt-ridge')?.scanned;
        readinessGain = 10;
        dialogue = "Deep Space Communications Array calibrated with Basalt Ridge relay! Emergency transmission locked.";
      }

      if (!canBuild) return state;

      const nextProjects = [...state.constructedProjects, id];
      const nextReadiness = Math.min(100, state.civilizationReadiness + readinessGain);
      const isEstablished =
        nextProjects.includes('proj-life-support') &&
        nextProjects.includes('proj-water') &&
        nextProjects.includes('proj-habitat') &&
        nextReadiness >= 70;

      return {
        constructedProjects: nextProjects,
        civilizationReadiness: nextReadiness,
        settlementEstablished: state.settlementEstablished || isEstablished,
        status: isEstablished ? 'SELF-SUFFICIENT' : 'STABILIZING',
        mascotMood: isEstablished ? 'excited' : 'happy',
        mascotDialogue: isEstablished
          ? "HUMANITY SURVIVES! Settlement Zero is officially established on Proxima-Zero! Incredible leadership, Commander!"
          : dialogue,
        dialogueOpen: true,
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
      return {
        settlementEstablished: true,
        status: 'SELF-SUFFICIENT',
        mascotMood: 'excited',
        mascotDialogue: "SETTLEMENT ZERO ESTABLISHED. Cryo-colonists awake. Humanity's second home has begun.",
        dialogueOpen: true,
      };
    }),

  resetSimulation: () =>
    set({
      status: 'EMERGENCY',
      oxygenLevel: 18,
      civilizationReadiness: 12,
      powerLevel: 34,
      waterDepositsFound: 0,
      mascotMood: 'curious',
      mascotDialogue: "Pilot? Signal detected. You're alive… barely. Our colony ship is compromised, and this planet is uncharted. Let’s find somewhere we can survive.",
      dialogueOpen: true,
      shuttleDispatched: false,
      shuttleProgress: 0,
      resupplyCompleted: false,
      scanActive: false,
      discoveries: INITIAL_DISCOVERIES.map((d) => ({ ...d })),
      wreckageInspected: false,
      wreckageSuppliesCollected: false,
      diagnosticStep: 0,
      oxygenDraining: true,
      simulationPaused: false,
      constructedProjects: [],
      settlementEstablished: false
    })
}));

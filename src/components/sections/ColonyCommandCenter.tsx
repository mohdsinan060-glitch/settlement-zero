import { useState, useEffect, useRef } from 'react';
import { useSettlementStore } from '../../store/useSettlementStore';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Wind,
  Droplets,
  Home,
  Radio,
  Activity,
  Cpu,
  RefreshCw,
  Award,
  Sparkles,
  Layers
} from 'lucide-react';

interface ProjectDefinition {
  id: string;
  name: string;
  category: string;
  code: string;
  description: string;
  readinessBoost: number;
  icon: typeof ShieldCheck;
  prerequisiteDescription: string;
  isUnlocked: boolean;
  isConstructed: boolean;
  stats: { label: string; value: string }[];
}

export function ColonyCommandCenter() {
  const {
    status,
    oxygenLevel,
    civilizationReadiness,
    activeSurvivors,
    waterDepositsFound,
    wreckageSuppliesCollected,
    diagnosticStep,
    resupplyCompleted,
    discoveries,
    constructedProjects,
    settlementEstablished,
    buildProject,
    claimSettlementEstablished,
    resetSimulation,
    openDialogue
  } = useSettlementStore();

  const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'operational' | 'locked'>('all');
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [buildingProgress, setBuildingProgress] = useState(0);

  // Discovery checks
  const cryoScanned = waterDepositsFound > 0;
  const valleyScanned = !!discoveries.find((d) => d.id === 'sheltered-valley')?.scanned;
  const basaltScanned = !!discoveries.find((d) => d.id === 'basalt-ridge')?.scanned;
  const scannedSectorsCount = discoveries.filter((d) => d.scanned).length;

  // Project Definitions
  const projects: ProjectDefinition[] = [
    {
      id: 'proj-life-support',
      name: 'Atmospheric Circulation & O2 Scrubbing Hub',
      category: 'LIFE SUPPORT // CLOSED-LOOP',
      code: 'MOD-BIO-01',
      description: 'Permanent closed-loop atmospheric scrubbing array and O2 scrubbers connected directly to Arcadia-9 auxiliary tanks.',
      readinessBoost: 12,
      icon: Wind,
      prerequisiteDescription: 'Requires: Diagnostic Sequence Completed (Step 3) or Resupply Shuttle Docked',
      isUnlocked: diagnosticStep >= 3 || resupplyCompleted,
      isConstructed: constructedProjects.includes('proj-life-support'),
      stats: [
        { label: 'O2 Efficiency', value: '+18% net gain' },
        { label: 'Pressure Seal', value: '101.3 kPa norm' },
        { label: 'Power Draw', value: '14.2 kW steady' }
      ]
    },
    {
      id: 'proj-water',
      name: 'Subterranean Cryo-Water Extraction Plant',
      category: 'HYDROLOGY // SUB-SURFACE',
      code: 'MOD-HYD-02',
      description: 'Thermal drill heads tapping Cryo Basin glacier deposits for continuous potable water, hydroponics, and rocket electrolysis.',
      readinessBoost: 15,
      icon: Droplets,
      prerequisiteDescription: 'Requires: Cryo Basin Ice Deposit Scanned & Verified',
      isUnlocked: cryoScanned,
      isConstructed: constructedProjects.includes('proj-water'),
      stats: [
        { label: 'Extraction Rate', value: '420 L/cycle' },
        { label: 'Purity Index', value: '99.8% potability' },
        { label: 'Depth', value: '-84 meters' }
      ]
    },
    {
      id: 'proj-habitat',
      name: 'Colony Biosphere Habitat Dome 01',
      category: 'HABITATION // RADIATION SHIELDED',
      code: 'MOD-HAB-03',
      description: 'Reinforced geodesic biodome constructed inside Sheltered Valley basalt canyon, offering 94% ion radiation deflection for all 42 survivors.',
      readinessBoost: 15,
      icon: Home,
      prerequisiteDescription: 'Requires: Sheltered Valley Sector Scanned & Evaluated',
      isUnlocked: valleyScanned,
      isConstructed: constructedProjects.includes('proj-habitat'),
      stats: [
        { label: 'Capacity', value: '42 / 42 colonists' },
        { label: 'Rad Shielding', value: '94.2% ion barrier' },
        { label: 'Thermal Core', value: '21.5°C constant' }
      ]
    },
    {
      id: 'proj-power',
      name: 'Auxiliary Power Distribution Substation',
      category: 'ENERGY // GRID DISTRIBUTION',
      code: 'MOD-PWR-04',
      description: 'Salvaged hyper-capacitors from Arcadia-9 coupled with planetary thermal grounding rods, supplying steady 120MW current.',
      readinessBoost: 12,
      icon: Zap,
      prerequisiteDescription: 'Requires: Arcadia-9 Wreckage Power Capacitors Salvaged',
      isUnlocked: wreckageSuppliesCollected,
      isConstructed: constructedProjects.includes('proj-power'),
      stats: [
        { label: 'Output', value: '120 MW nominal' },
        { label: 'Grid Redundancy', value: 'Tri-channel backup' },
        { label: 'Capacitance', value: '98.4% balance' }
      ]
    },
    {
      id: 'proj-comms',
      name: 'Deep Space Orbital Telemetry Array',
      category: 'COMMUNICATIONS // RELAY LINK',
      code: 'MOD-COM-05',
      description: 'Sub-harmonic phased array synchronized with Basalt Ridge high-altitude relay, maintaining constant beacon ping to Sol fleet remnants.',
      readinessBoost: 10,
      icon: Radio,
      prerequisiteDescription: 'Requires: Basalt Ridge High-Altitude Sensor Relay Mapped',
      isUnlocked: basaltScanned,
      isConstructed: constructedProjects.includes('proj-comms'),
      stats: [
        { label: 'Relay Range', value: '4.2 light-years' },
        { label: 'Signal SNR', value: '+34 dB clean' },
        { label: 'Frequency', value: '1420.4 MHz ping' }
      ]
    }
  ];

  const buildTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (buildTimerRef.current) clearInterval(buildTimerRef.current);
    };
  }, []);

  // Construction handler with simulated holographic assembly
  const handleConstruct = (projId: string) => {
    if (buildingId) return;
    setBuildingId(projId);
    setBuildingProgress(0);

    buildTimerRef.current = setInterval(() => {
      setBuildingProgress((prev) => {
        if (prev >= 100) {
          if (buildTimerRef.current) clearInterval(buildTimerRef.current);
          buildProject(projId);
          setBuildingId(null);
          setBuildingProgress(0);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'operational') return p.isConstructed;
    if (activeTab === 'ready') return p.isUnlocked && !p.isConstructed;
    if (activeTab === 'locked') return !p.isUnlocked && !p.isConstructed;
    return true;
  });

  // Colony Objectives
  const objectives = [
    {
      title: 'Planetary Descent & Orbital Entry',
      detail: 'Atmospheric entry trajectory confirmed. Surface coordinate lock at Proxima-Zero.',
      completed: true
    },
    {
      title: 'Arcadia-9 Hull Investigation & Salvage',
      detail: 'Recover intact O2 canisters and hyper-capacitors from the crashed colony vessel.',
      completed: wreckageSuppliesCollected
    },
    {
      title: 'Planetary Topographic Sensor Survey',
      detail: 'Identify all four planetary points of interest (Crash Site, Cryo Basin, Ridge, Valley).',
      completed: scannedSectorsCount === 4,
      subtext: `${scannedSectorsCount}/4 Sectors Mapped`
    },
    {
      title: 'Life Support Diagnostics & Shuttle Docking',
      detail: 'Isolate fractured regulator circuit and dock Resupply Shuttle RESUPPLY-01.',
      completed: diagnosticStep >= 3 && resupplyCompleted
    },
    {
      title: 'Construct Essential Colony Modules',
      detail: 'Deploy Life Support, Water Extraction, and Habitat Dome 01.',
      completed:
        constructedProjects.includes('proj-life-support') &&
        constructedProjects.includes('proj-water') &&
        constructedProjects.includes('proj-habitat'),
      subtext: `${constructedProjects.length}/5 Modules Operational`
    },
    {
      title: 'Attain Colony Self-Sufficiency (Readiness ≥ 70%)',
      detail: 'Establish long-term survival threshold and certify Settlement Zero outpost.',
      completed: settlementEstablished || civilizationReadiness >= 70,
      subtext: `Current Readiness: ${civilizationReadiness}%`
    }
  ];

  const canClaimSettlement =
    !settlementEstablished &&
    constructedProjects.includes('proj-life-support') &&
    constructedProjects.includes('proj-water') &&
    constructedProjects.includes('proj-habitat') &&
    civilizationReadiness >= 70;

  const isCelebrationReady = settlementEstablished || canClaimSettlement;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', width: '100%' }}>
      {/* =========================================================================
          HEADER & STATUS OVERVIEW
          ========================================================================= */}
      <div>
        <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="var(--cyan)" />
          <span>CHAPTER 05 // COMMAND OPERATING SYSTEM</span>
        </div>

        <h2 className="title-display h-sec" style={{ marginTop: '16px', marginBottom: '14px' }}>
          COLONY COMMAND CENTER
        </h2>

        <p className="hero-desc">
          Unified civilization administration console. Oversee resource allocation, deploy vital infrastructure,
          monitor survivor biometrics, and secure permanent self-sufficiency on Proxima-Zero.
        </p>
      </div>

      {/* =========================================================================
          REAL-TIME TELEMETRY MATRIX
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          background: 'rgba(12, 18, 28, 0.7)',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid var(--line)'
        }}
      >
        {/* Metric 1: Civilization Readiness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.15em' }}>
              READINESS INDEX
            </span>
            <Activity size={14} color="var(--cyan)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--bone)' }}>
              {civilizationReadiness}%
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>
              {civilizationReadiness >= 70 ? 'SUFFICIENT' : 'STABILIZING'}
            </span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${civilizationReadiness}%`,
                background: civilizationReadiness >= 70 ? 'var(--cyan)' : 'var(--amber)',
                transition: 'width 0.6s ease-out'
              }}
            />
          </div>
        </div>

        {/* Metric 2: Active Survivors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.15em' }}>
              SURVIVORS SECURED
            </span>
            <Home size={14} color="#10b981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--bone)' }}>
              {activeSurvivors}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#10b981' }}>
              100% VIABLE
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
            Biometrics monitored via Z-01
          </span>
        </div>

        {/* Metric 3: Atmospheric Buffer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.15em' }}>
              O2 ATMOSPHERE
            </span>
            <Wind size={14} color={oxygenLevel > 40 ? 'var(--cyan)' : 'var(--rust)'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--bone)' }}>
              {oxygenLevel}%
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: oxygenLevel > 50 ? 'var(--cyan)' : oxygenLevel > 25 ? 'var(--amber)' : 'var(--rust)'
              }}
            >
              {oxygenLevel > 50 ? 'STABLE' : oxygenLevel > 25 ? 'RECOVERING' : 'CRITICAL'}
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
            {resupplyCompleted ? 'Resupply docked (+500L buffer)' : 'Circulation scrubbers running'}
          </span>
        </div>

        {/* Metric 4: Hydrological Reserves */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.15em' }}>
              HYDROLOGY
            </span>
            <Droplets size={14} color={cryoScanned ? 'var(--cyan)' : 'var(--muted)'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--bone)' }}>
              {cryoScanned ? 'SECURED' : 'UNMAPPED'}
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
            {cryoScanned ? 'Cryo Basin glacier verified' : 'Requires sector scan'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          SETTLEMENT ZERO ESTABLISHED BANNER (IF UNLOCKED)
          ========================================================================= */}
      {isCelebrationReady && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(12, 18, 28, 0.95))',
            border: '1px solid var(--cyan)',
            borderRadius: '8px',
            padding: '32px',
            boxShadow: '0 0 40px rgba(0, 229, 255, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle background glow element */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(0,229,255,0.2) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  background: 'rgba(0, 229, 255, 0.2)',
                  borderRadius: '4px',
                  border: '1px solid var(--cyan)'
                }}
              >
                <Award size={16} color="var(--cyan)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.2em',
                    color: 'var(--cyan)',
                    fontWeight: 600
                  }}
                >
                  SETTLEMENT ZERO ESTABLISHED // OUTPOST ALPHA
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                GLOBAL STATUS: {status}
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 600,
                color: 'var(--bone)',
                margin: 0
              }}
            >
              HUMANITY'S SECOND CRADLE HAS AWOKEN
            </h3>

            <p style={{ color: 'var(--bone-dim)', lineHeight: 1.7, maxWidth: '75ch', margin: 0 }}>
              Through coordinated salvage, planetary mapping, life-support stabilization, and modular infrastructure construction,
              all 42 survivors of the Arcadia-9 colony vessel are sheltered in pressurized geodesic habitats with permanent water,
              recycled breathable air, and independent 120MW auxiliary power.
            </p>

            {/* Comprehensive Survival Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginTop: '8px'
              }}
            >
              <div style={{ background: 'rgba(0,0,0,0.45)', padding: '12px 14px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.25)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>1. SURVIVORS SECURED</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#10b981', fontWeight: 600 }}>42 / 42 VIABLE</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.45)', padding: '12px 14px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.25)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>2. OXYGEN RESERVE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--cyan)', fontWeight: 600 }}>{oxygenLevel}% NOMINAL</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.45)', padding: '12px 14px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.25)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>3. WATER DISCOVERY</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--bone)', fontWeight: 600 }}>CRYO GLACIER (420 L/c)</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.45)', padding: '12px 14px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.25)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>4. INFRASTRUCTURE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#10b981', fontWeight: 600 }}>{constructedProjects.length} / 5 OPERATIONAL</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.45)', padding: '12px 14px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.25)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>5. COLONY READINESS</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--cyan)', fontWeight: 600 }}>{civilizationReadiness}% CERTIFIED</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.45)', padding: '12px 14px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.25)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>6. COMMS STATUS</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--amber)', fontWeight: 600 }}>DEEP SPACE BEACON</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
              {canClaimSettlement && (
                <button
                  onClick={claimSettlementEstablished}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                >
                  <Sparkles size={16} />
                  <span>RATIFY SETTLEMENT ACCORD</span>
                </button>
              )}

              <button
                onClick={() =>
                  openDialogue(
                    "Commander! Telemetry confirms our outpost is fully operational! The distress beacon has been transformed into a civilization beacon. Settlement Zero is our home now!"
                  )
                }
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Radio size={14} />
                <span>CONSULT Z-01 LOGS</span>
              </button>

              <button
                onClick={resetSimulation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--bone-dim)',
                  padding: '12px 18px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} />
                <span>RESET SIMULATION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INFRASTRUCTURE CONSTRUCTION MATRIX
          ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--cyan)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--bone)', margin: 0 }}>
                COLONY INFRASTRUCTURE GRID
              </h3>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '4px', margin: 0 }}>
              {constructedProjects.length} OF 5 CORE INSTALLATIONS DEPLOYED // READINESS GAIN: +{constructedProjects.length * 12}%
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '4px', border: '1px solid var(--line)' }}>
            {(['all', 'ready', 'operational', 'locked'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px',
                  background: activeTab === tab ? 'var(--cyan)' : 'transparent',
                  color: activeTab === tab ? 'var(--void)' : 'var(--bone-dim)',
                  border: 'none',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Construction Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredProjects.map((proj) => {
            const Icon = proj.icon;
            const isBuilding = buildingId === proj.id;

            return (
              <div
                key={proj.id}
                style={{
                  background: proj.isConstructed
                    ? 'rgba(10, 24, 22, 0.7)'
                    : proj.isUnlocked
                    ? 'rgba(16, 22, 34, 0.8)'
                    : 'rgba(10, 14, 20, 0.5)',
                  border: `1px solid ${
                    proj.isConstructed
                      ? '#10b981'
                      : proj.isUnlocked
                      ? 'var(--line-cyan)'
                      : 'var(--line)'
                  }`,
                  borderRadius: '6px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: proj.isConstructed
                    ? '0 0 20px rgba(16, 185, 129, 0.12)'
                    : proj.isUnlocked
                    ? '0 0 20px rgba(0, 229, 255, 0.08)'
                    : 'none',
                  transition: 'all 0.3s ease-out'
                }}
              >
                {/* Card Top: Code & Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        background: proj.isConstructed
                          ? 'rgba(16, 185, 129, 0.15)'
                          : proj.isUnlocked
                          ? 'rgba(0, 229, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon
                        size={18}
                        color={
                          proj.isConstructed
                            ? '#10b981'
                            : proj.isUnlocked
                            ? 'var(--cyan)'
                            : 'var(--muted)'
                        }
                      />
                    </div>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.15em' }}>
                        {proj.code}
                      </span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone-dim)', letterSpacing: '0.1em' }}>
                        {proj.category}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {proj.isConstructed ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          borderRadius: '3px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          letterSpacing: '0.15em'
                        }}
                      >
                        <CheckCircle2 size={12} />
                        OPERATIONAL
                      </span>
                    ) : proj.isUnlocked ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'rgba(0, 229, 255, 0.12)',
                          color: 'var(--cyan)',
                          borderRadius: '3px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          letterSpacing: '0.15em'
                        }}
                      >
                        <Zap size={12} />
                        READY TO DEPLOY
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--muted)',
                          borderRadius: '3px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          letterSpacing: '0.15em'
                        }}
                      >
                        <Lock size={12} />
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Title & Description */}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--bone)', margin: '0 0 8px 0' }}>
                    {proj.name}
                  </h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--bone-dim)', lineHeight: 1.6, margin: 0 }}>
                    {proj.description}
                  </p>
                </div>

                {/* Telemetry Stats */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '4px'
                  }}
                >
                  {proj.stats.map((stat, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                        {stat.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone)', fontWeight: 500 }}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Prerequisite or Action Button */}
                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  {proj.isConstructed ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#10b981' }}>
                        SYSTEM RUNNING // ZERO FAULTS
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                        +{proj.readinessBoost}% Readiness
                      </span>
                    </div>
                  ) : proj.isUnlocked ? (
                    <div>
                      {isBuilding ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>
                            <span>FABRICATING MODULE...</span>
                            <span>{buildingProgress}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${buildingProgress}%`, background: 'var(--cyan)', transition: 'width 0.15s ease-out' }} />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConstruct(proj.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px',
                            background: 'var(--cyan)',
                            color: 'var(--void)',
                            border: 'none',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            boxShadow: '0 0 16px rgba(0, 229, 255, 0.25)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Cpu size={14} />
                          <span>CONSTRUCT MODULE (+{proj.readinessBoost}% READINESS)</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <Lock size={13} color="var(--muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
                        {proj.prerequisiteDescription}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          COLONY OBJECTIVE TRACKER PANEL
          ========================================================================= */}
      <div
        style={{
          background: 'rgba(12, 18, 28, 0.7)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={16} color="var(--cyan)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--bone)', margin: 0 }}>
              MISSION OBJECTIVE TRACKER
            </h3>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>
            STATUS: {objectives.filter((o) => o.completed).length} / {objectives.length} ACHIEVED
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {objectives.map((obj, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: obj.completed ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${obj.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                borderRadius: '4px',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: obj.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {obj.completed ? (
                    <CheckCircle2 size={14} color="#10b981" />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                      0{idx + 1}
                    </span>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: obj.completed ? 'var(--bone)' : 'var(--bone-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {obj.title}
                    {obj.subtext && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)' }}>
                        [{obj.subtext}]
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    {obj.detail}
                  </div>
                </div>
              </div>

              <div>
                {obj.completed ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: '#10b981',
                      letterSpacing: '0.15em',
                      fontWeight: 600
                    }}
                  >
                    COMPLETE
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--amber)',
                      letterSpacing: '0.15em'
                    }}
                  >
                    PENDING
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useSettlementStore } from '../../store/useSettlementStore';
import {
  Activity,
  Play,
  Pause,
  Clock,
  Radio,
  Zap,
  Droplets,
  Wind,
  Apple,
  Boxes,
  Heart,
  Shield,
  Thermometer,
  Sun,
  AlertTriangle,
  RotateCcw,
  Send,
  X
} from 'lucide-react';

export function LiveSimulationDashboard() {
  const {
    simulation,
    oxygenLevel,
    powerLevel,
    constructionMaterials,
    activeSurvivors,
    eventLog,
    activeRovers,
    toggleSimulationPause,
    setSimulationSpeed,
    tickSimulation,
    startNewExpedition,
    resolveScheduledHazard,
    dispatchRoverMission,
    tickRoverProgress,
    repairHabitat
  } = useSettlementStore();

  const [newExpeditionModalOpen, setNewExpeditionModalOpen] = useState(false);
  const [customSeedInput, setCustomSeedInput] = useState('');
  const [selectedRoverTarget, setSelectedRoverTarget] = useState('cryo-basin');

  // Authoritative simulation clock loop using requestAnimationFrame / interval
  const lastTickTimeRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;
      tickSimulation(deltaSec);
      tickRoverProgress();
    }, 1000);

    return () => clearInterval(timer);
  }, [tickSimulation, tickRoverProgress]);

  const clock = simulation.clock;
  const vitals = simulation.vitals;
  const mod = simulation.modifiers;
  const activeHazards = simulation.activeHazards.filter(
    (h) => h.state === 'WARNING' || h.state === 'ACTIVE'
  );

  const formatTime = (hour: number, min: number) => {
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  const handleConfirmNewExpedition = () => {
    const seed = customSeedInput.trim() || undefined;
    startNewExpedition(seed);
    setNewExpeditionModalOpen(false);
    setCustomSeedInput('');
  };

  return (
    <div
      style={{
        background: 'rgba(9, 14, 22, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--line-cyan)',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '40px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.75), inset 0 0 24px rgba(0, 229, 255, 0.04)',
        position: 'relative'
      }}
    >
      {/* =========================================================================
          SECTION 1: SIMULATION MASTER CLOCK & EXPEDITION STATUS
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid var(--line-soft)',
          paddingBottom: '20px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '6px',
              background: clock.isRunning
                ? 'rgba(0, 229, 255, 0.12)'
                : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${clock.isRunning ? 'var(--cyan)' : 'var(--amber)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: clock.isRunning ? 'var(--cyan)' : 'var(--amber)'
            }}
          >
            <Clock size={22} className={clock.isRunning ? 'animate-pulse' : ''} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--bone)',
                  letterSpacing: '0.06em'
                }}
              >
                SOL {String(clock.sol).padStart(2, '0')} // {formatTime(clock.solHour, clock.solMinute)}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '3px',
                  letterSpacing: '0.12em',
                  background: clock.isRunning ? 'rgba(0, 229, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: clock.isRunning ? 'var(--cyan)' : '#ef4444',
                  border: `1px solid ${clock.isRunning ? 'rgba(0, 229, 255, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                {clock.isRunning ? 'LIVE ENGINE' : 'PAUSED'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                WORLD SEED: <strong style={{ color: 'var(--cyan)' }}>{mod.seed}</strong> ({mod.seedId})
              </span>
              <span style={{ color: 'var(--line-soft)' }}>•</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                SOLAR EFF: <strong style={{ color: 'var(--bone)' }}>{mod.solarEfficiency}x</strong>
              </span>
              <span style={{ color: 'var(--line-soft)' }}>•</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                RAD TIER: <strong style={{ color: mod.radiationTier === 'SEVERE' ? '#ef4444' : 'var(--amber)' }}>{mod.radiationTier}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Master Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Pause / Play */}
          <button
            onClick={toggleSimulationPause}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              background: clock.isRunning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 229, 255, 0.2)',
              borderColor: clock.isRunning ? 'var(--amber)' : 'var(--cyan)',
              color: clock.isRunning ? 'var(--amber)' : 'var(--cyan)'
            }}
          >
            {clock.isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{clock.isRunning ? 'Pause Engine' : 'Resume Engine'}</span>
          </button>

          {/* Speed Toggles */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '4px',
              border: '1px solid var(--line)',
              padding: '2px'
            }}
          >
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                style={{
                  padding: '4px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: clock.speedMultiplier === spd ? 'var(--cyan)' : 'transparent',
                  color: clock.speedMultiplier === spd ? '#000' : 'var(--bone-dim)',
                  borderRadius: '3px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* New Expedition Trigger */}
          <button
            onClick={() => setNewExpeditionModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '11px', gap: '6px' }}
          >
            <RotateCcw size={13} color="var(--cyan)" />
            <span>New Expedition</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ACTIVE CAUSAL ALERTS BANNER
          ========================================================================= */}
      {vitals.causalAlerts.length > 0 && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {vitals.causalAlerts.map((alert, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} color="#ef4444" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#fca5a5'
                }}
              >
                {alert}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          SECTION 2: CORE INTERCONNECTED RESOURCES (NET RATES & CAPACITIES)
          ========================================================================= */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div className="eyebrow" style={{ color: 'var(--cyan)' }}>
            <Activity size={13} />
            <span>INTERCONNECTED LIFE SUPPORT & ENERGY MATRIX</span>
          </div>
          <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
            CALCULATED FROM ACTIVE HARDWARE & CONSUMPTION
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px'
          }}
        >
          {/* Oxygen Card */}
          <div
            style={{
              background: 'rgba(12, 18, 28, 0.75)',
              border: `1px solid ${oxygenLevel <= 20 ? '#ef4444' : 'var(--line-cyan)'}`,
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
                <Wind size={15} />
                <span className="mono-tag" style={{ fontSize: '11px', fontWeight: 600 }}>OXYGEN</span>
              </div>
              <span
                className="mono-tag"
                style={{
                  fontSize: '10px',
                  color: simulation.oxygen.ratePerMin >= 0 ? '#34d399' : '#ef4444'
                }}
              >
                {simulation.oxygen.ratePerMin >= 0 ? '+' : ''}
                {simulation.oxygen.ratePerMin.toFixed(2)} %/min
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: oxygenLevel <= 20 ? '#ef4444' : 'var(--bone)' }}>
                {oxygenLevel}%
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                / 100% buffer
              </span>
            </div>
            <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${oxygenLevel}%`,
                  background: oxygenLevel <= 20 ? '#ef4444' : 'var(--cyan)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--bone-dim)', marginTop: '6px' }}>
              Prod: +{simulation.oxygen.productionPerMin} // Draw: -{simulation.oxygen.consumptionPerMin}
            </span>
          </div>

          {/* Water Card */}
          <div
            style={{
              background: 'rgba(12, 18, 28, 0.75)',
              border: `1px solid ${simulation.water.current <= 15 ? '#ef4444' : 'var(--line-cyan)'}`,
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                <Droplets size={15} />
                <span className="mono-tag" style={{ fontSize: '11px', fontWeight: 600 }}>WATER ICE</span>
              </div>
              <span
                className="mono-tag"
                style={{
                  fontSize: '10px',
                  color: simulation.water.ratePerMin >= 0 ? '#34d399' : '#ef4444'
                }}
              >
                {simulation.water.ratePerMin >= 0 ? '+' : ''}
                {simulation.water.ratePerMin.toFixed(2)} L/min
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--bone)' }}>
                {simulation.water.current.toFixed(1)} L
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                / {simulation.water.max} L max
              </span>
            </div>
            <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(simulation.water.current / simulation.water.max) * 100}%`,
                  background: '#38bdf8',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--bone-dim)', marginTop: '6px' }}>
              Prod: +{simulation.water.productionPerMin} // Crew draw: -{simulation.water.consumptionPerMin}
            </span>
          </div>

          {/* Power Grid Card */}
          <div
            style={{
              background: 'rgba(12, 18, 28, 0.75)',
              border: `1px solid ${powerLevel <= 15 ? '#ef4444' : 'var(--line-cyan)'}`,
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber)' }}>
                <Zap size={15} />
                <span className="mono-tag" style={{ fontSize: '11px', fontWeight: 600 }}>POWER BATTERY</span>
              </div>
              <span
                className="mono-tag"
                style={{
                  fontSize: '10px',
                  color: simulation.power.ratePerMin >= 0 ? '#34d399' : '#ef4444'
                }}
              >
                {simulation.power.ratePerMin >= 0 ? '+' : ''}
                {simulation.power.ratePerMin.toFixed(1)} kW net
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--bone)' }}>
                {powerLevel}%
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                / 100% capacity
              </span>
            </div>
            <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${powerLevel}%`,
                  background: powerLevel <= 15 ? '#ef4444' : 'var(--amber)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--bone-dim)', marginTop: '6px' }}>
              Gen: {vitals.powerGeneration} kW // Load: {vitals.powerDemand} kW
            </span>
          </div>

          {/* Food Rations Card */}
          <div
            style={{
              background: 'rgba(12, 18, 28, 0.75)',
              border: '1px solid var(--line-cyan)',
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a7f3d0' }}>
                <Apple size={15} />
                <span className="mono-tag" style={{ fontSize: '11px', fontWeight: 600 }}>FOOD RATIONS</span>
              </div>
              <span
                className="mono-tag"
                style={{
                  fontSize: '10px',
                  color: simulation.food.ratePerMin >= 0 ? '#34d399' : '#ef4444'
                }}
              >
                {simulation.food.ratePerMin >= 0 ? '+' : ''}
                {simulation.food.ratePerMin.toFixed(2)}/min
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--bone)' }}>
                {simulation.food.current.toFixed(1)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                / {simulation.food.max} units
              </span>
            </div>
            <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(simulation.food.current / simulation.food.max) * 100}%`,
                  background: '#a7f3d0',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--bone-dim)', marginTop: '6px' }}>
              Prod: +{simulation.food.productionPerMin} // Crew draw: -{simulation.food.consumptionPerMin}
            </span>
          </div>

          {/* Construction Materials Card */}
          <div
            style={{
              background: 'rgba(12, 18, 28, 0.75)',
              border: '1px solid var(--line-cyan)',
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc' }}>
                <Boxes size={15} />
                <span className="mono-tag" style={{ fontSize: '11px', fontWeight: 600 }}>MATERIALS</span>
              </div>
              <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--cyan)' }}>
                SALVAGE STOCK
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--bone)' }}>
                {constructionMaterials}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                / 200 units
              </span>
            </div>
            <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(constructionMaterials / 200) * 100}%`,
                  background: '#c084fc',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--bone-dim)', marginTop: '6px' }}>
              Used for infrastructure construction & repairs
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: COLONY VITALS & ENVIRONMENTAL TELEMETRY
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}
      >
        {/* Crew Health Card */}
        <div
          style={{
            background: 'rgba(12, 18, 28, 0.65)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            padding: '12px 14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e' }}>
              <Heart size={14} />
              <span className="mono-tag" style={{ fontSize: '10px' }}>CREW HEALTH</span>
            </div>
            <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
              {activeSurvivors} Colonists
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: vitals.crewHealth < 50 ? '#ef4444' : 'var(--bone)' }}>
              {vitals.crewHealth.toFixed(1)}%
            </span>
            <span style={{ fontSize: '10px', color: vitals.crewHealth > 80 ? '#34d399' : 'var(--amber)' }}>
              {vitals.crewHealth > 80 ? 'PHYSIO STABLE' : 'HYPOXIA WARNING'}
            </span>
          </div>
        </div>

        {/* Habitat Integrity Card */}
        <div
          style={{
            background: 'rgba(12, 18, 28, 0.65)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            padding: '12px 14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
              <Shield size={14} />
              <span className="mono-tag" style={{ fontSize: '10px' }}>HABITAT INTEGRITY</span>
            </div>
            {constructionMaterials >= 10 && vitals.habitatIntegrity < 95 && (
              <button
                onClick={repairHabitat}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--line-cyan)',
                  color: 'var(--cyan)',
                  borderRadius: '3px',
                  padding: '1px 6px',
                  fontSize: '9px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                +18% Repair (-10 Mat)
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--bone)' }}>
              {vitals.habitatIntegrity.toFixed(1)}%
            </span>
            <span style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
              Structural seals nominal
            </span>
          </div>
        </div>

        {/* Radiation Exposure Card */}
        <div
          style={{
            background: 'rgba(12, 18, 28, 0.65)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            padding: '12px 14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber)' }}>
              <Sun size={14} />
              <span className="mono-tag" style={{ fontSize: '10px' }}>RADIATION</span>
            </div>
            <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
              IONIZING FLUX
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--bone)' }}>
              {vitals.radiationInternal} mSv/h
            </span>
            <span style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
              (Surface: {vitals.radiationAmbient} mSv/h)
            </span>
          </div>
        </div>

        {/* Temperature Card */}
        <div
          style={{
            background: 'rgba(12, 18, 28, 0.65)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            padding: '12px 14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#67e8f9' }}>
              <Thermometer size={14} />
              <span className="mono-tag" style={{ fontSize: '10px' }}>TEMPERATURE</span>
            </div>
            <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
              THERMAL BALANCE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--bone)' }}>
              {vitals.internalTemp}°C
            </span>
            <span style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
              (Exterior: {vitals.surfaceTemp}°C)
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: ACTIVE & UPCOMING PLANETARY HAZARDS (Z-01 TACTICAL INTERACTION)
          ========================================================================= */}
      {activeHazards.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div className="eyebrow" style={{ color: '#ef4444', marginBottom: '12px' }}>
            <AlertTriangle size={14} />
            <span>CRITICAL ENVIRONMENTAL HAZARD IN PROGRESS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeHazards.map((hazard) => (
              <div
                key={hazard.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: '#ef4444',
                        letterSpacing: '0.12em',
                        fontWeight: 700
                      }}
                    >
                      {hazard.state === 'WARNING' ? `INCOMING HAZARD (T-${Math.round(hazard.warningSecondsRemaining)}s)` : 'ACTIVE STORM IMPACT'}
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--bone)', margin: '4px 0 0' }}>
                      {hazard.title}
                    </h4>
                  </div>
                  <span
                    className="mono-tag"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '4px 8px'
                    }}
                  >
                    HAZARD LEVEL: {hazard.hazardLevel}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--bone-dim)', lineHeight: 1.6, margin: '0 0 12px' }}>
                  {hazard.description}
                </p>

                {/* Tactical Z-01 Advice */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderLeft: '3px solid var(--cyan)',
                    padding: '10px 14px',
                    borderRadius: '0 4px 4px 0',
                    marginBottom: '16px'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--bone)', fontStyle: 'italic', display: 'block' }}>
                    {hazard.tacticalAdvice}
                  </span>
                </div>

                {/* Tactical Decision Choices */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {hazard.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => resolveScheduledHazard(hazard.id, choice.id)}
                      style={{
                        background: 'rgba(15, 23, 35, 0.9)',
                        border: '1px solid var(--line-cyan)',
                        borderRadius: '6px',
                        padding: '12px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cyan)';
                        e.currentTarget.style.background = 'rgba(0, 229, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--line-cyan)';
                        e.currentTarget.style.background = 'rgba(15, 23, 35, 0.9)';
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--bone)', display: 'block' }}>
                        {choice.label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--cyan)', marginTop: '4px', display: 'block' }}>
                        {choice.consequenceText}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--bone-dim)', marginTop: '4px', display: 'block' }}>
                        Trade-off: {choice.tradeoffSummary}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5: SURFACE ROVER PROBES & MINING EXPEDITIONS
          ========================================================================= */}
      <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '20px', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--cyan)' }}>
              <Radio size={13} />
              <span>AUTOMATED SCOUT ROVER EXPEDITIONS</span>
            </div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--bone)', margin: '4px 0 0' }}>
              RESOURCE HARVEST & TOPOGRAPHIC EXPEDITIONS
            </h4>
          </div>

          {/* Dispatch Rover Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedRoverTarget}
              onChange={(e) => setSelectedRoverTarget(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid var(--line)',
                color: 'var(--bone)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '6px 10px',
                borderRadius: '4px'
              }}
            >
              <option value="cryo-basin">Cryo Basin Glaciers (Water Ice)</option>
              <option value="basalt-ridge">Basalt Ridge (Telemetry & Metals)</option>
              <option value="sheltered-valley">Sheltered Valley (Bedrock & Minerals)</option>
              <option value="solis-terminus">Solis Terminus (Photovoltaic Scrap)</option>
            </select>

            <button
              onClick={() => dispatchRoverMission(selectedRoverTarget)}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '11px', gap: '6px' }}
            >
              <Send size={12} />
              <span>Dispatch Rover (10 kW, 8 Mat)</span>
            </button>
          </div>
        </div>

        {/* Active Rovers List */}
        {activeRovers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {activeRovers.map((rover) => (
              <div
                key={rover.id}
                style={{
                  background: 'rgba(12, 18, 28, 0.7)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--bone)' }}>
                    PROBE {rover.id} → {rover.targetName}
                  </span>
                  <span
                    className="mono-tag"
                    style={{
                      fontSize: '9px',
                      color: rover.status === 'RETURNED' ? '#34d399' : 'var(--cyan)'
                    }}
                  >
                    {rover.status}
                  </span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', margin: '8px 0' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${rover.progress}%`,
                      background: rover.status === 'RETURNED' ? '#34d399' : 'var(--cyan)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                <span style={{ fontSize: '10px', color: 'var(--bone-dim)', fontFamily: 'var(--font-mono)' }}>
                  {rover.yieldSummary}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '16px',
              borderRadius: '6px',
              border: '1px dashed var(--line)',
              textAlign: 'center',
              color: 'var(--bone-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px'
            }}
          >
            No active rovers dispatched. Dispatch a probe to harvest surface materials and accelerate colony readiness.
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 6: REAL-TIME COLONY MISSION EVENT LOG
          ========================================================================= */}
      <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '16px', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
            COLONY TELEMETRY CHRONOLOGY // RECENT EVENTS
          </span>
          <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--cyan)' }}>
            BUFFER: {eventLog.length} RECORDS
          </span>
        </div>
        <div
          style={{
            background: 'rgba(5, 8, 14, 0.7)',
            borderRadius: '4px',
            border: '1px solid var(--line)',
            padding: '10px 14px',
            maxHeight: '110px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {eventLog.slice(0, 5).map((log, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--cyan)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>▸</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)', lineHeight: 1.4 }}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          NEW EXPEDITION CONFIRMATION MODAL
          ========================================================================= */}
      {newExpeditionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(2, 5, 9, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: 'min(500px, 94vw)',
              background: 'rgba(10, 16, 26, 0.98)',
              border: '1px solid var(--line-cyan)',
              borderRadius: '8px',
              padding: '28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--amber)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--bone)', margin: 0 }}>
                  CONFIRM NEW EXPEDITION
                </h3>
              </div>
              <button
                onClick={() => setNewExpeditionModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--bone-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--bone-dim)', lineHeight: 1.6, margin: '0 0 18px' }}>
              Starting a new expedition generates a new world seed, establishing completely unique planetary parameters (solar efficiency, radiation tier, mineral richness, and hazard schedules). Current unsaved progress will be cleared.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--cyan)',
                  marginBottom: '6px'
                }}
              >
                OPTIONAL SEED OVERRIDE (LEAVE BLANK FOR RANDOM):
              </label>
              <input
                type="text"
                placeholder="e.g. EXP-ALPHA-09"
                value={customSeedInput}
                onChange={(e) => setCustomSeedInput(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: 'var(--bone)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setNewExpeditionModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '11px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNewExpedition}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '11px',
                  background: 'var(--cyan)',
                  color: '#000'
                }}
              >
                Initialize Expedition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

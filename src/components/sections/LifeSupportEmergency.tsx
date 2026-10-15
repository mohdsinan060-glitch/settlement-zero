import { useEffect, useState, useRef } from 'react';
import { useSettlementStore } from '../../store/useSettlementStore';
import {
  AlertTriangle,
  Activity,
  Wind,
  ShieldAlert,
  Play,
  Pause,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Gauge
} from 'lucide-react';

export function LifeSupportEmergency() {
  const {
    oxygenLevel,
    civilizationReadiness,
    diagnosticStep,
    setDiagnosticStep,
    oxygenDraining,
    simulationPaused,
    toggleSimulationPause,
    tickOxygenDrain,
    shuttleDispatched,
    shuttleProgress,
    dispatchShuttle,
    updateShuttleProgress,
    completeResupply,
    resupplyCompleted,
    wreckageSuppliesCollected,
    waterDepositsFound,
    discoveries
  } = useSettlementStore();

  const [activeStepProgress, setActiveStepProgress] = useState(false);
  const [activeStepPercent, setActiveStepPercent] = useState(0);

  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  // Oxygen Drain simulation tick (every 4 seconds if emergency is active)
  useEffect(() => {
    if (resupplyCompleted || diagnosticStep >= 3 || simulationPaused) return;

    const timer = setInterval(() => {
      tickOxygenDrain();
    }, 4200);

    return () => clearInterval(timer);
  }, [resupplyCompleted, diagnosticStep, simulationPaused, tickOxygenDrain]);

  // Shuttle Flight Progress simulation
  useEffect(() => {
    if (!shuttleDispatched || resupplyCompleted) return;

    const interval = setInterval(() => {
      useSettlementStore.setState((state) => {
        if (state.shuttleProgress >= 100) {
          clearInterval(interval);
          state.completeResupply();
          return { shuttleProgress: 100 };
        }
        const next = state.shuttleProgress + 15;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            state.completeResupply();
          }, 300);
          return { shuttleProgress: 100 };
        }
        return { shuttleProgress: next };
      });
    }, 700);

    return () => clearInterval(interval);
  }, [shuttleDispatched, resupplyCompleted, completeResupply, updateShuttleProgress]);

  // Execute diagnostic step in order with animated progress
  const handleExecuteStep = (stepNumber: number) => {
    if (activeStepProgress || diagnosticStep !== stepNumber - 1) return;

    setActiveStepProgress(true);
    setActiveStepPercent(0);

    stepTimerRef.current = setInterval(() => {
      setActiveStepPercent((prev) => {
        if (prev >= 100) {
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
          setActiveStepProgress(false);
          setDiagnosticStep(stepNumber);
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  // Cross-referenced discoveries
  const isShelteredValleyScanned = discoveries.find((d) => d.id === 'sheltered-valley')?.scanned;
  const isBasaltRidgeScanned = discoveries.find((d) => d.id === 'basalt-ridge')?.scanned;

  return (
    <div style={{ position: 'relative', width: '100%', zIndex: 10 }}>
      {/* Chapter Eyebrow & Headline */}
      <div className="eyebrow" style={{ color: oxygenLevel <= 25 ? 'var(--red-alert)' : 'var(--amber)' }}>
        <AlertTriangle size={15} color={oxygenLevel <= 25 ? 'var(--red-alert)' : 'var(--amber)'} />
        <span>CHAPTER 04 // LIFE SUPPORT CRITICAL</span>
      </div>

      <h2
        className="title-display h-sec"
        style={{
          marginTop: '16px',
          marginBottom: '14px',
          color: oxygenLevel <= 25 ? '#fca5a5' : 'var(--bone)',
        }}
      >
        OXYGEN SYSTEM FAILURE
      </h2>

      <p className="hero-desc" style={{ maxWidth: '64ch' }}>
        Atmospheric scrubber manifold B-09 has sustained pressure fractures from high-gravity re-entry.
        Internal habitat oxygen is depleting. Execute diagnostic stabilization, isolate the breach, and
        dispatch orbital transport RESUPPLY-01 to replenish life support reserves.
      </p>

      {/* Main Telemetry & Diagnostic Split Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginTop: '28px',
          alignItems: 'start',
        }}
      >
        {/* ==============================================================
            1. OXYGEN TELEMETRY & PRESSURE GAUGES
            ============================================================== */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '8px',
            border: `1px solid ${oxygenLevel <= 25 ? 'rgba(239, 68, 68, 0.45)' : 'var(--line-cyan)'}`,
            background: 'rgba(10, 15, 24, 0.9)',
            boxShadow: oxygenLevel <= 25
              ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 24px rgba(239, 68, 68, 0.18)'
              : '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Header & Simulation Pause/Resume */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--line-soft)',
              paddingBottom: '14px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: oxygenLevel <= 25 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 229, 255, 0.15)',
                  color: oxygenLevel <= 25 ? '#ef4444' : 'var(--cyan)',
                }}
              >
                <Activity size={18} className={oxygenLevel <= 25 ? 'animate-pulse' : ''} />
              </div>
              <div>
                <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>
                  TELEMETRY SENSOR HUB
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--bone)' }}>
                  HABITAT 01 LIFE SUPPORT
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--amber)',
                }}
              >
                READINESS: {civilizationReadiness}%
              </div>

              {/* Simulation Pause / Resume Control */}
              <button
                onClick={toggleSimulationPause}
                className="btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title={simulationPaused ? 'Resume simulated oxygen drain' : 'Pause simulated oxygen drain'}
              >
                {simulationPaused ? <Play size={12} color="#34d399" /> : <Pause size={12} color="var(--amber)" />}
                <span>{simulationPaused ? 'RESUME SIM' : 'PAUSE SIM'}</span>
              </button>
            </div>
          </div>

          {/* Primary Oxygen Meter Display */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="mono-tag" style={{ fontSize: '11px', color: 'var(--bone-dim)' }}>
                HABITAT O₂ CONCENTRATION
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '38px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: oxygenLevel <= 20 ? '#ef4444' : oxygenLevel < 50 ? '#f59e0b' : '#34d399',
                  textShadow: oxygenLevel <= 20 ? '0 0 16px rgba(239, 68, 68, 0.6)' : 'none',
                }}
              >
                {oxygenLevel}%
              </span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: '#0c131d',
                border: '1px solid var(--line)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${oxygenLevel}%`,
                  height: '100%',
                  borderRadius: '999px',
                  transition: 'width 0.4s var(--ease-out)',
                  backgroundColor:
                    oxygenLevel <= 20 ? '#ef4444' : oxygenLevel < 50 ? '#f59e0b' : '#34d399',
                  boxShadow:
                    oxygenLevel <= 20
                      ? '0 0 12px #ef4444'
                      : oxygenLevel < 50
                      ? '0 0 10px #f59e0b'
                      : '0 0 10px #10b981',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              <span>0% CRITICAL FLOOR</span>
              <span>50% NOMINAL BUFFER</span>
              <span>100% MAXIMUM</span>
            </div>
          </div>

          {/* Auxiliary Environmental Diagnostics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '4px', background: 'rgba(6, 10, 16, 0.7)', border: '1px solid var(--line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--bone-dim)', marginBottom: '4px' }}>
                <Gauge size={13} color="var(--cyan)" />
                <span className="mono-tag" style={{ fontSize: '9px' }}>CABIN PRESSURE</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--bone)' }}>
                {diagnosticStep >= 2 ? '0.84 ATM (STABLE)' : '0.41 ATM (LEAKING)'}
              </span>
            </div>

            <div style={{ padding: '10px', borderRadius: '4px', background: 'rgba(6, 10, 16, 0.7)', border: '1px solid var(--line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--bone-dim)', marginBottom: '4px' }}>
                <Wind size={13} color="var(--amber)" />
                <span className="mono-tag" style={{ fontSize: '9px' }}>SCRUBBER B-09</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: diagnosticStep >= 2 ? '#34d399' : '#f87171' }}>
                {diagnosticStep >= 2 ? 'ISOLATED' : 'SEAL FRACTURED'}
              </span>
            </div>
          </div>

          {/* State Status Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid',
              borderColor: resupplyCompleted
                ? '#10b981'
                : diagnosticStep >= 3
                ? 'var(--cyan)'
                : 'rgba(239, 68, 68, 0.5)',
              backgroundColor: resupplyCompleted
                ? 'rgba(16, 185, 129, 0.15)'
                : diagnosticStep >= 3
                ? 'rgba(0, 229, 255, 0.12)'
                : 'rgba(239, 68, 68, 0.12)',
            }}
          >
            {resupplyCompleted ? (
              <CheckCircle2 size={16} color="#34d399" />
            ) : diagnosticStep >= 3 ? (
              <ShieldCheck size={16} color="var(--cyan)" />
            ) : (
              <ShieldAlert size={16} color="#ef4444" className="animate-pulse" />
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone)' }}>
              {resupplyCompleted
                ? 'RESERVES RESTORED: Habitat life support at 92% operational efficiency.'
                : diagnosticStep >= 3
                ? 'CIRCUIT STABILIZED: Oxygen drain stopped. Cleared for shuttle docking.'
                : oxygenDraining
                ? 'ACTIVE EMERGENCY: Oxygen depleting (-1% / 4s). Execute 3-step diagnostic.'
                : 'DIAGNOSTIC IN PROGRESS.'}
            </span>
          </div>
        </div>

        {/* ==============================================================
            2. THREE-STEP DIAGNOSTIC STABILIZATION SEQUENCE
            ============================================================== */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid var(--line-cyan)',
            background: 'rgba(10, 15, 24, 0.9)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div
            style={{
              borderBottom: '1px solid var(--line-soft)',
              paddingBottom: '14px',
              marginBottom: '18px',
            }}
          >
            <div className="eyebrow" style={{ color: 'var(--cyan)', marginBottom: '4px' }}>
              <span>SYSTEM DIAGNOSTIC SEQUENCE</span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--bone)',
                margin: 0,
              }}
            >
              LIFE SUPPORT RECOVERY PROTOCOL
            </h3>
            <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
              COMPLETE 3 ORDERED TASKS TO HALT ATMOSPHERIC DEPRESSURIZATION
            </span>
          </div>

          {/* Diagnostic Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Step 1: Inspect Regulator */}
            <div
              style={{
                padding: '14px',
                borderRadius: '6px',
                background: diagnosticStep >= 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 20, 30, 0.6)',
                border: `1px solid ${diagnosticStep >= 1 ? '#10b981' : diagnosticStep === 0 ? 'var(--cyan)' : 'var(--line-soft)'}`,
                transition: 'all 0.3s var(--ease-out)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: diagnosticStep >= 1 ? '#10b981' : 'var(--cyan)',
                      color: '#000',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {diagnosticStep >= 1 ? '✓' : '1'}
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--bone)' }}>
                      Inspect Primary Regulator
                    </span>
                    <span className="mono-tag" style={{ fontSize: '9px', display: 'block', color: 'var(--bone-dim)' }}>
                      Localize fractured solenoid seal in Scrubber Array B
                    </span>
                  </div>
                </div>

                {diagnosticStep === 0 && (
                  <button
                    onClick={() => handleExecuteStep(1)}
                    disabled={activeStepProgress}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '10px' }}
                  >
                    {activeStepProgress ? `Scanning ${activeStepPercent}%` : 'Inspect'}
                  </button>
                )}
              </div>

              {diagnosticStep >= 1 && (
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#34d399', paddingLeft: '34px' }}>
                  ✓ Solenoid seal fracture confirmed on Scrubber B-09. Bleed rate: 1.4 L/min.
                </div>
              )}
            </div>

            {/* Step 2: Isolate Damaged Circuit */}
            <div
              style={{
                padding: '14px',
                borderRadius: '6px',
                background: diagnosticStep >= 2 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 20, 30, 0.6)',
                border: `1px solid ${diagnosticStep >= 2 ? '#10b981' : diagnosticStep === 1 ? 'var(--cyan)' : 'var(--line-soft)'}`,
                opacity: diagnosticStep < 1 ? 0.6 : 1,
                transition: 'all 0.3s var(--ease-out)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: diagnosticStep >= 2 ? '#10b981' : diagnosticStep === 1 ? 'var(--cyan)' : '#334155',
                      color: '#000',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {diagnosticStep >= 2 ? '✓' : '2'}
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--bone)' }}>
                      Isolate Fractured Circuit
                    </span>
                    <span className="mono-tag" style={{ fontSize: '9px', display: 'block', color: 'var(--bone-dim)' }}>
                      Reroute air flow to auxiliary secondary manifold
                    </span>
                  </div>
                </div>

                {diagnosticStep === 1 && (
                  <button
                    onClick={() => handleExecuteStep(2)}
                    disabled={activeStepProgress}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '10px' }}
                  >
                    {activeStepProgress ? `Rerouting ${activeStepPercent}%` : 'Isolate'}
                  </button>
                )}
              </div>

              {diagnosticStep >= 2 && (
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#34d399', paddingLeft: '34px' }}>
                  ✓ Circuit isolated. Pressure bleed arrested. Secondary manifold active (+5% readiness).
                </div>
              )}
            </div>

            {/* Step 3: Activate Emergency Reserve */}
            <div
              style={{
                padding: '14px',
                borderRadius: '6px',
                background: diagnosticStep >= 3 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 20, 30, 0.6)',
                border: `1px solid ${diagnosticStep >= 3 ? '#10b981' : diagnosticStep === 2 ? 'var(--cyan)' : 'var(--line-soft)'}`,
                opacity: diagnosticStep < 2 ? 0.6 : 1,
                transition: 'all 0.3s var(--ease-out)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: diagnosticStep >= 3 ? '#10b981' : diagnosticStep === 2 ? 'var(--cyan)' : '#334155',
                      color: '#000',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {diagnosticStep >= 3 ? '✓' : '3'}
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--bone)' }}>
                      Activate Emergency Reserve
                    </span>
                    <span className="mono-tag" style={{ fontSize: '9px', display: 'block', color: 'var(--bone-dim)' }}>
                      Inject reserve buffer to stabilize colony life support
                    </span>
                  </div>
                </div>

                {diagnosticStep === 2 && (
                  <button
                    onClick={() => handleExecuteStep(3)}
                    disabled={activeStepProgress}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '10px' }}
                  >
                    {activeStepProgress ? `Injecting ${activeStepPercent}%` : 'Activate'}
                  </button>
                )}
              </div>

              {diagnosticStep >= 3 && (
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#34d399', paddingLeft: '34px' }}>
                  ✓ Emergency buffer injected (+8% O₂). Depressurization halted. Shuttle clearance granted!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
          3. ORBITAL RESUPPLY SHUTTLE MISSION (RESUPPLY-01)
          ============================================================== */}
      <div
        className="glass-panel"
        style={{
          marginTop: '32px',
          padding: '28px',
          borderRadius: '8px',
          border: `1px solid ${diagnosticStep >= 3 ? 'var(--line-cyan)' : 'var(--line-soft)'}`,
          background: 'rgba(10, 16, 26, 0.85)',
          opacity: diagnosticStep < 3 ? 0.75 : 1,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            borderBottom: '1px solid var(--line-soft)',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 229, 255, 0.15)',
                border: '1px solid var(--line-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan)',
              }}
            >
              <Rocket size={20} />
            </div>

            <div>
              <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--cyan)' }}>
                ORBITAL RESUPPLY OPERATION // MISSION ARC-01
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--bone)' }}>
                SHUTTLE RESUPPLY-01 DOCKING
              </h3>
            </div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: '1px solid',
              borderColor: resupplyCompleted ? '#10b981' : shuttleDispatched ? 'var(--amber)' : 'var(--line)',
              backgroundColor: resupplyCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(12, 18, 28, 0.6)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: resupplyCompleted ? '#34d399' : shuttleDispatched ? '#fbbf24' : 'var(--bone-dim)',
            }}
          >
            {resupplyCompleted
              ? 'STATUS: DOCKED & TRANSFERRED'
              : shuttleDispatched
              ? `STATUS: EN ROUTE (${shuttleProgress}%)`
              : diagnosticStep >= 3
              ? 'STATUS: CLEARED FOR DESCENT'
              : 'STATUS: LOCKED (STABILIZE LIFE SUPPORT FIRST)'}
          </div>
        </div>

        {/* Mission Details & Discovery Integration */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          {/* Cargo Payload */}
          <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(7, 11, 17, 0.7)', border: '1px solid var(--line-soft)' }}>
            <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>
              Cargo Manifest
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--bone)' }}>
              500L Liquefied O₂ // 12 Cryo-Catalyst Cells
            </span>
          </div>

          {/* Previous Discoveries Linkage */}
          <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(7, 11, 17, 0.7)', border: '1px solid var(--line-soft)' }}>
            <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--cyan)', display: 'block', marginBottom: '2px' }}>
              Arcadia-9 Wreckage Salvage
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: wreckageSuppliesCollected ? '#34d399' : 'var(--bone-dim)' }}>
              {wreckageSuppliesCollected ? '✓ Salvaged Canisters In Habitat (+12% buffer)' : 'Pending Crash Site Recovery'}
            </span>
          </div>

          <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(7, 11, 17, 0.7)', border: '1px solid var(--line-soft)' }}>
            <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase', color: '#38bdf8', display: 'block', marginBottom: '2px' }}>
              Cryo Basin Water Ice
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: waterDepositsFound > 0 ? '#38bdf8' : 'var(--bone-dim)' }}>
              {waterDepositsFound > 0 ? '✓ Confirmed 4.2M Tons for Post-Docking Electrolysis' : 'Subterranean Source Unverified'}
            </span>
          </div>

          <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(7, 11, 17, 0.7)', border: '1px solid var(--line-soft)' }}>
            <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: '2px' }}>
              Ground Telemetry Link
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: isBasaltRidgeScanned ? '#fbbf24' : 'var(--bone-dim)' }}>
              {isBasaltRidgeScanned ? '✓ Basalt Ridge High-Altitude Tracking Active' : 'Limited Line-of-Sight Sensor'}
            </span>
          </div>
        </div>

        {/* Flight Trajectory Progress Bar (when dispatched) */}
        {shuttleDispatched && !resupplyCompleted && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--cyan)' }}>
                {shuttleProgress < 30
                  ? 'STAGE 1: DE-ORBIT BURN & CANYON INCLINATION'
                  : shuttleProgress < 75
                  ? 'STAGE 2: ATMOSPHERIC GUIDANCE & THERMAL SHIELDING'
                  : 'STAGE 3: TERMINAL APPROACH & AIRLOCK SEALING'}
              </span>
              <span className="mono-tag" style={{ color: 'var(--bone)', fontWeight: 600 }}>
                {shuttleProgress}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: '#0a1018', border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${shuttleProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--cyan-dim), var(--cyan))',
                  boxShadow: '0 0 10px var(--cyan)',
                  transition: 'width 0.4s ease-out',
                }}
              />
            </div>
          </div>
        )}

        {/* Shuttle Action Button */}
        <div>
          {resupplyCompleted ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid #10b981',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={22} color="#34d399" />
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#34d399' }}>
                    RESUPPLY COMPLETED — HABITAT AT 92% O₂ BUFFER
                  </span>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--bone)' }}>
                    Immediate crisis neutralized. {isShelteredValleyScanned ? 'Next step: Proceed to Sheltered Valley for permanent settlement setup.' : 'Next step: Open Command Center to review civilization readiness.'}
                  </p>
                </div>
              </div>

              <a
                href="#command"
                className="btn-primary"
                style={{
                  padding: '10px 18px',
                  fontSize: '11px',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                }}
              >
                <span>Proceed to Operations Command</span>
                <ArrowRight size={14} />
              </a>
            </div>
          ) : (
            <button
              onClick={dispatchShuttle}
              disabled={diagnosticStep < 3 || shuttleDispatched}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px 24px',
                opacity: diagnosticStep < 3 ? 0.5 : 1,
                cursor: diagnosticStep < 3 || shuttleDispatched ? 'not-allowed' : 'pointer',
              }}
            >
              {shuttleDispatched ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Shuttle Resupply Flight in Progress ({shuttleProgress}%)...</span>
                </>
              ) : diagnosticStep < 3 ? (
                <>
                  <ShieldAlert size={16} />
                  <span>Complete 3-Step Life Support Diagnosis First</span>
                </>
              ) : (
                <>
                  <Rocket size={16} />
                  <span>Initiate Resupply Shuttle Flight (RESUPPLY-01)</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

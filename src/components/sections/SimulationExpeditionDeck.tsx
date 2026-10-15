import { useState, useEffect } from 'react';
import { useSettlementStore } from '../../store/useSettlementStore';
import {
  Zap,
  Boxes,
  Compass,
  AlertTriangle,
  Play,
  RotateCcw,
  Radio,
  Send,
  CheckCircle2,
  Activity
} from 'lucide-react';

export function SimulationExpeditionDeck() {
  const {
    expeditionSeed,
    powerLevel,
    constructionMaterials,
    activeEvent,
    eventLog,
    activeRovers,
    initSeededExpedition,
    triggerRandomEvent,
    resolveEventChoice,
    dismissEvent,
    dispatchRoverMission,
    tickRoverProgress
  } = useSettlementStore();

  const [inputSeed, setInputSeed] = useState(expeditionSeed);
  const [selectedTarget, setSelectedTarget] = useState('basalt-ridge');

  // Automatic periodic tick for rover missions and environmental telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      tickRoverProgress();
    }, 4000);
    return () => clearInterval(timer);
  }, [tickRoverProgress]);

  const handleApplySeed = () => {
    if (!inputSeed.trim()) return;
    initSeededExpedition(inputSeed.trim().toUpperCase());
  };

  const handleRandomSeed = () => {
    const randomSeed = 'SEED-' + Math.floor(1000 + Math.random() * 9000);
    setInputSeed(randomSeed);
    initSeededExpedition(randomSeed);
  };

  const targets = [
    { id: 'basalt-ridge', name: 'Basalt Ridge Escarpment', risk: 'High Wind / Ion Storm', potential: 'Telemetry & Geothermal' },
    { id: 'cryo-basin', name: 'Cryo Basin Glacial Rift', risk: 'Cryo Fissures (-68°C)', potential: 'Water Ice & Pure Silicates' },
    { id: 'sheltered-valley', name: 'Sheltered Valley Palisades', risk: 'Low Radiation', potential: 'Bedrock Foundation' },
    { id: 'solis-terminus', name: 'Solis Terminus Outpost', risk: 'Solar Flare Sweeps', potential: 'Lithium & Photovoltaic Scrap' }
  ];

  return (
    <div
      style={{
        background: 'rgba(10, 15, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--line-cyan)',
        borderRadius: '8px',
        padding: '28px',
        marginBottom: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Header & Seed Configuration */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid var(--line-soft)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}
      >
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={14} color="var(--cyan)" />
            <span>INTERCONNECTED SIMULATION // EXPEDITION TELEMETRY</span>
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--bone)',
              margin: '6px 0 0'
            }}
          >
            PLANETARY EXPEDITION SEED & SYSTEM TELEMETRY
          </h3>
        </div>

        {/* Seed Input Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginRight: '6px' }}>SEED:</span>
            <input
              type="text"
              value={inputSeed}
              onChange={(e) => setInputSeed(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 600,
                width: '130px',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleApplySeed}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '10px' }}
            title="Recalibrate planet simulation to this deterministic seed"
          >
            <span>RECALIBRATE SEED</span>
          </button>

          <button
            onClick={handleRandomSeed}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '10px' }}
            title="Generate a brand new random expedition scenario"
          >
            <RotateCcw size={13} />
            <span>NEW SEED</span>
          </button>
        </div>
      </div>

      {/* Interconnected Resource Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div style={{ background: 'rgba(16, 22, 32, 0.7)', border: '1px solid var(--line)', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
              AUXILIARY POWER GRID
            </span>
            <Zap size={14} color="var(--amber)" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--bone)' }}>
            {powerLevel}%
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone-dim)' }}>
            Net Flow: +14% Solar / -10% Base Draw
          </span>
        </div>

        <div style={{ background: 'rgba(16, 22, 32, 0.7)', border: '1px solid var(--line)', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
              CONSTRUCTION MATERIALS
            </span>
            <Boxes size={14} color="var(--cyan)" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--bone)' }}>
            {constructionMaterials} <span style={{ fontSize: '14px', color: 'var(--cyan)' }}>UNITS</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone-dim)' }}>
            Basalt Titanium Scrap & Alloy Stockpile
          </span>
        </div>

        <div style={{ background: 'rgba(16, 22, 32, 0.7)', border: '1px solid var(--line)', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
              ACTIVE EXPEDITIONS
            </span>
            <Compass size={14} color="#10b981" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--bone)' }}>
            {activeRovers.filter((r) => r.status !== 'RETURNED').length} <span style={{ fontSize: '14px', color: '#10b981' }}>ROVERS</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone-dim)' }}>
            Autonomous probes exploring sectors
          </span>
        </div>
      </div>

      {/* Dynamic Environmental Event Alert (If active) */}
      {activeEvent ? (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(12, 18, 28, 0.95))',
            border: '1px solid var(--red-alert)',
            borderRadius: '6px',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 0 24px rgba(239, 68, 68, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--red-alert)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--red-alert)', letterSpacing: '0.16em' }}>
                DYNAMIC HAZARD EVENT // {activeEvent.hazardLevel} THREAT
              </span>
            </div>
            <button
              onClick={dismissEvent}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', cursor: 'pointer' }}
            >
              [DISMISS HUD]
            </button>
          </div>

          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--bone)', margin: '0 0 8px' }}>
            {activeEvent.title}
          </h4>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--bone-dim)', lineHeight: 1.6, margin: '0 0 18px' }}>
            {activeEvent.description}
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {activeEvent.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => resolveEventChoice(choice.actionType)}
                style={{
                  flex: '1 1 280px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '12px 16px',
                  background: 'rgba(20, 28, 42, 0.9)',
                  border: '1px solid var(--line-cyan)',
                  borderRadius: '4px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--cyan)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line-cyan)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--cyan)' }}>
                  {choice.label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone-dim)' }}>
                  {choice.effectText}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            border: '1px solid var(--line-soft)',
            marginBottom: '28px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={14} color="#10b981" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
              ATMOSPHERIC SENSORS STABLE // NO CRITICAL BREACHES
            </span>
          </div>
          <button
            onClick={triggerRandomEvent}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '10px' }}
          >
            <Play size={11} />
            <span>TRIGGER SECTOR EVENT</span>
          </button>
        </div>
      )}

      {/* Autonomous Rover Expedition Launcher */}
      <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={15} color="var(--cyan)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--bone)' }}>
              DISPATCH ROBOTIC ROVER PROBE
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
            COST: 10% POWER // 8 MATERIALS
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          {targets.map((tgt) => (
            <div
              key={tgt.id}
              onClick={() => setSelectedTarget(tgt.id)}
              style={{
                padding: '12px 16px',
                borderRadius: '4px',
                background: selectedTarget === tgt.id ? 'rgba(0, 229, 255, 0.08)' : 'rgba(12, 18, 28, 0.6)',
                border: `1px solid ${selectedTarget === tgt.id ? 'var(--cyan)' : 'var(--line)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--bone)', marginBottom: '4px' }}>
                {tgt.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', marginBottom: '2px' }}>
                Hazards: {tgt.risk}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                Yield: {tgt.potential}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => dispatchRoverMission(selectedTarget)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '11px' }}
          >
            <Send size={13} />
            <span>DISPATCH EXPEDITION PROBE</span>
          </button>

          {/* Active rover missions list */}
          {activeRovers.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexGrow: 1, justifyContent: 'flex-end' }}>
              {activeRovers.map((rover) => (
                <div
                  key={rover.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--line-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px'
                  }}
                >
                  <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{rover.id}:</span>
                  <span style={{ color: 'var(--bone-dim)' }}>{rover.targetName}</span>
                  <span style={{ color: rover.status === 'RETURNED' ? '#10b981' : 'var(--amber)' }}>
                    [{rover.status} {rover.progress}%]
                  </span>
                  {rover.status === 'RETURNED' && <CheckCircle2 size={13} color="#10b981" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Environmental Telemetry Log */}
      {eventLog.length > 0 && (
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--line-soft)', paddingTop: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: '6px' }}>
            EXPEDITION TELEMETRY LOGS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {eventLog.slice(0, 3).map((log, idx) => (
              <div key={idx} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone-dim)' }}>
                <span style={{ color: 'var(--cyan)' }}>&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

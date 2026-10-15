import { useState, useEffect, useRef } from 'react';
import { useSettlementStore, type Discovery } from '../../store/useSettlementStore';
import {
  Radar,
  Droplets,
  AlertTriangle,
  Home,
  Crosshair,
  Compass,
  CheckCircle2,
  Sparkles,
  Shield,
  Activity,
  ArrowRight
} from 'lucide-react';

export function PlanetaryScan() {
  const {
    discoveries,
    waterDepositsFound,
    discoverPoint,
    wreckageSuppliesCollected,
    collectWreckageSupplies,
    openDialogue
  } = useSettlementStore();

  const [selectedId, setSelectedId] = useState<string>('cryo-basin');
  const [filter, setFilter] = useState<'all' | 'water' | 'hazard' | 'habitat'>('all');
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, []);

  const selectedLocation = discoveries.find((d) => d.id === selectedId) || discoveries[0];

  const filteredDiscoveries = discoveries.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'water') return d.type === 'water';
    if (filter === 'hazard') return d.type === 'hazard';
    if (filter === 'habitat') return d.type === 'habitat';
    return true;
  });

  const handleStartScan = (id: string) => {
    if (scanningId) return; // Prevent duplicate concurrent scans

    const target = discoveries.find((d) => d.id === id);
    if (!target || target.scanned) return;

    setScanningId(id);
    setScanProgress(0);

    scanTimerRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          if (scanTimerRef.current) clearInterval(scanTimerRef.current);
          setScanningId(null);
          discoverPoint(id);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const getMarkerIcon = (type: Discovery['type'], scanned: boolean) => {
    switch (type) {
      case 'water':
        return <Droplets size={16} color={scanned ? '#00e5ff' : '#38bdf8'} />;
      case 'habitat':
        return <Home size={16} color={scanned ? '#34d399' : '#00e5ff'} />;
      case 'hazard':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'wreckage':
        return <Crosshair size={16} color="#ef4444" />;
      default:
        return <Compass size={16} color="var(--cyan)" />;
    }
  };

  const getMarkerPosition = (id: string) => {
    switch (id) {
      case 'arcadia-crash':
        return { left: '26%', top: '38%' };
      case 'cryo-basin':
        return { left: '68%', top: '32%' };
      case 'basalt-ridge':
        return { left: '42%', top: '18%' };
      case 'sheltered-valley':
        return { left: '54%', top: '64%' };
      default:
        return { left: '50%', top: '50%' };
    }
  };

  const scannedCount = discoveries.filter((d) => d.scanned).length;

  return (
    <div style={{ position: 'relative', width: '100%', zIndex: 10 }}>
      {/* Chapter Eyebrow & Headline */}
      <div className="eyebrow" style={{ color: 'var(--cyan)' }}>
        <span className="pulse-dot" />
        <span>CHAPTER 03 // PLANETARY TOPOGRAPHY</span>
      </div>

      <h2 className="title-display h-sec" style={{ marginTop: '16px', marginBottom: '14px' }}>
        RESOURCE EXPLORATION
      </h2>

      <p className="hero-desc" style={{ maxWidth: '64ch' }}>
        Z-01’s multi-spectral orbital sensors map the alien planet’s volcanic contours,
        subterranean ice formations, and tectonic depressions. Inspect sectors to identify
        life-sustaining water reservoirs and locate protected topography for Settlement Zero.
      </p>

      {/* Exploration HUD Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '14px 20px',
          borderRadius: '6px',
          marginBottom: '20px',
          background: 'rgba(10, 16, 26, 0.8)',
          border: '1px solid var(--line-cyan)',
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(['all', 'water', 'habitat', 'hazard'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                border: '1px solid',
                borderColor: filter === f ? 'var(--cyan)' : 'var(--line-soft)',
                backgroundColor: filter === f ? 'rgba(0, 229, 255, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                color: filter === f ? 'var(--cyan)' : 'var(--bone-dim)',
                transition: 'all 0.2s var(--ease-out)',
              }}
            >
              {f === 'all' ? 'All Sectors' : f === 'water' ? 'Water Deposits' : f === 'habitat' ? 'Habitat Sites' : 'Hazards'}
            </button>
          ))}
        </div>

        {/* Telemetry Counter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radar size={15} color="var(--cyan)" />
            <span className="mono-tag" style={{ fontSize: '11px', color: 'var(--bone)' }}>
              SURVEYED: <strong style={{ color: 'var(--cyan)' }}>{scannedCount}</strong>/4
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={15} color="#38bdf8" />
            <span className="mono-tag" style={{ fontSize: '11px', color: 'var(--bone)' }}>
              WATER SOURCES: <strong style={{ color: '#38bdf8' }}>{waterDepositsFound}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Map & Inspection Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* ==============================================================
            1. HOLOGRAPHIC TOPOGRAPHIC MAP DISPLAY
            ============================================================== */}
        <div
          className="glass-panel"
          style={{
            position: 'relative',
            aspectRatio: '16/11',
            minHeight: '340px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--line-cyan)',
            background: 'radial-gradient(ellipse at center, rgba(12, 22, 36, 0.85) 0%, rgba(3, 7, 14, 0.95) 100%)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(0, 229, 255, 0.08)',
          }}
        >
          {/* Topographic Contour Lines SVG Background */}
          <svg
            viewBox="0 0 600 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id="scanBeamGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Coordinate Grid Crosshairs */}
            <line x1="50" y1="210" x2="550" y2="210" stroke="var(--line-soft)" strokeDasharray="3 3" />
            <line x1="300" y1="30" x2="300" y2="390" stroke="var(--line-soft)" strokeDasharray="3 3" />
            <circle cx="300" cy="210" r="80" stroke="var(--line-soft)" strokeDasharray="2 4" />
            <circle cx="300" cy="210" r="160" stroke="var(--line-soft)" strokeDasharray="2 4" />

            {/* Topographic Contour Elevation Rings */}
            {/* Elevation Level 1 - Basalt Ridge */}
            <path
              d="M 220 80 C 260 60, 310 70, 350 90 C 370 110, 340 140, 290 135 C 240 130, 200 100, 220 80 Z"
              stroke="#c4522e"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
            <path
              d="M 235 90 C 265 75, 300 80, 335 95 C 350 110, 325 130, 285 125 C 250 120, 220 100, 235 90 Z"
              stroke="#e0533c"
              strokeWidth="1.5"
              strokeOpacity="0.75"
            />

            {/* Elevation Level 2 - Cryo Basin Depression */}
            <path
              d="M 370 120 C 440 110, 480 160, 460 210 C 430 250, 370 230, 350 190 C 330 150, 340 125, 370 120 Z"
              stroke="#00e5ff"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
            <path
              d="M 390 140 C 430 135, 460 170, 445 200 C 420 230, 380 215, 370 185 C 360 155, 370 142, 390 140 Z"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />

            {/* Elevation Level 3 - Sheltered Valley Rift */}
            <path
              d="M 280 240 C 340 230, 400 270, 380 320 C 350 360, 290 350, 260 310 C 240 270, 250 245, 280 240 Z"
              stroke="#10b981"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
            <path
              d="M 300 255 C 340 250, 380 280, 365 315 C 340 345, 300 335, 280 305 C 265 275, 275 260, 300 255 Z"
              stroke="#34d399"
              strokeWidth="1.4"
              strokeOpacity="0.75"
            />

            {/* Elevation Level 4 - Crash Ridge */}
            <path
              d="M 120 130 C 180 120, 210 170, 190 220 C 160 255, 110 240, 90 200 C 80 160, 95 135, 120 130 Z"
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />

            {/* Continuous Rotating Radar Scan Sweep */}
            <g transform="translate(300, 210)">
              <line
                x1="0"
                y1="0"
                x2="180"
                y2="0"
                stroke="var(--cyan)"
                strokeWidth="1.5"
                opacity="0.8"
                style={{
                  transformOrigin: '0 0',
                  animation: 'spin 6s linear infinite',
                }}
              />
              <path
                d="M 0 0 L 180 0 A 180 180 0 0 0 140 110 Z"
                fill="url(#scanBeamGrad)"
                style={{
                  transformOrigin: '0 0',
                  animation: 'spin 6s linear infinite',
                }}
              />
            </g>
          </svg>

          {/* Active Scanning Animation Overlay (When analyze is running) */}
          {scanningId && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  border: '2px solid var(--cyan)',
                  boxShadow: '0 0 24px var(--cyan)',
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  color: 'var(--cyan)',
                  textShadow: '0 0 10px var(--cyan)',
                }}
              >
                ACQUIRING RESONANCE TELEMETRY: {scanProgress}%
              </span>
            </div>
          )}

          {/* Interactive POI Markers on Map */}
          {filteredDiscoveries.map((loc) => {
            const pos = getMarkerPosition(loc.id);
            const isSelected = selectedId === loc.id;

            return (
              <button
                key={loc.id}
                onClick={() => setSelectedId(loc.id)}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  transform: 'translate(-50%, -50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: isSelected ? 30 : 20,
                  outline: 'none',
                }}
                title={loc.name}
              >
                {/* Reticle Pulse Indicator */}
                <div
                  style={{
                    position: 'relative',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.25)' : 'rgba(10, 15, 23, 0.8)',
                    border: `1.5px solid ${isSelected ? 'var(--cyan)' : loc.scanned ? '#34d399' : 'var(--line-cyan)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isSelected
                      ? '0 0 16px var(--cyan)'
                      : loc.scanned
                      ? '0 0 10px #10b981'
                      : '0 0 10px rgba(0,0,0,0.8)',
                    transition: 'all 0.3s var(--ease-out)',
                  }}
                >
                  {getMarkerIcon(loc.type, loc.scanned)}

                  {/* Pulsing Outer Ping Ring */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: '-4px',
                        borderRadius: '50%',
                        border: '1px solid var(--cyan)',
                        animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                      }}
                    />
                  )}
                </div>

                {/* Name Chip */}
                <div
                  style={{
                    marginTop: '6px',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    background: isSelected ? 'rgba(0, 229, 255, 0.2)' : 'rgba(7, 11, 17, 0.85)',
                    border: `1px solid ${isSelected ? 'var(--cyan)' : 'var(--line)'}`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                    color: isSelected ? 'var(--bone)' : 'var(--bone-dim)',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {loc.name}
                </div>
              </button>
            );
          })}

          {/* Map Corner Scale & Telemetry Legend */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: 'var(--muted)',
            }}
          >
            TOPOGRAPHIC RESOLUTION // 1:25,000 EXOMAP
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: 'var(--cyan)',
            }}
          >
            SENSOR GRID: ACTIVE
          </div>
        </div>

        {/* ==============================================================
            2. CONTEXTUAL SECTOR INSPECTION PANEL
            ============================================================== */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid var(--line-cyan)',
            background: 'rgba(10, 16, 25, 0.9)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Selected Location Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--line-soft)',
              paddingBottom: '14px',
              marginBottom: '16px',
            }}
          >
            <div>
              <div className="eyebrow" style={{ color: 'var(--cyan)', marginBottom: '4px' }}>
                <span>SECTOR TELEMETRY ANALYSIS</span>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--bone)',
                  margin: 0,
                }}
              >
                {selectedLocation.name}
              </h3>
              <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
                LAT {selectedLocation.coordinates[0]}° // LONG {selectedLocation.coordinates[1]}° // ELEV: {selectedLocation.elevation || '0m'}
              </span>
            </div>

            {/* Status Chip */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedLocation.scanned ? '#10b981' : 'var(--amber)',
                backgroundColor: selectedLocation.scanned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: selectedLocation.scanned ? '#34d399' : 'var(--amber)',
              }}
            >
              {selectedLocation.scanned ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <span>{selectedLocation.scanned ? 'VERIFIED' : 'UNSCANNED'}</span>
            </div>
          </div>

          {/* Location Description */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              lineHeight: 1.65,
              color: 'var(--bone)',
              marginBottom: '20px',
            }}
          >
            {selectedLocation.description}
          </p>

          {/* Geological & Environmental Attributes Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
            {/* Terrain Type */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '4px',
                background: 'rgba(7, 12, 18, 0.7)',
                border: '1px solid var(--line-soft)',
              }}
            >
              <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>
                Terrain Classification
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--bone)' }}>
                {selectedLocation.terrain || 'Unclassified rocky regolith'}
              </span>
            </div>

            {/* Environmental Hazards */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '4px',
                background: 'rgba(7, 12, 18, 0.7)',
                border: '1px solid var(--line-soft)',
              }}
            >
              <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase', color: '#f87171', display: 'block', marginBottom: '2px' }}>
                Environmental Hazards
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#fca5a5' }}>
                {selectedLocation.hazards || 'Radiation drift, methane gusts'}
              </span>
            </div>

            {/* Estimated Resources */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '4px',
                background: 'rgba(7, 12, 18, 0.7)',
                border: '1px solid var(--line-soft)',
              }}
            >
              <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--cyan)', display: 'block', marginBottom: '2px' }}>
                Estimated Resources
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>
                {selectedLocation.resources || 'Basalt silicates, inert dust'}
              </span>
            </div>

            {/* Settlement Suitability */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '4px',
                background: 'rgba(7, 12, 18, 0.7)',
                border: '1px solid var(--line-soft)',
              }}
            >
              <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase', color: '#34d399', display: 'block', marginBottom: '2px' }}>
                Settlement Suitability
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--bone)' }}>
                {selectedLocation.suitability || 'Pending full geological survey'}
              </span>
            </div>
          </div>

          {/* Contextual Action Button */}
          <div>
            {selectedLocation.id === 'cryo-basin' && (
              selectedLocation.scanned ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    color: '#34d399',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Water Deposit Verified (4.2M Metric Tons)</span>
                </div>
              ) : (
                <button
                  onClick={() => handleStartScan('cryo-basin')}
                  disabled={scanningId === 'cryo-basin'}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
                >
                  {scanningId === 'cryo-basin' ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>Analyzing Core Ice Samples ({scanProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Droplets size={16} />
                      <span>Analyze Water Deposits</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )
            )}

            {selectedLocation.id === 'sheltered-valley' && (
              selectedLocation.scanned ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    color: '#34d399',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Settlement Zero Site Confirmed (Grade A Optimal)</span>
                </div>
              ) : (
                <button
                  onClick={() => handleStartScan('sheltered-valley')}
                  disabled={scanningId === 'sheltered-valley'}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
                >
                  {scanningId === 'sheltered-valley' ? (
                    <>
                      <Activity size={16} className="animate-spin" />
                      <span>Assessing Topographic Shielding ({scanProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      <span>Evaluate Settlement Potential</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )
            )}

            {selectedLocation.id === 'basalt-ridge' && (
              selectedLocation.scanned ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    borderRadius: '4px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid #f59e0b',
                    color: '#fbbf24',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Telemetry Relay Online (140km/h Wind Warning)</span>
                </div>
              ) : (
                <button
                  onClick={() => handleStartScan('basalt-ridge')}
                  disabled={scanningId === 'basalt-ridge'}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
                >
                  {scanningId === 'basalt-ridge' ? (
                    <>
                      <Compass size={16} className="animate-spin" />
                      <span>Calibrating High-Altitude Relay ({scanProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Radar size={16} />
                      <span>Deploy Sensor Relay & Scan Hazards</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )
            )}

            {selectedLocation.id === 'arcadia-crash' && (
              wreckageSuppliesCollected ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    color: '#34d399',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Arcadia-9 Salvaged (Supplies In Habitat)</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    collectWreckageSupplies();
                    openDialogue(
                      "Salvage protocol engaged directly from sensor map! Emergency canisters secured into colony reserves."
                    );
                  }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
                >
                  <Crosshair size={16} />
                  <span>Recover Arcadia-9 Supplies</span>
                  <ArrowRight size={14} />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  CANONICAL_LOCATIONS,
  PLANET_CONSTANTS,
  calculateGreatCircleDistanceKm,
  interpolateGreatCircleArc,
  type PlanetaryLocation
} from '../data/planetData';
import { Link, useNavigate } from '../router';
import {
  Compass,
  Globe,
  Map as MapIcon,
  Search,
  Crosshair,
  ArrowRight,
  ShieldAlert,
  Droplets,
  Home,
  Rocket,
  Radar,
  Radio,
  Layers,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Vignette } from '../components/effects/Vignette';
import { Grain } from '../components/effects/Grain';

export function NavigationPage() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'3d' | '2d'>('2d');
  const [selectedLocation, setSelectedLocation] = useState<PlanetaryLocation>(CANONICAL_LOCATIONS[3]); // Sheltered Valley default
  const [routeOrigin, setRouteOrigin] = useState<PlanetaryLocation>(CANONICAL_LOCATIONS[0]); // Crash site default
  const [routeType, setRouteType] = useState<'shortest' | 'safe'>('safe');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [scannedSectorIds, setScannedSectorIds] = useState<string[]>([
    'arcadia-crash',
    'sheltered-valley',
    'cryo-basin',
    'basalt-ridge'
  ]);
  const [orbitalScanning, setOrbitalScanning] = useState(false);

  // Filter locations
  const filteredLocations = CANONICAL_LOCATIONS.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.terrain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || loc.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate route metrics
  const routeDistanceKm = calculateGreatCircleDistanceKm(
    routeOrigin.latitude,
    routeOrigin.longitude,
    selectedLocation.latitude,
    selectedLocation.longitude
  );

  const safeMultiplier = routeType === 'safe' ? 1.15 : 1.0;
  const effectiveDistanceKm = Math.round(routeDistanceKm * safeMultiplier);
  const estimatedHours = (effectiveDistanceKm / 120).toFixed(1);
  const powerCostPercent = Math.min(100, Math.round(effectiveDistanceKm / 35));

  const routeArc = interpolateGreatCircleArc(
    routeOrigin.latitude,
    routeOrigin.longitude,
    selectedLocation.latitude,
    selectedLocation.longitude,
    20
  );

  // Trigger orbital scan sweep
  const handleOrbitalScan = () => {
    if (orbitalScanning) return;
    setOrbitalScanning(true);
    setTimeout(() => {
      setScannedSectorIds(CANONICAL_LOCATIONS.map((l) => l.id));
      setOrbitalScanning(false);
    }, 1800);
  };

  // Navigate to Transit with prefilled destination
  const handleBookTransit = (loc: PlanetaryLocation) => {
    navigate(`/transit?pickup=${routeOrigin.id}&destination=${loc.id}`);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--void)', color: 'var(--bone)', overflowX: 'hidden' }}>
      <Vignette />
      <Grain />

      {/* Navigation Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px var(--pad)',
          background: 'rgba(2, 5, 9, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--line-soft)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="nav-logo-box" style={{ width: '34px', height: '34px' }}>
            <Compass size={18} color="var(--cyan)" />
          </div>
          <div>
            <div className="nav-brand-title" style={{ fontSize: '11px' }}>PLANETARY NAVIGATION</div>
            <div className="nav-brand-sub">CARTOGRAPHY & SURFACE TRAJECTORIES</div>
          </div>
        </div>

        {/* Universal Links Bar */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '18px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em' }}>
          <Link to="/" style={{ color: 'var(--bone-dim)', textTransform: 'uppercase' }}>
            00 Home
          </Link>
          <Link to="/habitat" style={{ color: 'var(--bone-dim)', textTransform: 'uppercase' }}>
            01 Habitat
          </Link>
          <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontWeight: 600 }}>
            02 Navigation
          </span>
          <Link to="/transit" style={{ color: 'var(--bone-dim)', textTransform: 'uppercase' }}>
            03 Zero Transit
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px var(--pad) 80px', position: 'relative', zIndex: 10 }}>
        {/* Top Controls: Search, Filters & View Mode */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'rgba(12, 17, 26, 0.8)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            padding: '14px 20px',
            marginBottom: '20px'
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.5)', padding: '8px 14px', borderRadius: '4px', border: '1px solid var(--line-soft)', minWidth: '280px' }}>
            <Search size={14} color="var(--muted)" />
            <input
              type="text"
              placeholder="Search coordinates, sectors, or terrain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--bone)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['all', 'colony', 'wreckage', 'resource', 'hazard', 'outpost'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '3px',
                  background: filterType === type ? 'var(--cyan)' : 'rgba(255,255,255,0.04)',
                  color: filterType === type ? 'var(--void)' : 'var(--bone-dim)',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: filterType === type ? 600 : 400,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* 3D / 2D Map Toggle & Scan Sweep */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleOrbitalScan}
              className="btn-secondary"
              style={{ padding: '7px 12px', fontSize: '10px', gap: '6px' }}
              title="Perform orbital radar sweep to pierce fog-of-war"
            >
              <Radar size={13} color="var(--cyan)" />
              <span>{orbitalScanning ? 'SWEEPING SENSORS...' : 'ORBITAL SCAN'}</span>
            </button>

            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px' }}>
              <button
                onClick={() => setViewMode('2d')}
                style={{
                  padding: '5px 10px',
                  background: viewMode === '2d' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                  color: viewMode === '2d' ? 'var(--cyan)' : 'var(--muted)',
                  border: 'none',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                <MapIcon size={12} />
                <span>2D TOPOGRAPHIC</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                style={{
                  padding: '5px 10px',
                  background: viewMode === '3d' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                  color: viewMode === '3d' ? 'var(--cyan)' : 'var(--muted)',
                  border: 'none',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                <Globe size={12} />
                <span>3D GLOBE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dual Layout: Map Canvas + Intelligence Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(360px, 1.1fr)', gap: '24px' }}>
          {/* Map Display Panel */}
          <div
            style={{
              background: 'rgba(9, 13, 20, 0.85)',
              border: '1px solid var(--line-cyan)',
              borderRadius: '8px',
              padding: '24px',
              position: 'relative',
              minHeight: '620px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)'
            }}
          >
            {/* Map Header Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-dot" style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone)', letterSpacing: '0.14em' }}>
                  PROXIMA-ZERO PLANETARY CARTOGRAPHY // RADIUS {PLANET_CONSTANTS.radiusKm} KM
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                COORDINATE PROJECTION: EQUIDISTANT CYLINDRICAL
              </span>
            </div>

            {/* Interactive Surface Map Rendering */}
            <div
              style={{
                position: 'relative',
                flexGrow: 1,
                minHeight: '520px',
                background: 'radial-gradient(circle at 50% 50%, #0d1624 0%, #060a12 85%)',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                overflow: 'hidden'
              }}
            >
              {/* Coordinate Grid Lines */}
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="nav-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0, 229, 255, 0.07)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#nav-grid)" />

                {/* Topographic Contour Simulation Rings */}
                <ellipse cx="28%" cy="40%" rx="90" ry="60" fill="none" stroke="rgba(0, 229, 255, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
                <ellipse cx="68%" cy="32%" rx="120" ry="85" fill="none" stroke="rgba(56, 189, 248, 0.14)" strokeWidth="1" />
                <ellipse cx="54%" cy="66%" rx="80" ry="55" fill="none" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="1" />
                <ellipse cx="40%" cy="22%" rx="100" ry="45" fill="none" stroke="rgba(245, 158, 11, 0.12)" strokeWidth="1" />

                {/* Great-Circle Route Polyline */}
                {routeArc.length > 1 && (
                  <path
                    d={`M ${((routeOrigin.longitude + 180) / 360) * 100 * 7.5} ${((90 - routeOrigin.latitude) / 180) * 100 * 5} ${routeArc
                      .map((pt) => {
                        // Project lat/lon to map coordinates
                        const x = ((pt[1] + 180) / 360) * 750;
                        const y = ((90 - pt[0]) / 180) * 500;
                        return `L ${x} ${y}`;
                      })
                      .join(' ')}`}
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                )}
              </svg>

              {/* 3D Visual Globe Representation (if 3D mode chosen) */}
              {viewMode === '3d' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '360px',
                    height: '360px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #18283f 0%, #0a111c 65%, #020509 100%)',
                    boxShadow: '0 0 60px rgba(0, 229, 255, 0.25), inset -20px -20px 60px rgba(0,0,0,0.9)',
                    border: '1px solid rgba(0, 229, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px dashed rgba(0,229,255,0.2)' }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)', opacity: 0.8 }}>
                    3D ORBITAL PERSPECTIVE LOCKED
                  </div>
                </div>
              )}

              {/* Interactive Sector Markers */}
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation.id === loc.id;
                const isOrigin = routeOrigin.id === loc.id;
                const isScanned = scannedSectorIds.includes(loc.id);

                // Map projection percentage
                const leftPercent = ((loc.longitude + 180) / 360) * 100;
                const topPercent = ((90 - loc.latitude) / 180) * 100;

                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: isSelected ? 30 : 20,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    {/* Glowing Marker Pin */}
                    <div
                      style={{
                        width: isSelected ? '28px' : '20px',
                        height: isSelected ? '28px' : '20px',
                        borderRadius: '50%',
                        background: isSelected
                          ? 'var(--cyan)'
                          : isOrigin
                          ? 'var(--amber)'
                          : isScanned
                          ? 'rgba(12, 22, 34, 0.9)'
                          : 'rgba(30, 30, 30, 0.7)',
                        border: `2px solid ${
                          isSelected
                            ? '#fff'
                            : isOrigin
                            ? 'var(--amber)'
                            : isScanned
                            ? 'var(--cyan)'
                            : 'var(--muted)'
                        }`,
                        boxShadow: isSelected ? '0 0 20px var(--cyan)' : '0 0 10px rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      {loc.type === 'wreckage' && <Crosshair size={12} color={isSelected ? '#000' : '#f87171'} />}
                      {loc.type === 'resource' && <Droplets size={12} color={isSelected ? '#000' : 'var(--cyan)'} />}
                      {loc.type === 'colony' && <Home size={12} color={isSelected ? '#000' : '#10b981'} />}
                      {loc.type === 'hazard' && <ShieldAlert size={12} color={isSelected ? '#000' : 'var(--amber)'} />}
                      {loc.type === 'outpost' && <Radio size={12} color={isSelected ? '#000' : 'var(--cyan)'} />}
                    </div>

                    {/* Sector Tag */}
                    <div
                      style={{
                        marginTop: '4px',
                        background: 'rgba(2, 5, 9, 0.85)',
                        border: `1px solid ${isSelected ? 'var(--cyan)' : 'var(--line)'}`,
                        borderRadius: '3px',
                        padding: '2px 6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        color: isSelected ? 'var(--cyan)' : 'var(--bone)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {loc.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intelligence & Route Planner Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Selected Location Details Card */}
            <div
              style={{
                background: 'rgba(12, 18, 28, 0.85)',
                border: '1px solid var(--line-cyan)',
                borderRadius: '8px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="mono-tag" style={{ color: 'var(--cyan)', fontSize: '10px' }}>
                  {selectedLocation.code} // {selectedLocation.type.toUpperCase()}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: scannedSectorIds.includes(selectedLocation.id) ? '#10b981' : 'var(--amber)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={11} />
                  {scannedSectorIds.includes(selectedLocation.id) ? 'SURVEYED & VERIFIED' : 'UNEXPLORED'}
                </span>
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--bone)', margin: '0 0 6px' }}>
                  {selectedLocation.name}
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)' }}>
                  LAT: {selectedLocation.latitude.toFixed(2)}° // LON: {selectedLocation.longitude.toFixed(2)}°
                </div>
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--bone-dim)', lineHeight: 1.6, margin: 0 }}>
                {selectedLocation.description}
              </p>

              {/* Terrain & Hazards details */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                  ELEVATION: <span style={{ color: 'var(--bone)' }}>{selectedLocation.elevation}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                  TERRAIN: <span style={{ color: 'var(--bone)' }}>{selectedLocation.terrain}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)' }}>
                  HAZARDS: {selectedLocation.hazards}
                </div>
              </div>

              {/* Action: Set as Route Origin or Destination */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => setRouteOrigin(selectedLocation)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '4px',
                    background: routeOrigin.id === selectedLocation.id ? 'var(--amber)' : 'rgba(245, 158, 11, 0.1)',
                    color: routeOrigin.id === selectedLocation.id ? '#000' : 'var(--amber)',
                    border: '1px solid var(--amber)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  SET ORIGIN
                </button>

                {/* Direct Connect to Zero Transit */}
                <button
                  onClick={() => handleBookTransit(selectedLocation)}
                  className="btn-primary"
                  style={{ flex: 1.4, padding: '8px 12px', fontSize: '10px', justifyContent: 'center' }}
                >
                  <Rocket size={13} />
                  <span>BOOK SHUTTLE HERE</span>
                </button>
              </div>
            </div>

            {/* Route Planning Panel */}
            <div
              style={{
                background: 'rgba(12, 18, 28, 0.85)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={14} color="var(--cyan)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', letterSpacing: '0.14em', fontWeight: 600 }}>
                  SURFACE ROUTE CALCULATOR
                </span>
              </div>

              {/* Origin -> Destination Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--amber)' }}>{routeOrigin.name}</span>
                <ChevronRight size={13} color="var(--muted)" />
                <span style={{ color: 'var(--cyan)' }}>{selectedLocation.name}</span>
              </div>

              {/* Shortest vs Safe Selector */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setRouteType('safe')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '3px',
                    background: routeType === 'safe' ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                    border: `1px solid ${routeType === 'safe' ? 'var(--cyan)' : 'var(--line)'}`,
                    color: routeType === 'safe' ? 'var(--cyan)' : 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  SHIELDED CORRIDOR
                </button>
                <button
                  onClick={() => setRouteType('shortest')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '3px',
                    background: routeType === 'shortest' ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                    border: `1px solid ${routeType === 'shortest' ? 'var(--cyan)' : 'var(--line)'}`,
                    color: routeType === 'shortest' ? 'var(--cyan)' : 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  DIRECT TRAJECTORY
                </button>
              </div>

              {/* Route Telemetry Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>DISTANCE</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--bone)', fontWeight: 600 }}>
                    {effectiveDistanceKm} km
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>EST. TIME</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--bone)', fontWeight: 600 }}>
                    {estimatedHours} hrs
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>POWER DRAW</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--amber)', fontWeight: 600 }}>
                    -{powerCostPercent}%
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBookTransit(selectedLocation)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                <span>DISPATCH TRANSIT ALONG ROUTE</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

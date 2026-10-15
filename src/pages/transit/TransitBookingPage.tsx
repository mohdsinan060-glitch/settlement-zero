import { useState, useEffect } from 'react';
import {
  CANONICAL_LOCATIONS,
  calculateGreatCircleDistanceKm,
  calculateFictionalFare,
  interpolateGreatCircleArc,
  type PlanetaryLocation
} from '../../data/planetData';
import { useSearchParams, useNavigate } from '../../router';
import {
  transitBackend,
  type ShuttleClass,
  type UserProfile
} from '../../services/transitBackend';
import { TransitHeader } from './TransitHeader';
import {
  Rocket,
  MapPin,
  Compass,
  ArrowRight,
  Users,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Vignette } from '../../components/effects/Vignette';
import { Grain } from '../../components/effects/Grain';

export function TransitBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(transitBackend.getCurrentUser());

  // URL query prefill or defaults
  const paramPickup = searchParams.get('pickup');
  const paramDest = searchParams.get('destination');

  const defaultPickup =
    CANONICAL_LOCATIONS.find((l) => l.id === paramPickup) || CANONICAL_LOCATIONS[0];
  const defaultDest =
    CANONICAL_LOCATIONS.find((l) => l.id === paramDest) || CANONICAL_LOCATIONS[3];

  const [pickup, setPickup] = useState<PlanetaryLocation>(defaultPickup);
  const [destination, setDestination] = useState<PlanetaryLocation>(defaultDest);
  const [selectedClass, setSelectedClass] = useState<ShuttleClass>('ZERO_COMPACT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return transitBackend.subscribe(() => {
      setUser(transitBackend.getCurrentUser());
    });
  }, []);

  // Update if URL query changes
  useEffect(() => {
    if (paramPickup) {
      const match = CANONICAL_LOCATIONS.find((l) => l.id === paramPickup);
      if (match) setPickup(match);
    }
    if (paramDest) {
      const match = CANONICAL_LOCATIONS.find((l) => l.id === paramDest);
      if (match) setDestination(match);
    }
  }, [paramPickup, paramDest]);

  // Route calculations
  const distanceKm = calculateGreatCircleDistanceKm(
    pickup.latitude,
    pickup.longitude,
    destination.latitude,
    destination.longitude
  );

  const routeArc = interpolateGreatCircleArc(
    pickup.latitude,
    pickup.longitude,
    destination.latitude,
    destination.longitude,
    24
  );

  const shuttleOptions = [
    {
      vehicleClass: 'ZERO_COMPACT' as ShuttleClass,
      name: 'Zero Compact Alpha',
      callsign: 'ZT-101',
      capacity: '1 - 2 Passengers',
      speedKmh: '360 km/h',
      description: 'Dual-ion surface skimmer for rapid tactical personnel transport.',
      multiplier: 1.0,
      icon: Rocket,
      accent: 'var(--cyan)'
    },
    {
      vehicleClass: 'ZERO_EXPLORER' as ShuttleClass,
      name: 'Zero Explorer Beta',
      callsign: 'ZT-204',
      capacity: '3 - 4 Passengers',
      speedKmh: '320 km/h',
      description: 'Reinforced radiation shield hull designed for high-altitude mesa crossings.',
      multiplier: 1.4,
      icon: Compass,
      accent: '#38bdf8'
    },
    {
      vehicleClass: 'ZERO_HAULER' as ShuttleClass,
      name: 'Zero Hauler Gamma',
      callsign: 'ZT-308',
      capacity: '6 - 8 Passengers / Cargo',
      speedKmh: '280 km/h',
      description: 'Heavy multi-occupant transport with auxiliary survival canisters.',
      multiplier: 1.8,
      icon: Users,
      accent: 'var(--amber)'
    }
  ];

  const activeOption = shuttleOptions.find((o) => o.vehicleClass === selectedClass) || shuttleOptions[0];
  const fare = calculateFictionalFare(distanceKm, activeOption.multiplier);
  const estMins = Math.max(4, Math.round(distanceKm / 5));

  const handleBookRide = () => {
    setErrorMessage(null);

    // If unauthenticated, sign in automatically as survivor
    let activeUser = user;
    if (!activeUser) {
      activeUser = transitBackend.signIn('pilot@settlementzero.space', 'Commander');
      setUser(activeUser);
    }

    setIsSubmitting(true);

    const result = transitBackend.createBooking({
      pickupId: pickup.id,
      destinationId: destination.id,
      shuttleClass: selectedClass
    });

    setIsSubmitting(false);

    if (result.success && result.ride) {
      navigate(`/transit/rides/${result.ride.id}`);
    } else {
      setErrorMessage(result.error || 'Transit requisition rejected by colony traffic control.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--bone)', position: 'relative' }}>
      <Vignette />
      <Grain />

      <TransitHeader activeTab="book" />

      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '28px var(--pad) 80px', position: 'relative', zIndex: 10 }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <div className="eyebrow" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Rocket size={14} color="#38bdf8" />
            <span>ORBITAL & SURFACE TRANSIT NETWORK // PROXIMA-ZERO</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3.2vw, 36px)',
              fontWeight: 800,
              color: 'var(--bone)',
              margin: '8px 0 0'
            }}
          >
            DISPATCH A PASSENGER SHUTTLE
          </h1>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--red-alert)',
              borderRadius: '6px',
              color: '#f87171',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Layout: Booking Panel + Interactive Route Map */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(0, 1.4fr)', gap: '28px', alignItems: 'start' }}>
          {/* Left Booking Controls */}
          <div
            style={{
              background: 'rgba(12, 18, 28, 0.88)',
              border: '1px solid var(--line-cyan)',
              borderRadius: '8px',
              padding: '28px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Location Selectors */}
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.14em', display: 'block', marginBottom: '8px' }}>
                01 // PICKUP LOCATION
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                <MapPin size={16} color="var(--amber)" />
                <select
                  value={pickup.id}
                  onChange={(e) => {
                    const match = CANONICAL_LOCATIONS.find((l) => l.id === e.target.value);
                    if (match) setPickup(match);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--bone)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 600,
                    width: '100%',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {CANONICAL_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} style={{ background: '#0b1018', color: '#e2e8f0' }}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.14em', display: 'block', marginBottom: '8px' }}>
                02 // DESTINATION LOCATION
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                <Compass size={16} color="var(--cyan)" />
                <select
                  value={destination.id}
                  onChange={(e) => {
                    const match = CANONICAL_LOCATIONS.find((l) => l.id === e.target.value);
                    if (match) setDestination(match);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--bone)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 600,
                    width: '100%',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {CANONICAL_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} style={{ background: '#0b1018', color: '#e2e8f0' }}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shuttle Vehicle Selection Cards */}
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.14em', display: 'block', marginBottom: '10px' }}>
                03 // SELECT SHUTTLE CLASS
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {shuttleOptions.map((opt) => {
                  const isSelected = selectedClass === opt.vehicleClass;
                  const optFare = calculateFictionalFare(distanceKm, opt.multiplier);

                  return (
                    <div
                      key={opt.vehicleClass}
                      onClick={() => setSelectedClass(opt.vehicleClass)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${isSelected ? '#38bdf8' : 'var(--line)'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: opt.accent
                          }}
                        >
                          <opt.icon size={18} />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: 'var(--bone)' }}>
                            {opt.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                            {opt.capacity} // {opt.speedKmh}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>
                          {optFare.total} CR
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>
                          SIMULATED FARE
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fare Breakdown & Telemetry */}
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid var(--line-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                <span>Great-Circle Distance:</span>
                <span style={{ color: 'var(--bone)' }}>{distanceKm} km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                <span>Base Requisition Fare:</span>
                <span>{fare.base} CR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                <span>Distance Rate ({activeOption.multiplier}x multiplier):</span>
                <span>{fare.distanceCharge} CR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                <span>Orbital Service Fee:</span>
                <span>{fare.serviceCharge} CR</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--line)',
                  paddingTop: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#38bdf8'
                }}
              >
                <span>TOTAL FARE:</span>
                <span>{fare.total} CREDITS</span>
              </div>
            </div>

            {/* Booking Confirmation Action */}
            <button
              onClick={handleBookRide}
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                justifyContent: 'center',
                background: '#38bdf8',
                boxShadow: '0 0 24px rgba(56, 189, 248, 0.4)',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <span>{isSubmitting ? 'REQUISITIONING SHUTTLE...' : 'CONFIRM SHUTTLE BOOKING'}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Right Interactive Route Visualization Map */}
          <div
            style={{
              background: 'rgba(12, 18, 28, 0.88)',
              border: '1px solid var(--line-cyan)',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minHeight: '580px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-dot" style={{ background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone)', letterSpacing: '0.12em' }}>
                  SURFACE TRANSIT TRAJECTORY // CORRIDOR ACTIVE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#38bdf8' }}>
                <Clock size={13} />
                <span>EST. FLIGHT: {estMins} MINS</span>
              </div>
            </div>

            {/* Map Canvas */}
            <div
              style={{
                position: 'relative',
                flexGrow: 1,
                minHeight: '440px',
                background: 'radial-gradient(circle at 50% 50%, #0d1624 0%, #060a12 85%)',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                overflow: 'hidden'
              }}
            >
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="transit-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#transit-grid)" />

                {/* Animated Great-Circle Route Flight Path */}
                {routeArc.length > 1 && (
                  <path
                    d={`M ${((pickup.longitude + 180) / 360) * 100 * 6.5} ${((90 - pickup.latitude) / 180) * 100 * 4.5} ${routeArc
                      .map((pt) => {
                        const x = ((pt[1] + 180) / 360) * 650;
                        const y = ((90 - pt[0]) / 180) * 450;
                        return `L ${x} ${y}`;
                      })
                      .join(' ')}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="8 6"
                  />
                )}
              </svg>

              {/* Pickup Marker */}
              <div
                style={{
                  position: 'absolute',
                  left: `${((pickup.longitude + 180) / 360) * 100}%`,
                  top: `${((90 - pickup.latitude) / 180) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 16px var(--amber)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={12} color="#000" />
                </div>
                <span style={{ marginTop: '4px', background: 'rgba(0,0,0,0.85)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', whiteSpace: 'nowrap' }}>
                  PICKUP: {pickup.name}
                </span>
              </div>

              {/* Destination Marker */}
              <div
                style={{
                  position: 'absolute',
                  left: `${((destination.longitude + 180) / 360) * 100}%`,
                  top: `${((90 - destination.latitude) / 180) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 16px #38bdf8', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={12} color="#000" />
                </div>
                <span style={{ marginTop: '4px', background: 'rgba(0,0,0,0.85)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#38bdf8', whiteSpace: 'nowrap' }}>
                  DESTINATION: {destination.name}
                </span>
              </div>
            </div>

            {/* Route Summary Footer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '6px',
                border: '1px solid var(--line-soft)'
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>ASSIGNED CORRIDOR</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--bone)', fontWeight: 600 }}>
                  Great-Circle Geodesic Arc
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>RAD-PROTECTION</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                  Standard Titanium Hull
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>ATMOSPHERIC SEAL</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--cyan)', fontWeight: 600 }}>
                  101.3 kPa Pressurized
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

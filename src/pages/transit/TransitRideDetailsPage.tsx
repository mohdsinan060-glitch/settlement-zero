import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from '../../router';
import {
  transitBackend,
  type RideRecord,
  type RideStatus
} from '../../services/transitBackend';
import { TransitHeader } from './TransitHeader';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { Vignette } from '../../components/effects/Vignette';
import { Grain } from '../../components/effects/Grain';

export function TransitRideDetailsPage() {
  const { rideId } = useParams<{ rideId: string }>();

  const [ride, setRide] = useState<RideRecord | null>(() => {
    return rideId ? transitBackend.getRideById(rideId) : null;
  });

  const [livePos, setLivePos] = useState(() => {
    return ride
      ? transitBackend.getLiveShuttlePosition(ride)
      : { latitude: 0, longitude: 0, progressPercent: 0, remainingKm: 0, remainingSeconds: 0 };
  });

  const [cancelError, setCancelError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll live telemetry every second
  useEffect(() => {
    if (!rideId) return;

    const tick = () => {
      const current = transitBackend.getRideById(rideId);
      if (current) {
        setRide({ ...current });
        setLivePos(transitBackend.getLiveShuttlePosition(current));
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rideId]);

  if (!ride) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--bone)' }}>
        <TransitHeader />
        <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '24px' }}>
          <AlertTriangle size={36} color="var(--amber)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px' }}>
            TRANSIT MANIFEST NOT FOUND
          </h2>
          <p style={{ color: 'var(--bone-dim)', margin: '12px 0 24px' }}>
            No active or archived shuttle dispatch matches requisition ID [{rideId}].
          </p>
          <Link to="/transit" className="btn-primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={14} />
            <span>RETURN TO BOOKING INTERFACE</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleCancelRide = () => {
    setCancelError(null);
    const res = transitBackend.cancelRide(ride.id);
    if (!res.success) {
      setCancelError(res.error || 'Failed to cancel requisition.');
    } else {
      const updated = transitBackend.getRideById(ride.id);
      if (updated) setRide({ ...updated });
    }
  };

  const getStatusBadge = (status: RideStatus) => {
    switch (status) {
      case 'SEARCHING':
        return { label: 'SEARCHING FLEET', color: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'ASSIGNED':
        return { label: 'SHUTTLE ASSIGNED', color: 'var(--cyan)', bg: 'rgba(0, 229, 255, 0.15)' };
      case 'APPROACHING':
        return { label: 'APPROACHING PAD', color: 'var(--cyan)', bg: 'rgba(0, 229, 255, 0.15)' };
      case 'ARRIVED':
        return { label: 'BOARDING COMMENCED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'IN_TRANSIT':
        return { label: 'IN TRANSIT // CRUISING', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'COMPLETED':
        return { label: 'MISSION COMPLETED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
      case 'CANCELLED':
        return { label: 'TRANSIT CANCELLED', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' };
    }
  };

  const statusBadge = getStatusBadge(ride.status);
  const routePoints = ride.routeGeometry;

  // Stages checklist
  const stages: { status: RideStatus; label: string }[] = [
    { status: 'ASSIGNED', label: 'Shuttle Assigned' },
    { status: 'APPROACHING', label: 'Approach Vector' },
    { status: 'ARRIVED', label: 'Docked at Pad' },
    { status: 'IN_TRANSIT', label: 'Cruising Corridor' },
    { status: 'COMPLETED', label: 'Arrived at Destination' }
  ];

  const statusHierarchy: Record<RideStatus, number> = {
    SEARCHING: 0,
    ASSIGNED: 1,
    APPROACHING: 2,
    ARRIVED: 3,
    IN_TRANSIT: 4,
    COMPLETED: 5,
    CANCELLED: -1
  };

  const currentLevel = statusHierarchy[ride.status];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--bone)', position: 'relative' }}>
      <Vignette />
      <Grain />

      <TransitHeader activeTab="rides" />

      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px var(--pad) 80px', position: 'relative', zIndex: 10 }}>
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            to="/transit/rides"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--cyan)'
            }}
          >
            <ArrowLeft size={13} />
            <span>BACK TO RIDE ARCHIVES</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>REQUISITION:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
              {ride.id}
            </span>
          </div>
        </div>

        {cancelError && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--red-alert)',
              color: '#f87171',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              marginBottom: '18px'
            }}
          >
            {cancelError}
          </div>
        )}

        {/* Dual Layout: Live Map + Telemetry Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(360px, 1fr)', gap: '28px', alignItems: 'start' }}>
          {/* Left Live Tracking Map */}
          <div
            style={{
              background: 'rgba(12, 18, 28, 0.88)',
              border: '1px solid var(--line-cyan)',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minHeight: '620px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-dot" style={{ background: statusBadge.color, boxShadow: `0 0 8px ${statusBadge.color}` }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--bone)', letterSpacing: '0.14em' }}>
                  ACTIVE TRANSPONDER // {ride.shuttleCallsign}
                </span>
              </div>

              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: statusBadge.bg,
                  border: `1px solid ${statusBadge.color}`,
                  color: statusBadge.color,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.12em'
                }}
              >
                {statusBadge.label}
              </div>
            </div>

            {/* Map Canvas with Route and Live Moving Shuttle Marker */}
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
                  <pattern id="track-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#track-grid)" />

                {/* Planned Great-Circle Route Polyline */}
                {routePoints.length > 1 && (
                  <path
                    d={`M ${((ride.pickupLongitude + 180) / 360) * 100 * 7.5} ${((90 - ride.pickupLatitude) / 180) * 100 * 5} ${routePoints
                      .map((pt) => {
                        const x = ((pt[1] + 180) / 360) * 750;
                        const y = ((90 - pt[0]) / 180) * 500;
                        return `L ${x} ${y}`;
                      })
                      .join(' ')}`}
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                )}
              </svg>

              {/* Pickup Marker */}
              <div
                style={{
                  position: 'absolute',
                  left: `${((ride.pickupLongitude + 180) / 360) * 100}%`,
                  top: `${((90 - ride.pickupLatitude) / 180) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--amber)', border: '2px solid #fff' }} />
                <span style={{ marginTop: '2px', background: 'rgba(0,0,0,0.8)', padding: '2px 4px', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--amber)' }}>
                  {ride.pickupName}
                </span>
              </div>

              {/* Destination Marker */}
              <div
                style={{
                  position: 'absolute',
                  left: `${((ride.destinationLongitude + 180) / 360) * 100}%`,
                  top: `${((90 - ride.destinationLatitude) / 180) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#38bdf8', border: '2px solid #fff' }} />
                <span style={{ marginTop: '2px', background: 'rgba(0,0,0,0.8)', padding: '2px 4px', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#38bdf8' }}>
                  {ride.destinationName}
                </span>
              </div>

              {/* Live Animated Shuttle Icon at Dynamic Real-Time Position */}
              <div
                style={{
                  position: 'absolute',
                  left: `${((livePos.longitude + 180) / 360) * 100}%`,
                  top: `${((90 - livePos.latitude) / 180) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 35,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'left 1s linear, top 1s linear'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#00e5ff',
                    boxShadow: '0 0 24px #00e5ff',
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000'
                  }}
                >
                  <Rocket size={16} />
                </div>
                <div
                  style={{
                    marginTop: '4px',
                    background: 'rgba(0, 229, 255, 0.2)',
                    border: '1px solid var(--cyan)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--cyan)'
                  }}
                >
                  {ride.shuttleCallsign} ({livePos.progressPercent}%)
                </div>
              </div>
            </div>

            {/* Flight Metrics Footer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                padding: '14px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '6px',
                border: '1px solid var(--line-soft)'
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>PROGRESS</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--cyan)', fontWeight: 600 }}>
                  {livePos.progressPercent}%
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>REMAINING DISTANCE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--bone)', fontWeight: 600 }}>
                  {livePos.remainingKm} km
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>EST. TIME REMAINING</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#38bdf8', fontWeight: 600 }}>
                  {Math.ceil(livePos.remainingSeconds / 60)} min
                </div>
              </div>
            </div>
          </div>

          {/* Right Flight Telemetry & Stage Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Mission Overview Card */}
            <div
              style={{
                background: 'rgba(12, 18, 28, 0.88)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--bone)', margin: 0 }}>
                SHUTTLE TELEMETRY & SPECS
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                  <span>Assigned Vehicle:</span>
                  <span style={{ color: 'var(--bone)', fontWeight: 600 }}>{ride.shuttleName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                  <span>Transponder ID:</span>
                  <span style={{ color: '#38bdf8' }}>{ride.shuttleCallsign}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                  <span>Vehicle Class:</span>
                  <span style={{ color: 'var(--cyan)' }}>{ride.shuttleClass.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                  <span>Total Corridor Distance:</span>
                  <span style={{ color: 'var(--bone)' }}>{ride.distanceKm} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bone-dim)' }}>
                  <span>Simulated Fare Charged:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{ride.fareCredits} CREDITS</span>
                </div>
              </div>

              {/* Cancellation button if not completed/cancelled */}
              {ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
                <button
                  onClick={handleCancelRide}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--red-alert)',
                    color: '#f87171',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  <XCircle size={14} />
                  <span>ABORT TRANSIT REQUISITION</span>
                </button>
              )}
            </div>

            {/* Flight Progression Stages */}
            <div
              style={{
                background: 'rgba(12, 18, 28, 0.88)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--bone)', margin: 0 }}>
                TRAJECTORY PROGRESSION
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stages.map((stg, i) => {
                  const stageLevel = statusHierarchy[stg.status];
                  const isDone = currentLevel >= stageLevel;
                  const isCurrent = currentLevel === stageLevel;

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        background: isCurrent ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                        border: isCurrent ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent'
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: isDone ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000',
                          fontSize: '10px'
                        }}
                      >
                        {isDone ? <CheckCircle2 size={12} color="#fff" /> : i + 1}
                      </div>

                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: isDone ? 'var(--bone)' : 'var(--muted)',
                          fontWeight: isCurrent ? 600 : 400
                        }}
                      >
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real-time Telemetry Event Logs */}
            <div
              style={{
                background: 'rgba(12, 18, 28, 0.88)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
                MISSION TELEMETRY LOGS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                {ride.events.map((ev) => (
                  <div key={ev.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone-dim)', lineHeight: 1.4 }}>
                    <span style={{ color: '#38bdf8' }}>[{ev.timestamp}]</span> {ev.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

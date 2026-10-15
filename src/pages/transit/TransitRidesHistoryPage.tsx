import { useState, useEffect } from 'react';
import { Link } from '../../router';
import {
  transitBackend,
  type RideRecord,
  type RideStatus
} from '../../services/transitBackend';
import { TransitHeader } from './TransitHeader';
import {
  History,
  Rocket,
  ArrowRight,
  Compass
} from 'lucide-react';
import { Vignette } from '../../components/effects/Vignette';
import { Grain } from '../../components/effects/Grain';

export function TransitRidesHistoryPage() {
  const [rides, setRides] = useState<RideRecord[]>(() => transitBackend.getRides());

  useEffect(() => {
    return transitBackend.subscribe(() => {
      setRides(transitBackend.getRides());
    });
  }, []);

  const getStatusBadge = (status: RideStatus) => {
    switch (status) {
      case 'SEARCHING':
        return { label: 'SEARCHING', color: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'ASSIGNED':
      case 'APPROACHING':
      case 'ARRIVED':
        return { label: 'EN ROUTE', color: 'var(--cyan)', bg: 'rgba(0, 229, 255, 0.15)' };
      case 'IN_TRANSIT':
        return { label: 'IN FLIGHT', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'COMPLETED':
        return { label: 'COMPLETED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'CANCELLED':
        return { label: 'CANCELLED', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--bone)', position: 'relative' }}>
      <Vignette />
      <Grain />

      <TransitHeader activeTab="rides" />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px var(--pad) 80px', position: 'relative', zIndex: 10 }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div className="eyebrow" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={14} color="#38bdf8" />
              <span>COLONY TRANSIT ARCHIVES</span>
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
              TRANSIT LOGS & DISPATCH HISTORY
            </h1>
          </div>

          <Link to="/transit" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 18px', fontSize: '11px' }}>
            <Rocket size={14} />
            <span>BOOK NEW SHUTTLE</span>
          </Link>
        </div>

        {/* List of Rides */}
        {rides.length === 0 ? (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              background: 'rgba(12, 18, 28, 0.7)',
              borderRadius: '8px',
              border: '1px solid var(--line)'
            }}
          >
            <Compass size={40} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--bone)', margin: '0 0 8px' }}>
              NO TRANSIT LOGS RECORDED
            </h3>
            <p style={{ color: 'var(--bone-dim)', maxWidth: '44ch', margin: '0 auto 24px' }}>
              You have not requisitioned any passenger shuttles yet across Proxima-Zero.
            </p>
            <Link to="/transit" className="btn-primary" style={{ display: 'inline-flex' }}>
              <span>EXPLORE ROUTES & DISPATCH SHUTTLE</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {rides.map((ride) => {
              const badge = getStatusBadge(ride.status);
              const dateStr = new Date(ride.requestedAt).toLocaleDateString() + ' ' + new Date(ride.requestedAt).toLocaleTimeString();

              return (
                <Link
                  key={ride.id}
                  to={`/transit/rides/${ride.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '18px',
                    padding: '20px 24px',
                    background: 'rgba(12, 18, 28, 0.85)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--line)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8'
                      }}
                    >
                      <Rocket size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                          {ride.id}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                          {dateStr}
                        </span>
                      </div>

                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--bone)' }}>
                        {ride.pickupName} <span style={{ color: 'var(--muted)', fontSize: '14px' }}>→</span> {ride.destinationName}
                      </div>

                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone-dim)', marginTop: '2px' }}>
                        {ride.shuttleName} ({ride.shuttleCallsign}) // {ride.distanceKm} km
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--bone)' }}>
                        {ride.fareCredits} CR
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          background: badge.bg,
                          border: `1px solid ${badge.color}`,
                          color: badge.color,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          marginTop: '4px'
                        }}
                      >
                        {badge.label}
                      </div>
                    </div>

                    <ArrowRight size={16} color="var(--cyan)" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

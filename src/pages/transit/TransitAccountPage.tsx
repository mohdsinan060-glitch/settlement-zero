import { useState, useEffect } from 'react';
import { useNavigate, Link } from '../../router';
import { transitBackend, type UserProfile } from '../../services/transitBackend';
import { TransitHeader } from './TransitHeader';
import { User, Shield, CreditCard, History, LogOut, RefreshCw } from 'lucide-react';
import { Vignette } from '../../components/effects/Vignette';
import { Grain } from '../../components/effects/Grain';

export function TransitAccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(transitBackend.getCurrentUser());
  const rides = transitBackend.getUserRides();

  useEffect(() => {
    return transitBackend.subscribe(() => {
      setUser(transitBackend.getCurrentUser());
    });
  }, []);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--bone)' }}>
        <TransitHeader />
        <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center', padding: '24px' }}>
          <User size={36} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}>UNAUTHORIZED ACCESS</h2>
          <p style={{ color: 'var(--bone-dim)', margin: '12px 0 24px' }}>
            Please authenticate credentials to view your colonist transit dossier.
          </p>
          <Link to="/transit/login" className="btn-primary" style={{ display: 'inline-flex' }}>
            <span>PROCEED TO SIGN IN</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    transitBackend.signOut();
    navigate('/transit');
  };

  const handleGrantCredits = () => {
    user.creditsBalance += 250;
    localStorage.setItem('settlement_zero_user_session', JSON.stringify(user));
    setUser({ ...user });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--bone)', position: 'relative' }}>
      <Vignette />
      <Grain />

      <TransitHeader activeTab="account" />

      <main style={{ maxWidth: '860px', margin: '32px auto', padding: '0 var(--pad) 80px', position: 'relative', zIndex: 10 }}>
        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <div className="eyebrow" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={14} color="#38bdf8" />
            <span>COLONIST PROFILE & TRANSIT CLEARANCE</span>
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
            PILOT TRANSPONDER DOSSIER
          </h1>
        </div>

        {/* Profile Details Card */}
        <div
          style={{
            background: 'rgba(12, 18, 28, 0.92)',
            border: '1px solid var(--line-cyan)',
            borderRadius: '8px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
          }}
        >
          {/* User Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--line-soft)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '2px solid #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8'
                }}
              >
                <User size={28} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: 'var(--bone)' }}>
                  {user.displayName}
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#38bdf8' }}>
                  CALLSIGN: {user.callsign} // {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '4px',
                border: '1px solid var(--line)',
                background: 'rgba(0,0,0,0.4)',
                color: 'var(--bone-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={13} />
              <span>TERMINATE SESSION</span>
            </button>
          </div>

          {/* Stats Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '6px', border: '1px solid var(--line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>TRANSIT CREDITS</span>
                <CreditCard size={14} color="#38bdf8" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: '#38bdf8' }}>
                {user.creditsBalance} <span style={{ fontSize: '12px' }}>CR</span>
              </div>
              <button
                onClick={handleGrantCredits}
                style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <RefreshCw size={10} />
                <span>REQUISITION +250 EMERGENCY CREDITS</span>
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '6px', border: '1px solid var(--line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>CLEARANCE TIER</span>
                <Shield size={14} color="var(--amber)" />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--bone)' }}>
                {user.clearanceTier}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone-dim)' }}>
                Authorizes heavy sub-surface & orbital corridors
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '6px', border: '1px solid var(--line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>TOTAL MISSIONS</span>
                <History size={14} color="#10b981" />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--bone)' }}>
                {rides.length} <span style={{ fontSize: '12px', color: '#10b981' }}>LOGS</span>
              </div>
              <Link to="/transit/rides" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#10b981', display: 'block', marginTop: '6px' }}>
                VIEW FULL DISPATCH HISTORY →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

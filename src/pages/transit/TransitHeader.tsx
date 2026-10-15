import { useEffect, useState } from 'react';
import { Link, useNavigate } from '../../router';
import { transitBackend, type UserProfile } from '../../services/transitBackend';
import { Rocket, User, History, LogIn, LogOut, Home } from 'lucide-react';

export function TransitHeader({ activeTab }: { activeTab?: 'book' | 'rides' | 'account' | 'login' }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(transitBackend.getCurrentUser());
  const isCloud = transitBackend.isSupabaseConfigured();

  useEffect(() => {
    return transitBackend.subscribe(() => {
      setUser(transitBackend.getCurrentUser());
    });
  }, []);

  const handleSignOut = () => {
    transitBackend.signOut();
    navigate('/transit');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px var(--pad)',
        background: 'rgba(2, 5, 9, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line-soft)',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      {/* Brand & Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link to="/transit" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="nav-logo-box" style={{ width: '34px', height: '34px', background: 'rgba(56, 189, 248, 0.12)', borderColor: '#38bdf8' }}>
            <Rocket size={18} color="#38bdf8" />
          </div>
          <div>
            <div className="nav-brand-title" style={{ fontSize: '12px', letterSpacing: '0.22em' }}>
              ZERO TRANSIT
            </div>
            <div className="nav-brand-sub" style={{ fontSize: '9px', color: '#38bdf8' }}>
              YOUR PLANET. YOUR ROUTE. YOUR RIDE.
            </div>
          </div>
        </Link>

        {/* Backend Cloud / Local Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: isCloud ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${isCloud ? '#10b981' : 'var(--amber)'}`,
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: isCloud ? '#10b981' : 'var(--amber)'
          }}
          title={isCloud ? 'Connected to live Supabase backend' : 'Running on persistent colony local storage buffer'}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isCloud ? '#10b981' : 'var(--amber)' }} />
          <span>{isCloud ? 'SUPABASE CLOUD' : 'LOCAL BUFFER'}</span>
        </div>
      </div>

      {/* Transit Sub-nav & Account */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em' }}>
        <Link to="/" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Home size={12} />
          <span>GATEWAY</span>
        </Link>
        <Link to="/habitat" style={{ color: 'var(--muted)' }}>
          HABITAT
        </Link>
        <Link to="/navigation" style={{ color: 'var(--muted)' }}>
          NAVIGATION
        </Link>

        <span style={{ color: 'var(--line)' }}>|</span>

        <Link
          to="/transit"
          style={{
            color: activeTab === 'book' ? '#38bdf8' : 'var(--bone-dim)',
            fontWeight: activeTab === 'book' ? 600 : 400
          }}
        >
          BOOK
        </Link>

        <Link
          to="/transit/rides"
          style={{
            color: activeTab === 'rides' ? '#38bdf8' : 'var(--bone-dim)',
            fontWeight: activeTab === 'rides' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <History size={12} />
          <span>RIDES</span>
        </Link>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/transit/account"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '4px',
                color: 'var(--bone)'
              }}
            >
              <User size={12} color="#38bdf8" />
              <span>{user.callsign}</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>({user.creditsBalance} CR)</span>
            </Link>

            <button
              onClick={handleSignOut}
              style={{ color: 'var(--muted)', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <Link
            to="/transit/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: '#38bdf8',
              color: 'var(--void)',
              borderRadius: '4px',
              fontWeight: 600
            }}
          >
            <LogIn size={12} />
            <span>SIGN IN</span>
          </Link>
        )}
      </div>
    </header>
  );
}

import { useState, type FormEvent } from 'react';
import { useNavigate } from '../../router';
import { transitBackend } from '../../services/transitBackend';
import { TransitHeader } from './TransitHeader';
import { Rocket, ShieldCheck, ArrowRight, User, Mail, Database } from 'lucide-react';
import { Vignette } from '../../components/effects/Vignette';
import { Grain } from '../../components/effects/Grain';

export function TransitLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const isCloud = transitBackend.isSupabaseConfigured();

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    const finalEmail = email.trim() || 'pilot@settlementzero.space';
    const finalName = displayName.trim() || 'Colonist Pilot';
    transitBackend.signIn(finalEmail, finalName);
    navigate('/transit');
  };

  const handleQuickDemoLogin = () => {
    transitBackend.signIn('commander.arcadia9@settlementzero.space', 'Commander Vane');
    navigate('/transit');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--bone)', position: 'relative' }}>
      <Vignette />
      <Grain />

      <TransitHeader activeTab="login" />

      <main style={{ maxWidth: '520px', margin: '60px auto', padding: '0 var(--pad) 80px', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            background: 'rgba(12, 18, 28, 0.92)',
            border: '1px solid var(--line-cyan)',
            borderRadius: '8px',
            padding: '36px 32px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #38bdf8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                marginBottom: '14px'
              }}
            >
              <Rocket size={26} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, margin: '0 0 6px' }}>
              COLONY IDENTITY VERIFICATION
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--bone-dim)', margin: 0 }}>
              Authenticate transponder credentials to access the Zero Transit passenger fleet.
            </p>
          </div>

          {/* Backend Connection Indicator */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              background: isCloud ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${isCloud ? '#10b981' : 'var(--amber)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Database size={16} color={isCloud ? '#10b981' : 'var(--amber)'} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: isCloud ? '#10b981' : 'var(--amber)' }}>
              {isCloud
                ? 'SUPABASE CLOUD POSTGRESQL // AUTH LINK ACTIVE'
                : 'LOCAL PERSISTENT COLONY BUFFER // CLIENT SYNC ACTIVE'}
            </div>
          </div>

          {/* Quick Demo One-Click Login */}
          <button
            onClick={handleQuickDemoLogin}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              justifyContent: 'center',
              background: '#38bdf8',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
              fontSize: '11px'
            }}
          >
            <ShieldCheck size={16} />
            <span>CONTINUE AS EXPEDITION COMMANDER</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--line)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>OR ENTER CALLSIGN</span>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--line)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                COLONIST DISPLAY NAME
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                <User size={15} color="var(--muted)" />
                <input
                  type="text"
                  placeholder="e.g. Commander Vane"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--bone)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                ORBITAL EMAIL ADDRESS
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                <Mail size={15} color="var(--muted)" />
                <input
                  type="email"
                  placeholder="e.g. pilot@settlementzero.space"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--bone)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-secondary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '8px' }}
            >
              <span>AUTHORIZE TRANSPONDER ACCESS</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

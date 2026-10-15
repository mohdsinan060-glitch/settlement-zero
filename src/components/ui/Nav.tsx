import { useSettlementStore } from '../../store/useSettlementStore';
import { Activity, Compass, Radio } from 'lucide-react';

export function Nav() {
  const { status, oxygenLevel, civilizationReadiness } = useSettlementStore();

  const getStatusBadgeClass = () => {
    switch (status) {
      case 'EMERGENCY':
        return 'badge-emergency';
      case 'STABILIZING':
        return 'badge-stabilizing';
      case 'SELF-SUFFICIENT':
        return 'badge-self-sufficient';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'EMERGENCY':
        return 'PRIORITY 1: CRITICAL';
      case 'STABILIZING':
        return 'SYSTEMS RECOVERING';
      case 'SELF-SUFFICIENT':
        return 'COLONY OPERATIONAL';
    }
  };

  return (
    <header className="nav">
      {/* Background glass wash */}
      <div className="nav-bg" />

      {/* Brand & status */}
      <div className="nav-brand">
        <a href="#orbital" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="nav-logo-box">
            <Radio size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="nav-brand-title">SETTLEMENT ZERO</span>
            <span className="nav-brand-sub">SECTOR 9 // UNCHARTED EXOPLANET</span>
          </div>
        </a>

        {/* Status Pill */}
        <div className={`nav-status-badge ${getStatusBadgeClass()}`}>
          <span className="badge-dot" />
          <span>{getStatusLabel()}</span>
        </div>
      </div>

      {/* Center Nav Anchors */}
      <nav className="nav-links">
        <a href="#orbital">01 Orbit</a>
        <a href="#crash-site">02 Crash</a>
        <a href="#exploration">03 Scan</a>
        <a href="#emergency">04 Life Support</a>
        <a href="#command">05 Command</a>
      </nav>

      {/* Right Telemetry indicators */}
      <div className="nav-telemetry">
        {/* Oxygen Gauge */}
        <div className="gauge-chip">
          <Activity
            size={16}
            color={oxygenLevel <= 20 ? '#ef4444' : 'var(--cyan)'}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
              O₂ Resupply
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="gauge-track">
                <div
                  className="gauge-fill"
                  style={{
                    width: `${oxygenLevel}%`,
                    backgroundColor:
                      oxygenLevel <= 20
                        ? '#ef4444'
                        : oxygenLevel < 50
                        ? '#f59e0b'
                        : 'var(--cyan)',
                    boxShadow:
                      oxygenLevel <= 20
                        ? '0 0 8px #ef4444'
                        : oxygenLevel < 50
                        ? '0 0 8px #f59e0b'
                        : '0 0 8px var(--cyan)'
                  }}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>
                {oxygenLevel}%
              </span>
            </div>
          </div>
        </div>

        {/* Readiness Gauge */}
        <div className="gauge-chip">
          <Compass size={16} color="var(--amber)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="mono-tag" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
              Readiness
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--amber)' }}>
              {civilizationReadiness}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

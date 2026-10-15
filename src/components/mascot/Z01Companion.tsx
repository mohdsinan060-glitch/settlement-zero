import { useState } from 'react';
import { useSettlementStore } from '../../store/useSettlementStore';
import { Z01Artwork } from './Z01Artwork';
import { Radar, Crosshair, Activity, X, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';

export function Z01Companion() {
  const {
    mascotMood,
    mascotDialogue,
    dialogueOpen,
    openDialogue,
    closeDialogue,
    toggleScan,
    inspectWreckage,
    oxygenLevel,
    status
  } = useSettlementStore();

  const [isMinimized, setIsMinimized] = useState(false);

  const getStatusIndicator = () => {
    if (status === 'EMERGENCY' || oxygenLevel <= 20) {
      return {
        label: 'EMERGENCY ALERT',
        color: 'text-red-400',
        dot: '#ef4444',
      };
    }
    if (status === 'STABILIZING') {
      return {
        label: 'STABILIZING TELEMETRY',
        color: 'text-amber-400',
        dot: '#f59e0b',
      };
    }
    return {
      label: 'SYSTEMS NOMINAL',
      color: 'text-cyan-400',
      dot: '#00e5ff',
    };
  };

  const statusInfo = getStatusIndicator();

  const handleActionScan = () => {
    toggleScan();
    const elem = document.getElementById('exploration');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleActionWreckage = () => {
    inspectWreckage();
    const elem = document.getElementById('crash-site');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleActionLifeSupport = () => {
    openDialogue(
      `O₂ levels currently measured at ${oxygenLevel}%. Habitat life support requires active supply stabilization.`
    );
    const elem = document.getElementById('emergency');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="z01-companion-dock" role="region" aria-label="Z-01 Exploration Companion">
      {/* Dialogue and Action Card */}
      {dialogueOpen && (
        <div className="z01-dialogue-card">
          {/* Card Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: isMinimized ? 'none' : '1px solid var(--line-soft)',
              paddingBottom: isMinimized ? '0' : '10px',
              marginBottom: isMinimized ? '0' : '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: statusInfo.dot,
                  boxShadow: `0 0 8px ${statusInfo.dot}`,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  color: 'var(--bone)',
                }}
              >
                Z-01
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.18em',
                  color: 'var(--bone-dim)',
                }}
              >
                // COMPANION
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                style={{
                  color: 'var(--bone-dim)',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bone)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bone-dim)')}
              >
                {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <button
                onClick={closeDialogue}
                title="Close dialogue"
                style={{
                  color: 'var(--bone-dim)',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bone)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bone-dim)')}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Dialogue Text Content */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'var(--bone)',
                  marginBottom: '14px',
                  textShadow: '0 1px 12px rgba(0, 0, 0, 0.8)',
                }}
              >
                {mascotDialogue ||
                  "Pilot? Signal detected. You're alive… barely. Our colony ship is compromised, and this planet is uncharted. Let’s find somewhere we can survive."}
              </p>

              {/* Three Useful Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <button
                  onClick={handleActionWreckage}
                  className="z01-action-btn"
                >
                  <Crosshair size={13} color="var(--cyan)" />
                  <span>Investigate Arcadia-9 Wreckage</span>
                </button>

                <button
                  onClick={handleActionScan}
                  className="z01-action-btn"
                >
                  <Radar size={13} color="var(--cyan)" />
                  <span>Engage Topographic Terrain Scan</span>
                </button>

                <button
                  onClick={handleActionLifeSupport}
                  className="z01-action-btn"
                >
                  <Activity size={13} color={oxygenLevel <= 20 ? '#ef4444' : 'var(--amber)'} />
                  <span>Life Support Telemetry ({oxygenLevel}% O₂)</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Mascot Trigger Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {!dialogueOpen && (
          <button
            onClick={() => openDialogue()}
            className="glass-panel"
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: '1px solid var(--line-cyan)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
          >
            <MessageSquare size={13} color="var(--cyan)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--bone)', letterSpacing: '0.12em' }}>
              COMS LINK READY
            </span>
          </button>
        )}

        <button
          onClick={() => {
            if (dialogueOpen) {
              closeDialogue();
            } else {
              openDialogue();
            }
          }}
          title="Interact with Z-01 Companion"
          style={{
            cursor: 'pointer',
            position: 'relative',
            outline: 'none',
          }}
        >
          <Z01Artwork mood={mascotMood} size={105} isFloating={true} />

          {/* Online telemetry ring badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '12px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: statusInfo.dot,
              border: '2px solid #030712',
              boxShadow: `0 0 10px ${statusInfo.dot}`,
            }}
          />
        </button>
      </div>
    </div>
  );
}

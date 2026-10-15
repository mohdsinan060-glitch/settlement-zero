import { useState } from 'react';
import { useSettlementStore } from '../../store/useSettlementStore';
import {
  Crosshair,
  AlertOctagon,
  ShieldAlert,
  BatteryCharging,
  Wind,
  CheckCircle2,
  X,
  Radio,
  ArrowRight
} from 'lucide-react';

export function CrashSiteInteractive() {
  const {
    wreckageInspected,
    wreckageSuppliesCollected,
    inspectWreckage,
    collectWreckageSupplies,
    openDialogue
  } = useSettlementStore();

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenInspection = () => {
    inspectWreckage();
    setModalOpen(true);
  };

  const handleCollectSupplies = () => {
    collectWreckageSupplies();
    openDialogue(
      "Excellent work, Pilot! Emergency canisters transferred to habitat scrubbers. O2 capacity boosted and telemetry mapped."
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', zIndex: 10 }}>
      {/* Chapter Eyebrow & Headline */}
      <div className="eyebrow" style={{ color: 'var(--amber)' }}>
        <span
          className="pulse-dot"
          style={{ backgroundColor: 'var(--amber)', boxShadow: '0 0 10px var(--amber)' }}
        />
        <span>CHAPTER 02 // SURFACE WRECKAGE</span>
      </div>

      <h2 className="title-display h-sec" style={{ marginTop: '16px', marginBottom: '14px' }}>
        CRASH SITE CONTACT
      </h2>

      <p className="hero-desc" style={{ maxWidth: '58ch' }}>
        Colony Transport Arcadia-9 lies fractured along the jagged basalt ridge.
        Scout unit Z-01 has localized emergency transponder signals leaking from the command hold.
        Critical life support supplies and sub-surface maps can still be salvaged before the
        methane dust storm settles.
      </p>

      {/* Interactive Marker Banner */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '20px 24px',
          borderRadius: '6px',
          maxWidth: '720px',
          marginTop: '28px',
          border: '1px solid var(--line-cyan)',
          background: 'rgba(12, 18, 28, 0.75)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '4px',
              border: '1px solid var(--line-cyan)',
              background: 'rgba(0, 229, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan)',
            }}
          >
            <Radio size={20} className="animate-pulse" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.12em', color: 'var(--bone)' }}>
                ARCADIA-9 PRIMARY FUSELAGE
              </span>
              <span className="mono-tag" style={{ color: wreckageSuppliesCollected ? '#34d399' : 'var(--amber)', fontSize: '10px' }}>
                {wreckageSuppliesCollected ? 'SALVAGED' : wreckageInspected ? 'INSPECTION ACTIVE' : 'SIGNAL ACTIVE'}
              </span>
            </div>
            <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)', marginTop: '2px' }}>
              COORDINATES: LAT 14.82°S // LONG 88.04°W — BASALT CRAG 04
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenInspection}
          className="btn-primary"
          style={{
            padding: '10px 20px',
            fontSize: '11px',
            backgroundColor: wreckageSuppliesCollected ? '#10b981' : 'var(--cyan)',
            boxShadow: wreckageSuppliesCollected ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 0 20px rgba(0, 229, 255, 0.35)',
          }}
        >
          <Crosshair size={15} />
          <span>{wreckageSuppliesCollected ? 'Review Manifest' : wreckageInspected ? 'Resume Inspection' : 'Investigate Wreckage'}</span>
        </button>
      </div>

      {/* Cinematic Inspection Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            backgroundColor: 'rgba(2, 5, 9, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: 'min(640px, 94vw)',
              borderRadius: '8px',
              padding: '28px',
              border: '1px solid var(--line-cyan)',
              background: 'rgba(10, 16, 25, 0.95)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 229, 255, 0.15)',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--line-soft)',
                paddingBottom: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div className="eyebrow" style={{ color: 'var(--cyan)', marginBottom: '4px' }}>
                  <span>DAMAGE ASSESSMENT // TELEMETRY LINK</span>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--bone)',
                    margin: 0,
                  }}
                >
                  COLONY TRANSPORT ARCADIA-9
                </h3>
                <span className="mono-tag" style={{ fontSize: '10px', color: 'var(--bone-dim)' }}>
                  HULL REGISTRATION: ARC-904 // CLASS-IV DEEP VOID TRANSPORTER
                </span>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                title="Close modal"
                style={{
                  color: 'var(--bone-dim)',
                  padding: '6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bone)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bone-dim)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Diagnostic Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                marginBottom: '22px',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  background: 'rgba(14, 20, 30, 0.6)',
                  border: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', marginBottom: '4px' }}>
                  <AlertOctagon size={14} />
                  <span className="mono-tag" style={{ fontSize: '10px' }}>HULL INTEGRITY</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--bone)' }}>
                  14.2% CRITICAL
                </span>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  background: 'rgba(14, 20, 30, 0.6)',
                  border: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber)', marginBottom: '4px' }}>
                  <ShieldAlert size={14} />
                  <span className="mono-tag" style={{ fontSize: '10px' }}>REACTOR STATE</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--amber)' }}>
                  OFFLINE (SCRAMMED)
                </span>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  background: 'rgba(14, 20, 30, 0.6)',
                  border: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)', marginBottom: '4px' }}>
                  <Radio size={14} />
                  <span className="mono-tag" style={{ fontSize: '10px' }}>CRYO SURVIVORS</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--cyan)' }}>
                  42 PODS EJECTED
                </span>
              </div>
            </div>

            {/* Recoverable Resources Manifest */}
            <div style={{ marginBottom: '24px' }}>
              <span className="mono-tag" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--bone-dim)', marginBottom: '10px', display: 'block' }}>
                Recoverable Emergency Supplies
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    background: 'rgba(7, 12, 18, 0.7)',
                    border: '1px solid var(--line-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wind size={16} color="var(--cyan)" />
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--bone)', fontWeight: 500 }}>
                        Pressurized O₂ Emergency Buffer
                      </span>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--bone-dim)' }}>
                        Three intact atmospheric scrubber cylinders
                      </p>
                    </div>
                  </div>
                  <span className="mono-tag" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                    +12% O₂
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    background: 'rgba(7, 12, 18, 0.7)',
                    border: '1px solid var(--line-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BatteryCharging size={16} color="var(--amber)" />
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--bone)', fontWeight: 500 }}>
                        High-Density Solid-State Capacitors
                      </span>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--bone-dim)' }}>
                        Boosts outpost electrical distribution array
                      </p>
                    </div>
                  </div>
                  <span className="mono-tag" style={{ color: 'var(--amber)', fontWeight: 600 }}>
                    +14% Readiness
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '11px' }}
              >
                Close Report
              </button>

              {!wreckageSuppliesCollected ? (
                <button
                  onClick={handleCollectSupplies}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '11px' }}
                >
                  <span>Recover Supplies</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
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
                  <span>Supplies Secured</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

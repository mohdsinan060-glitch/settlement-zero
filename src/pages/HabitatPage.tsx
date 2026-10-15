import { SceneCanvas } from '../components/canvas/SceneCanvas';
import { StarField } from '../components/canvas/StarField';
import { Vignette } from '../components/effects/Vignette';
import { Grain } from '../components/effects/Grain';
import { Nav } from '../components/ui/Nav';
import { Preloader } from '../components/ui/Preloader';
import { Z01Companion } from '../components/mascot/Z01Companion';
import { CrashSiteInteractive } from '../components/sections/CrashSiteInteractive';
import { PlanetaryScan } from '../components/sections/PlanetaryScan';
import { LifeSupportEmergency } from '../components/sections/LifeSupportEmergency';
import { ColonyCommandCenter } from '../components/sections/ColonyCommandCenter';
import { SimulationExpeditionDeck } from '../components/sections/SimulationExpeditionDeck';
import { useSettlementStore } from '../store/useSettlementStore';
import { ChevronDown, Compass, Home } from 'lucide-react';
import { Link } from '../router';

export function HabitatPage() {
  const { oxygenLevel, activeSurvivors, civilizationReadiness } = useSettlementStore();

  return (
    <>
      {/* Layer 0: Full-screen WebGL Canvas */}
      <SceneCanvas>
        <StarField count={2400} depth={140} />
      </SceneCanvas>

      {/* Layer 55 & 60: Post-processing screen overlays */}
      <Vignette />
      <Grain />

      {/* Layer 100: Preloader */}
      <Preloader />

      {/* Layer 50: Navigation & Telemetry */}
      <Nav />

      {/* Layer 40: Interactive Z-01 Companion Dock */}
      <Z01Companion />

      {/* Layer 10: Scrolling Cinematic Content */}
      <main className="page">
        {/* =========================================================================
            SECTION 1: ORBITAL ARRIVAL
            ========================================================================= */}
        <section id="orbital" className="sec">
          <div className="hero-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div className="eyebrow">
                <span className="pulse-dot" />
                <span>COLONY EXPEDITION // EXOPLANET PROXIMA-ZERO</span>
              </div>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  color: 'var(--cyan)',
                  padding: '4px 10px',
                  background: 'rgba(0, 229, 255, 0.08)',
                  border: '1px solid var(--line-cyan)',
                  borderRadius: '3px'
                }}
              >
                <Home size={12} />
                <span>FLEET GATEWAY</span>
              </Link>
            </div>

            <h1 className="title-display h-hero" style={{ marginTop: '16px', marginBottom: '8px' }}>
              SETTLEMENT<br />ZERO
            </h1>

            <span className="hero-tagline">
              EARTH IS GONE. SURVIVAL BEGINS HERE.
            </span>

            <p className="hero-desc">
              Following the collapse of the terrestrial biosphere, Colony Transport Arcadia-9 has entered
              low orbit above an uncharted world. Atmospheric re-entry is compromised. As surviving commander,
              your telemetry link with scout drone Z-01 is humanity's sole path toward establishing its first
              permanent planetary settlement.
            </p>

            <div className="hero-actions">
              <a href="#crash-site" className="btn-primary">
                <span>Initiate Surface Descent</span>
                <ChevronDown size={16} />
              </a>
              <a href="#simulation" className="btn-secondary">
                <Compass size={15} color="var(--cyan)" />
                <span>Simulation Controls</span>
              </a>
              <Link to="/navigation" className="btn-secondary" style={{ border: '1px solid var(--line-cyan)' }}>
                <Compass size={15} color="var(--cyan)" />
                <span>Planetary Navigation</span>
              </Link>
            </div>

            <div className="hero-cue">
              <span>Scroll to Begin Descent</span>
              <div className="hero-cue-track">
                <i />
              </div>
            </div>

            {/* Quick Status Readouts */}
            <div className="hero-chips">
              <div className="chip-item">
                <span className="chip-label">Colony Complement</span>
                <span className="chip-val">{activeSurvivors}</span>
                <span className="chip-sub">Cryo-survivors accounted</span>
              </div>

              <div className="chip-item">
                <span className="chip-label">Life Support Status</span>
                <span
                  className="chip-val"
                  style={{ color: oxygenLevel <= 20 ? 'var(--red-alert)' : 'var(--cyan)' }}
                >
                  {oxygenLevel}% O₂
                </span>
                <span className="chip-sub">
                  {oxygenLevel <= 20 ? 'CRITICAL DEPLETION' : 'NOMINAL BUFFER'}
                </span>
              </div>

              <div className="chip-item">
                <span className="chip-label">Civilization Readiness</span>
                <span className="chip-val" style={{ color: 'var(--amber)' }}>
                  {civilizationReadiness}%
                </span>
                <span className="chip-sub">Tier 1: Emergency survival</span>
              </div>

              <div className="chip-item">
                <span className="chip-label">Planetary Atmosphere</span>
                <span className="chip-val" style={{ fontSize: '18px', paddingTop: '4px' }}>
                  N₂ / CH₄ / CO₂
                </span>
                <span className="chip-sub">Surface temp -32°C // 0.84G</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SIMULATION EXPEDITION DECK (Upgraded Seeded Gameplay & Events)
            ========================================================================= */}
        <section id="simulation" className="sec" style={{ borderTop: '1px solid var(--line-soft)', paddingBottom: '40px' }}>
          <div className="hero-content" style={{ width: '100%', maxWidth: '980px' }}>
            <SimulationExpeditionDeck />
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: CRASH SITE & Z-01 INTRO (Phase 3)
            ========================================================================= */}
        <section id="crash-site" className="sec" style={{ borderTop: '1px solid var(--line-soft)' }}>
          <div className="hero-content" style={{ width: '100%', maxWidth: '820px' }}>
            <CrashSiteInteractive />
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: PLANETARY EXPLORATION (Phase 4)
            ========================================================================= */}
        <section id="exploration" className="sec" style={{ borderTop: '1px solid var(--line-soft)' }}>
          <div className="hero-content" style={{ width: '100%', maxWidth: '980px' }}>
            <PlanetaryScan />
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: OXYGEN EMERGENCY & RESUPPLY (Phase 5)
            ========================================================================= */}
        <section id="emergency" className="sec" style={{ borderTop: '1px solid var(--line-soft)' }}>
          <div className="hero-content" style={{ width: '100%', maxWidth: '980px' }}>
            <LifeSupportEmergency />
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: COMMAND CENTER (Phase 6)
            ========================================================================= */}
        <section id="command" className="sec" style={{ borderTop: '1px solid var(--line-soft)', paddingBottom: '160px' }}>
          <div className="hero-content" style={{ width: '100%', maxWidth: '980px' }}>
            <ColonyCommandCenter />
          </div>
        </section>
      </main>
    </>
  );
}

import { Link } from '../router';
import {
  ShieldAlert,
  Compass,
  Rocket,
  ArrowRight,
  Radio,
  Activity,
  Globe2,
  Users
} from 'lucide-react';
import { Vignette } from '../components/effects/Vignette';
import { Grain } from '../components/effects/Grain';

export function HomePage() {
  const experiences = [
    {
      id: 'habitat',
      title: 'PLANET HABITABILITY MANAGEMENT',
      badge: 'SYSTEM 01 // SURVIVAL & COLONY SIMULATION',
      description:
        'Manage oxygen, water, power, resources, infrastructure, environmental hazards, and colony survival following the Arcadia-9 crash.',
      buttonText: 'ENTER HABITAT',
      destination: '/habitat',
      icon: ShieldAlert,
      accentColor: 'var(--amber)',
      tagColor: 'rgba(245, 158, 11, 0.15)',
      highlights: ['O₂ & Power Life Support', 'Z-01 Mascot Link', '5 Modular Installations', 'Dynamic Hazards']
    },
    {
      id: 'navigation',
      title: 'PLANETARY NAVIGATION',
      badge: 'SYSTEM 02 // CARTOGRAPHY & EXPEDITION RADAR',
      description:
        'Explore the planet, search coordinates, plot routes, discover unknown regions, and dispatch robotic expeditions across Proxima-Zero.',
      buttonText: 'EXPLORE PLANET',
      destination: '/navigation',
      icon: Compass,
      accentColor: 'var(--cyan)',
      tagColor: 'rgba(0, 229, 255, 0.15)',
      highlights: ['Interactive 3D / 2D Globe', 'Great-Circle Route Plotter', 'Topographic Contours', 'Direct Transit Booking']
    },
    {
      id: 'transit',
      title: 'ZERO TRANSIT',
      badge: 'SYSTEM 03 // PASSENGER SHUTTLE NETWORK',
      description:
        'Book a passenger shuttle, compare travel options, choose destinations, and track your journey across Proxima-Zero with real telemetry.',
      buttonText: 'BOOK A SHUTTLE',
      destination: '/transit',
      icon: Rocket,
      accentColor: '#38bdf8',
      tagColor: 'rgba(56, 189, 248, 0.15)',
      highlights: ['3 Shuttle Vehicle Classes', 'Live Telemetry Tracking', 'Supabase Persistent Rides', 'Fictional Fare Engine']
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--void)', overflowX: 'hidden' }}>
      {/* Screen post-processing layers */}
      <Vignette />
      <Grain />

      {/* Atmospheric Star Background & Planet Glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at 50% 18%, rgba(14, 28, 48, 0.85) 0%, rgba(6, 12, 20, 0.95) 45%, var(--void) 85%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Hero Planet Silhouette Arch */}
      <div
        style={{
          position: 'absolute',
          top: '-320px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '940px',
          height: '940px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(146, 61, 45, 0.35) 0%, rgba(0, 229, 255, 0.08) 50%, transparent 70%)',
          boxShadow: '0 0 160px rgba(0, 229, 255, 0.12), inset 0 0 80px rgba(224, 83, 60, 0.25)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Header Bar */}
      <header
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px var(--pad)',
          borderBottom: '1px solid var(--line-soft)',
          backdropFilter: 'blur(12px)',
          background: 'rgba(2, 5, 9, 0.65)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="nav-logo-box">
            <Radio size={18} />
          </div>
          <div>
            <div className="nav-brand-title">SETTLEMENT ZERO</div>
            <div className="nav-brand-sub">PLATFORM PORTAL // PROXIMA-ZERO</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid var(--line-cyan)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--cyan)',
              letterSpacing: '0.15em'
            }}
          >
            <span className="badge-dot" style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} />
            <span>3 SYSTEMS ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(40px, 8vh, 80px) var(--pad) 120px'
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 9vh, 80px)' }}>
          <div
            className="eyebrow"
            style={{
              justifyContent: 'center',
              marginBottom: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span className="pulse-dot" />
            <span>PROXIMA-ZERO COLONIZATION NETWORK</span>
          </div>

          <h1
            className="title-display"
            style={{
              fontSize: 'clamp(32px, 5.2vw, 68px)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--bone)',
              margin: '0 auto 18px',
              maxWidth: '22ch'
            }}
          >
            ONE PLANET. THREE SYSTEMS. HUMANITY'S NEXT CHAPTER.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(15px, 1.4vw, 18px)',
              lineHeight: 1.7,
              color: 'var(--bone-dim)',
              maxWidth: '64ch',
              margin: '0 auto 28px'
            }}
          >
            Explore the planet, establish humanity's first settlement, and travel between distant outposts.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 18px',
              background: 'rgba(12, 18, 28, 0.7)',
              border: '1px solid var(--line)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.22em',
              color: 'var(--cyan)'
            }}
          >
            <span>SELECT YOUR DESTINATION</span>
          </div>
        </div>

        {/* Three Distinct Destination Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'stretch'
          }}
        >
          {experiences.map((exp) => {
            const Icon = exp.icon;
            return (
              <Link
                key={exp.id}
                to={exp.destination}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  background: 'rgba(12, 17, 26, 0.82)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '32px 28px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s var(--ease-out), border-color 0.3s, box-shadow 0.3s',
                  cursor: 'pointer'
                }}
                className="destination-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = exp.accentColor;
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.8), 0 0 30px ${exp.tagColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top Glowing Indicator Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '36px',
                    height: '3px',
                    background: exp.accentColor
                  }}
                />

                {/* Badge & Icon Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '6px',
                      background: exp.tagColor,
                      border: `1px solid ${exp.accentColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: exp.accentColor
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      color: 'var(--muted)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {exp.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--bone)',
                    margin: '0 0 14px'
                  }}
                >
                  {exp.title}
                </h2>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'var(--bone-dim)',
                    margin: '0 0 24px',
                    flexGrow: 1
                  }}
                >
                  {exp.description}
                </p>

                {/* Highlights List */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    marginBottom: '28px',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    border: '1px solid var(--line-soft)'
                  }}
                >
                  {exp.highlights.map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--bone-dim)',
                        letterSpacing: '0.06em'
                      }}
                    >
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: exp.accentColor }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: exp.tagColor,
                    border: `1px solid ${exp.accentColor}`,
                    borderRadius: '4px',
                    color: 'var(--bone)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    transition: 'background 0.2s'
                  }}
                >
                  <span>{exp.buttonText}</span>
                  <ArrowRight size={15} color={exp.accentColor} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Global Network Telemetry Bar */}
        <div
          style={{
            marginTop: 'clamp(48px, 9vh, 80px)',
            background: 'rgba(10, 14, 22, 0.7)',
            border: '1px solid var(--line-soft)',
            borderRadius: '6px',
            padding: '24px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Globe2 size={22} color="var(--cyan)" />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
                EXOPLANET PROFILE
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--bone)', fontWeight: 600 }}>
                Proxima-Zero (0.84G // -32°C)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Users size={22} color="#10b981" />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
                SURVIVORS ACCOUNTED
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: '#10b981', fontWeight: 600 }}>
                42 Cryo-Colonists Viable
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Activity size={22} color="var(--amber)" />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
                COLONY LOGS
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--amber)', fontWeight: 600 }}>
                Sector 9 Grid Active
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import type { MascotMood } from '../../store/useSettlementStore';

interface Z01ArtworkProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  isFloating?: boolean;
}

export function Z01Artwork({
  mood = 'curious',
  size = 140,
  className = '',
  isFloating = true,
}: Z01ArtworkProps) {
  // Determine eye and energy color based on mood
  const isEmergency = mood === 'emergency' || mood === 'concerned';
  const primaryGlow = isEmergency ? '#f97316' : '#00e5ff';
  const irisColor = isEmergency ? '#ea580c' : '#0284c7';
  const pupilGlow = isEmergency ? '#ffedd5' : '#e0f2fe';

  return (
    <div
      className={`z01-root ${isFloating ? 'z01-floating' : ''} ${className}`}
      style={{
        width: size,
        height: size * 1.15,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        filter: `drop-shadow(0 12px 24px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 16px ${primaryGlow}33)`,
      }}
      aria-label={`Z-01 Exploration Companion in ${mood} state`}
    >
      <svg
        viewBox="0 0 200 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          {/* Gradients for Pearlescent Composite Head & Body */}
          <radialGradient id="headShade" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e2e8f0" />
            <stop offset="85%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>

          <radialGradient id="facePlate" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>

          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={pupilGlow} />
            <stop offset="40%" stopColor={primaryGlow} />
            <stop offset="85%" stopColor={irisColor} />
            <stop offset="100%" stopColor="#0284c700" />
          </radialGradient>

          <radialGradient id="reactorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor={primaryGlow} />
            <stop offset="75%" stopColor={irisColor} />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          <linearGradient id="thrusterPlume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryGlow} />
            <stop offset="50%" stopColor="#0284c7aa" />
            <stop offset="100%" stopColor="#0284c700" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ==============================================================
            1. UNDERSIDE PROPULSION / THRUSTER PLUMES (FLOAT MODE)
            ============================================================== */}
        <g className="z01-thrusters">
          {/* Center Thruster */}
          <polygon
            points="95,198 105,198 100,224"
            fill="url(#thrusterPlume)"
            opacity="0.85"
            className="thruster-flicker"
          />
          {/* Left Thruster */}
          <polygon
            points="76,194 84,194 78,216"
            fill="url(#thrusterPlume)"
            opacity="0.7"
            className="thruster-flicker"
            style={{ animationDelay: '0.15s' }}
          />
          {/* Right Thruster */}
          <polygon
            points="116,194 124,194 122,216"
            fill="url(#thrusterPlume)"
            opacity="0.7"
            className="thruster-flicker"
            style={{ animationDelay: '0.3s' }}
          />
        </g>

        {/* ==============================================================
            2. TORSO & ARTICULATED SIDE FINS
            ============================================================== */}
        <g id="torso">
          {/* Dark Neck Ring Collar */}
          <ellipse cx="100" cy="148" rx="34" ry="12" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

          {/* Main Torso Pod */}
          <path
            d="M 72 152 C 68 185, 78 200, 100 200 C 122 200, 132 185, 128 152 Z"
            fill="url(#headShade)"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Torso graphite panel seam */}
          <path
            d="M 80 160 C 80 185, 90 194, 100 194 C 110 194, 120 185, 120 160"
            fill="none"
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />

          {/* Chest Reactor Core Housing */}
          <circle cx="100" cy="174" r="14" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <circle
            cx="100"
            cy="174"
            r="10"
            fill="url(#reactorGlow)"
            filter="url(#glowFilter)"
            className="reactor-pulse"
          />
          <circle cx="100" cy="174" r="5" fill="#ffffff" opacity="0.9" />

          {/* Left Side Fin / Arm */}
          <g
            className="z01-arm-left"
            style={{
              transformOrigin: '68px 156px',
              animation: mood === 'excited' ? 'arm-wave 1.2s ease-in-out infinite' : 'none',
            }}
          >
            {/* Shoulder socket */}
            <circle cx="68" cy="158" r="9" fill="#1e293b" />
            <path
              d="M 66 156 C 50 168, 52 186, 62 190 C 68 192, 74 182, 72 168 Z"
              fill="url(#headShade)"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            {/* Glowing ring on left arm joint */}
            <circle cx="60" cy="176" r="4.5" fill="#0f172a" stroke={primaryGlow} strokeWidth="1.5" />
            <circle cx="60" cy="176" r="2" fill={primaryGlow} />
          </g>

          {/* Right Side Fin / Arm */}
          <g
            className="z01-arm-right"
            style={{
              transformOrigin: '132px 156px',
              animation: mood === 'happy' ? 'arm-wave 1.4s ease-in-out infinite' : 'none',
            }}
          >
            {/* Shoulder socket */}
            <circle cx="132" cy="158" r="9" fill="#1e293b" />
            <path
              d="M 134 156 C 150 168, 148 186, 138 190 C 132 192, 126 182, 128 168 Z"
              fill="url(#headShade)"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            {/* Glowing ring on right arm joint */}
            <circle cx="140" cy="176" r="4.5" fill="#0f172a" stroke={primaryGlow} strokeWidth="1.5" />
            <circle cx="140" cy="176" r="2" fill={primaryGlow} />
          </g>
        </g>

        {/* ==============================================================
            3. DUAL SEGMENTED ANTENNAE WITH GLOWING ORB TIPS
            ============================================================== */}
        <g id="antennae">
          {/* Left Antenna */}
          <g
            className="z01-antenna-left"
            style={{
              transformOrigin: '65px 45px',
              animation:
                mood === 'curious'
                  ? 'antenna-tilt-left 2s ease-in-out infinite'
                  : 'antenna-sway 4s ease-in-out infinite',
            }}
          >
            {/* Base collar */}
            <ellipse cx="65" cy="46" rx="6" ry="3.5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Segmented Stalk */}
            <path d="M 64 45 L 42 16" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 64 45 L 42 16" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="53" cy="30" r="2.5" fill="#0f172a" />
            {/* Glowing Tip Orb */}
            <circle cx="41" cy="14" r="7.5" fill={primaryGlow} filter="url(#glowFilter)" />
            <circle cx="40" cy="13" r="3" fill="#ffffff" />
          </g>

          {/* Right Antenna */}
          <g
            className="z01-antenna-right"
            style={{
              transformOrigin: '135px 45px',
              animation:
                mood === 'curious'
                  ? 'antenna-tilt-right 2s ease-in-out infinite'
                  : 'antenna-sway 4s ease-in-out infinite 0.4s',
            }}
          >
            {/* Base collar */}
            <ellipse cx="135" cy="46" rx="6" ry="3.5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Segmented Stalk */}
            <path d="M 136 45 L 158 16" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 136 45 L 158 16" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="147" cy="30" r="2.5" fill="#0f172a" />
            {/* Glowing Tip Orb */}
            <circle cx="159" cy="14" r="7.5" fill={primaryGlow} filter="url(#glowFilter)" />
            <circle cx="158" cy="13" r="3" fill="#ffffff" />
          </g>
        </g>

        {/* ==============================================================
            4. SPHERICAL HEAD CASING & COMPOSITE SEAMS
            ============================================================== */}
        <g id="head">
          {/* Main Spherical Head Contour */}
          <circle
            cx="100"
            cy="90"
            r="60"
            fill="url(#headShade)"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* Dark Rear Cowl / Helmet Rim Accent */}
          <path
            d="M 44 80 C 44 50, 70 32, 100 32 C 130 32, 156 50, 156 80 C 145 54, 125 44, 100 44 C 75 44, 55 54, 44 80 Z"
            fill="#1e293b"
            opacity="0.8"
          />

          {/* Graphite Panel Seam Lines */}
          <path
            d="M 44 90 C 65 92, 135 92, 156 90"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.2"
            opacity="0.5"
          />
          <path
            d="M 100 32 L 100 48"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* ==============================================================
              5. VISOR FACEPLATE & GLOWING EXPRESSIVE EYES
              ============================================================== */}
          {/* Dark Visor Cavity */}
          <ellipse
            cx="100"
            cy="95"
            rx="46"
            ry="38"
            fill="url(#facePlate)"
            stroke="#334155"
            strokeWidth="1.8"
          />

          {/* Ambient Inner Glass Specular Sweep */}
          <path
            d="M 64 74 C 75 66, 125 66, 136 74 C 120 70, 80 70, 64 74 Z"
            fill="#ffffff"
            opacity="0.18"
          />

          {/* ==================== LEFT EYE ==================== */}
          <g id="left-eye" className="z01-eye">
            {/* Eye Outer Glow / Sclera */}
            <ellipse
              cx="78"
              cy="95"
              rx={mood === 'surprised' ? 17 : mood === 'curious' ? 16 : 14.5}
              ry={mood === 'happy' ? 10 : mood === 'concerned' ? 12 : 15}
              fill="url(#eyeGlow)"
              filter="url(#glowFilter)"
            />
            {/* Pupil Center */}
            <circle
              cx="79"
              cy="94"
              r={mood === 'surprised' ? 6 : 4.5}
              fill="#ffffff"
            />
            {/* Primary Specular Highlight */}
            <circle cx="75" cy="89" r="3.2" fill="#ffffff" opacity="0.9" />
            <circle cx="82" cy="98" r="1.5" fill="#ffffff" opacity="0.7" />

            {/* Eyelid Expression Modifiers */}
            {mood === 'happy' && (
              <path
                d="M 62 95 Q 78 112 94 95 Z"
                fill="#0f172a"
              />
            )}
            {mood === 'concerned' && (
              <path
                d="M 62 82 Q 78 92 94 86 Z"
                fill="#0f172a"
              />
            )}
          </g>

          {/* ==================== RIGHT EYE ==================== */}
          <g id="right-eye" className="z01-eye">
            {/* Eye Outer Glow / Sclera */}
            <ellipse
              cx="122"
              cy="95"
              rx={mood === 'surprised' ? 17 : mood === 'curious' ? 14 : 14.5}
              ry={mood === 'happy' ? 10 : mood === 'concerned' ? 12 : 15}
              fill="url(#eyeGlow)"
              filter="url(#glowFilter)"
            />
            {/* Pupil Center */}
            <circle
              cx="121"
              cy="94"
              r={mood === 'surprised' ? 6 : 4.5}
              fill="#ffffff"
            />
            {/* Primary Specular Highlight */}
            <circle cx="118" cy="89" r="3.2" fill="#ffffff" opacity="0.9" />
            <circle cx="125" cy="98" r="1.5" fill="#ffffff" opacity="0.7" />

            {/* Eyelid Expression Modifiers */}
            {mood === 'happy' && (
              <path
                d="M 106 95 Q 122 112 138 95 Z"
                fill="#0f172a"
              />
            )}
            {mood === 'concerned' && (
              <path
                d="M 106 86 Q 122 92 138 82 Z"
                fill="#0f172a"
              />
            )}
          </g>

          {/* Mouth / Smile Line */}
          {mood === 'happy' || mood === 'excited' ? (
            <path
              d="M 94 118 Q 100 124 106 118"
              stroke={primaryGlow}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              filter="url(#glowFilter)"
            />
          ) : mood === 'concerned' || mood === 'emergency' ? (
            <path
              d="M 94 121 Q 100 117 106 121"
              stroke={primaryGlow}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M 95 119 Q 100 121 105 119"
              stroke="#64748b"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Expression Cues (Curious ?, Surprised !!, Emergency Alert !) */}
          {mood === 'curious' && (
            <text
              x="146"
              y="60"
              fill={primaryGlow}
              fontSize="18"
              fontWeight="bold"
              fontFamily="var(--font-mono)"
              className="z01-cue"
            >
              ?
            </text>
          )}

          {mood === 'surprised' && (
            <text
              x="146"
              y="60"
              fill={primaryGlow}
              fontSize="16"
              fontWeight="bold"
              fontFamily="var(--font-mono)"
              className="z01-cue"
            >
              !!
            </text>
          )}

          {isEmergency && (
            <g transform="translate(142, 42)">
              <polygon points="10,0 20,18 0,18" fill="#ef4444" />
              <rect x="9" y="5" width="2" height="7" fill="#ffffff" />
              <circle cx="10" cy="15" r="1.2" fill="#ffffff" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

import { useEffect, useState } from 'react';

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [statusText, setStatusText] = useState('CALIBRATING ORBITAL SENSORS...');

  useEffect(() => {
    const steps = [
      { at: 20, text: 'SCANNING PLANETARY HORIZON...' },
      { at: 50, text: 'CONTACTING Z-01 EXPLORATION DRONE...' },
      { at: 80, text: 'ACQUIRING HABITAT TELEMETRY...' },
      { at: 100, text: 'SURVIVAL PROTOCOLS INITIALIZED' },
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setDone(true), 400);
          return 100;
        }
        const next = prev + 5;
        const currentStep = steps.find((s) => s.at === next);
        if (currentStep) {
          setStatusText(currentStep.text);
        }
        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, []);

  if (done) return null;

  return (
    <div className={`preloader-screen ${progress === 100 ? 'done' : ''}`}>
      <div className="preloader-box">
        {/* Animated Reticle */}
        <div className="preloader-reticle">
          <div className="reticle-ping" />
          <div className="reticle-ring" />
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--cyan)',
              boxShadow: '0 0 10px var(--cyan)',
            }}
          />
        </div>

        {/* Brand */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: 'var(--bone)',
            marginBottom: '4px',
          }}
        >
          SETTLEMENT ZERO
        </h1>
        <p
          className="mono-tag"
          style={{
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '28px',
          }}
        >
          HUMANITY OUTPOST INITIALIZATION
        </p>

        {/* Progress track */}
        <div className="preloader-track">
          <div className="preloader-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Metadata */}
        <div className="preloader-meta">
          <span style={{ color: 'var(--cyan)' }}>{statusText}</span>
          <span style={{ color: 'var(--bone)', fontWeight: 600 }}>{progress}%</span>
        </div>
      </div>
    </div>
  );
}

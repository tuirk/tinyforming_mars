'use client';

/**
 * Decorative space backdrop for the landing page.
 * Kept low-contrast + vignetted so hero copy and the auth card stay readable.
 */

const STARS: { left: string; top: string; size: number; opacity: number; delay?: string }[] = [
  { left: '4%', top: '8%', size: 2, opacity: 0.35 },
  { left: '12%', top: '22%', size: 1, opacity: 0.25 },
  { left: '18%', top: '6%', size: 2, opacity: 0.2, delay: '1.2s' },
  { left: '28%', top: '38%', size: 1, opacity: 0.3 },
  { left: '8%', top: '55%', size: 2, opacity: 0.18, delay: '2.1s' },
  { left: '22%', top: '72%', size: 1, opacity: 0.28 },
  { left: '35%', top: '14%', size: 2, opacity: 0.22 },
  { left: '42%', top: '48%', size: 1, opacity: 0.15 },
  { left: '48%', top: '8%', size: 1, opacity: 0.32, delay: '0.6s' },
  { left: '55%', top: '28%', size: 2, opacity: 0.12 },
  { left: '62%', top: '18%', size: 1, opacity: 0.25 },
  { left: '70%', top: '42%', size: 1, opacity: 0.18, delay: '1.8s' },
  { left: '78%', top: '12%', size: 2, opacity: 0.2 },
  { left: '85%', top: '35%', size: 1, opacity: 0.28 },
  { left: '92%', top: '22%', size: 2, opacity: 0.15, delay: '2.8s' },
  { left: '6%', top: '88%', size: 1, opacity: 0.2 },
  { left: '16%', top: '92%', size: 2, opacity: 0.14 },
  { left: '38%', top: '85%', size: 1, opacity: 0.22, delay: '0.9s' },
  { left: '58%', top: '78%', size: 1, opacity: 0.16 },
  { left: '74%', top: '88%', size: 2, opacity: 0.12 },
  { left: '88%', top: '70%', size: 1, opacity: 0.2 },
  { left: '95%', top: '55%', size: 1, opacity: 0.18 },
  { left: '32%', top: '58%', size: 1, opacity: 0.14 },
  { left: '45%', top: '65%', size: 2, opacity: 0.1, delay: '1.5s' },
];

/** Soft pixel-ish crater marks on Mars (percent of planet box). */
const CRATERS: { left: string; top: string; size: number; opacity: number }[] = [
  { left: '28%', top: '32%', size: 18, opacity: 0.22 },
  { left: '48%', top: '22%', size: 10, opacity: 0.18 },
  { left: '38%', top: '52%', size: 28, opacity: 0.15 },
  { left: '58%', top: '44%', size: 14, opacity: 0.2 },
  { left: '22%', top: '58%', size: 8, opacity: 0.16 },
  { left: '62%', top: '62%', size: 12, opacity: 0.14 },
];

export function LandingAtmosphere() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      <style>{`
        @keyframes landing-twinkle {
          0%, 100% { opacity: var(--star-o); }
          50% { opacity: calc(var(--star-o) * 0.35); }
        }
        @keyframes landing-drift {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(-6px); }
        }
      `}</style>

      {/* Deep space base wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 15% 40%, rgba(30,40,80,0.35) 0%, transparent 55%),' +
            'radial-gradient(ellipse 50% 40% at 70% 80%, rgba(80,30,20,0.2) 0%, transparent 50%),' +
            '#0d0d1a',
        }}
      />

      {/* Faint cyan nebula dust (left — behind copy, very soft) */}
      <div
        style={{
          position: 'absolute',
          left: '-10%',
          top: '10%',
          width: '55%',
          height: '70%',
          background:
            'radial-gradient(ellipse at 40% 50%, rgba(79,195,247,0.06) 0%, transparent 65%)',
        }}
      />

      {/* Mars + rings */}
      <div
        style={{
          position: 'absolute',
          right: '-140px',
          top: '50%',
          width: '720px',
          height: '720px',
          animation: 'landing-drift 28s ease-in-out infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-90px',
            borderRadius: '50%',
            border: '1px solid rgba(107,45,24,0.35)',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '-45px',
            borderRadius: '50%',
            border: '1px solid rgba(139,61,34,0.4)',
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 38% 36%, #D4784A 0%, #C4623A 22%, #8B3D22 55%, #3A1808 100%)',
            boxShadow: 'inset -40px -20px 60px rgba(0,0,0,0.45), 0 0 80px rgba(196,98,58,0.12)',
            overflow: 'hidden',
          }}
        >
          {CRATERS.map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c.left,
                top: c.top,
                width: c.size,
                height: c.size,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, transparent 40%, rgba(58,24,8,${c.opacity}) 100%)`,
              }}
            />
          ))}
          {/* Terminator shade */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'linear-gradient(105deg, transparent 35%, rgba(13,13,26,0.35) 70%, rgba(13,13,26,0.55) 100%)',
            }}
          />
        </div>
      </div>

      {/* Starfield */}
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: s.size <= 1 ? 0 : '50%',
            background: '#e8e8f0',
            // pixel flecks for tiny stars
            boxShadow: s.size <= 1 ? 'none' : undefined,
            ['--star-o' as string]: s.opacity,
            opacity: s.opacity,
            animation: 'landing-twinkle 4.5s ease-in-out infinite',
            animationDelay: s.delay ?? '0s',
          }}
        />
      ))}

      {/* Readability scrims — keep left copy + center clear of Mars glare */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, #0d0d1a 0%, rgba(13,13,26,0.92) 28%, rgba(13,13,26,0.55) 48%, rgba(13,13,26,0.25) 68%, transparent 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(13,13,26,0.55) 0%, transparent 18%, transparent 82%, rgba(13,13,26,0.75) 100%)',
        }}
      />
    </div>
  );
}

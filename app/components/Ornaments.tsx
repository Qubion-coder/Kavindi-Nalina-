// Hand-drawn SVG decorations used across the invitation.

export function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 24" fill="none" aria-hidden>
      <path d="M4 12h86" stroke="currentColor" strokeWidth="1" />
      <path d="M150 12h86" stroke="currentColor" strokeWidth="1" />
      <path
        d="M90 12c8-9 18-9 22 0-4 9-14 9-22 0Zm60 0c-8-9-18-9-22 0 4 9 14 9 22 0Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect x="115.5" y="7.5" width="9" height="9" transform="rotate(45 120 12)" fill="currentColor" />
    </svg>
  );
}

export function Laurel({ className = "" }: { className?: string }) {
  // Leaves follow the left arc of a circle (mirrored for the right side)
  const angles = Array.from({ length: 9 }, (_, i) => 100 + i * 17);
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden>
      {[1, -1].map((side) => (
        <g key={side} transform={side === -1 ? "translate(120 0) scale(-1 1)" : undefined}>
          <path d="M56 106A46 46 0 0 1 22 30" stroke="currentColor" strokeWidth="1.2" />
          {angles.map((a) => {
            const r = (a * Math.PI) / 180;
            const x = 60 + 46 * Math.cos(r);
            const y = 60 + 46 * Math.sin(r);
            return (
              <ellipse
                key={a}
                cx={x}
                cy={y}
                rx="2.6"
                ry="6"
                transform={`rotate(${a + 60} ${x} ${y})`}
                fill="currentColor"
                opacity="0.8"
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

export function WaxSeal({ initials }: { initials: string }) {
  return (
    <div className="seal">
      <svg viewBox="0 0 200 200" className="seal-shape" aria-hidden>
        <defs>
          <radialGradient id="sealFill" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="55%" stopColor="#efe4cf" />
            <stop offset="100%" stopColor="#cdbd9e" />
          </radialGradient>
          <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#5b6b6e" floodOpacity="0.35" />
          </filter>
        </defs>
        {/* irregular wax blob */}
        <path
          filter="url(#sealShadow)"
          fill="url(#sealFill)"
          d="M100 8c14 0 18 10 30 13s22-4 30 6 1 20 8 30 18 13 16 27-13 15-14 28 9 22 0 32-21 4-31 11-12 22-27 23-19-12-32-14-26 7-34-4-1-22-8-32-21-12-20-27 13-15 13-28-10-21-1-31 21-3 31-10 13-21 29-22c4-1 7-1 10 2Z"
        />
        <circle cx="100" cy="100" r="62" fill="none" stroke="#c9b897" strokeWidth="2" />
        <circle cx="100" cy="100" r="56" fill="none" stroke="#fffaf0" strokeWidth="1.2" opacity="0.8" />
      </svg>
      <Laurel className="seal-laurel" />
      <span className="seal-initials">{initials}</span>
    </div>
  );
}

// Watercolour-ish floral sprig for the page frame corners.
export function CornerSprig({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden>
      <path d="M4 196C20 120 70 60 196 6" stroke="#8fa9ae" strokeWidth="2" opacity="0.7" />
      <path d="M30 150C50 140 70 145 80 160" stroke="#8fa9ae" strokeWidth="1.5" opacity="0.6" />
      <path d="M70 90C90 85 110 92 118 108" stroke="#8fa9ae" strokeWidth="1.5" opacity="0.6" />
      {[
        [26, 160, 20, "#b7cdd1"],
        [52, 118, 16, "#c9d9db"],
        [86, 82, 18, "#b7cdd1"],
        [124, 50, 14, "#d5e2e3"],
        [160, 26, 12, "#c9d9db"],
        [84, 156, 12, "#e8d7c8"],
        [118, 108, 11, "#e8d7c8"],
      ].map(([cx, cy, r, c], i) => (
        <g key={i} opacity="0.85">
          <ellipse cx={cx as number} cy={cy as number} rx={r as number} ry={(r as number) * 0.45}
            transform={`rotate(-38 ${cx} ${cy})`} fill={c as string} />
          <ellipse cx={cx as number} cy={cy as number} rx={(r as number) * 0.45} ry={(r as number) * 0.18}
            transform={`rotate(-38 ${cx} ${cy})`} fill="#fff" opacity="0.5" />
        </g>
      ))}
      {[
        [40, 178, "#e9c9c3"],
        [100, 132, "#f1ddd2"],
        [140, 74, "#e9c9c3"],
      ].map(([cx, cy, c], i) => (
        <g key={`f${i}`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={cx as number} cy={(cy as number) - 6} rx="4" ry="7" fill={c as string}
              transform={`rotate(${a} ${cx} ${cy})`} opacity="0.9" />
          ))}
          <circle cx={cx as number} cy={cy as number} r="3" fill="#d9b77a" />
        </g>
      ))}
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2L4 20Z" />
    </svg>
  );
}

"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Pinyon_Script, Playball, Poppins } from "next/font/google";
import { invite, intlPhone } from "../invite";
import { ivory } from "./ivory";
import { Flourish, PinIcon } from "../components/Ornaments";
import "./ivory.css";

type Stage = "sealed" | "breaking" | "open";

// Overrides the site-wide --font-script (Great Vibes) for this layout only
const cursive = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--font-script" });

// Rounder script used for the bride and groom cards
const playball = Playball({ weight: "400", subsets: ["latin"] });

// Clean sans-serif for the order-of-the-day timeline
const sans = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"] });

// Background song lives at public/bg.mp3; NEXT_PUBLIC_MUSIC_SRC in .env.local can override it
const musicSrc = encodeURI(process.env.NEXT_PUBLIC_MUSIC_SRC || "/bg.mp3");

const monogram = `${invite.bride[0]}&${invite.groom[0]}`;

export default function IvorySeal() {
  const [stage, setStage] = useState<Stage>("sealed");
  const [videoFailed, setVideoFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasMusic, setHasMusic] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Music is on by default; this flips to false only when the guest turns it off
  const musicWanted = useRef(true);

  // Opening the invitation is a tap, so browsers allow the music to start here
  const startMusic = () => {
    audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
  };

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      musicWanted.current = true;
      startMusic();
    } else {
      musicWanted.current = false;
      a.pause();
      setPlaying(false);
    }
  };

  // If the browser blocked the first play, start on the guest's next tap anywhere
  useEffect(() => {
    if (stage !== "open" || playing || !hasMusic) return;
    const retry = () => musicWanted.current && startMusic();
    window.addEventListener("pointerdown", retry, { once: true });
    return () => window.removeEventListener("pointerdown", retry);
  }, [stage, playing, hasMusic]);

  // CSS seal fallback, used only if the intro video can't play
  const breakSeal = () => {
    if (stage !== "sealed") return;
    setStage("breaking");
    startMusic();
    setTimeout(() => setStage("open"), 1600);
  };

  useEffect(() => {
    document.body.style.overflow = stage === "open" ? "" : "hidden";
  }, [stage]);

  return (
    <div className={`iv ${cursive.variable}`}>
      {/* Background song: public/music.mp3, or a local-only file set in .env.local */}
      <audio ref={audioRef} src={musicSrc} loop preload="auto" onCanPlay={() => setHasMusic(true)} />

      {stage !== "open" &&
        (videoFailed ? (
          <Gate breaking={stage === "breaking"} onBreak={breakSeal} />
        ) : (
          <IntroVideo
            playing={stage === "breaking"}
            onStart={() => {
              setStage("breaking");
              startMusic();
            }}
            onEnd={() => setStage("open")}
            onError={() => setVideoFailed(true)}
          />
        ))}

      {/* Floral image fixed behind every section below the hero */}
      <div className="iv-bg-image" aria-hidden />

      <Nav />
      <main className={`iv-main ${stage !== "sealed" ? "is-visible" : ""}`}>
        <Hero />
        <Hosts />
        <Countdown />
        <Celebration />
        <Venue />
        <Rsvp />
        <Wishes />
        <Footer />
      </main>

      {stage === "open" && hasMusic && (
        <button
          className={`iv-music ${playing ? "is-playing" : ""}`}
          onClick={toggleMusic}
          aria-label={playing ? "Pause music" : "Play music"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
            <path d="M9 18V5l11-2v13" />
            <circle cx="6.5" cy="18" r="2.5" />
            <circle cx="17.5" cy="16" r="2.5" />
            {!playing && <path d="M3 3l18 18" />}
          </svg>
        </button>
      )}
    </div>
  );
}

function IntroVideo({
  playing,
  onStart,
  onEnd,
  onError,
}: {
  playing: boolean;
  onStart: () => void;
  onEnd: () => void;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ending, setEnding] = useState(false);

  const start = () => {
    const v = videoRef.current;
    if (!v || playing) return;
    onStart();
    v.muted = false;
    v.play().catch(() => {
      // Sound blocked: retry muted, otherwise skip straight to the card
      v.muted = true;
      v.play().catch(onEnd);
    });
  };

  // Fade out just before the last frame so the page appears underneath
  const onTime = () => {
    const v = videoRef.current;
    if (v && v.duration && v.duration - v.currentTime < 0.8) setEnding(true);
  };

  return (
    <div
      className={`iv-intro ${ending ? "is-ending" : ""}`}
      onClick={start}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && start()}
      aria-label="Open the invitation"
    >
      <video
        ref={videoRef}
        className="iv-intro-video"
        src="/ivory-glow-envelope.mp4"
        poster="/ivory-glow-envelope-poster.jpg"
        playsInline
        preload="auto"
        onTimeUpdate={onTime}
        onEnded={onEnd}
        onError={onError}
      />
      {!playing && (
        <div className="iv-intro-overlay">
          <p className="caps iv-gate-label">Open Invitation</p>
          <p className="serif-italic iv-gate-tap">Tap to break the seal</p>
        </div>
      )}
      {playing && (
        <button
          className="iv-intro-skip caps"
          onClick={(e) => {
            e.stopPropagation();
            onEnd();
          }}
        >
          Skip
        </button>
      )}
    </div>
  );
}

function Gate({ breaking, onBreak }: { breaking: boolean; onBreak: () => void }) {
  return (
    <div
      className={`iv-gate ${breaking ? "is-breaking" : ""}`}
      onClick={onBreak}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onBreak()}
      aria-label="Open the invitation"
    >
      <div className="iv-gate-half iv-gate-top" />
      <div className="iv-gate-half iv-gate-bottom" />
      <div className="iv-gate-center">
        <p className="caps iv-gate-label">Open Invitation</p>
        <div className="iv-seal">
          <span className="iv-seal-piece iv-seal-left">
            <SealDisc />
          </span>
          <span className="iv-seal-piece iv-seal-right">
            <SealDisc />
          </span>
        </div>
        <p className="serif-italic iv-gate-tap">Tap to break the seal</p>
      </div>
    </div>
  );
}

// Ivory wax seal with a ridged rim and embossed monogram
function SealDisc() {
  const ridges = Array.from({ length: 28 }, (_, i) => (i * 360) / 28);
  return (
    <svg viewBox="0 0 200 200" aria-hidden>
      <defs>
        <radialGradient id="ivWax" cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="50%" stopColor="#efe5d0" />
          <stop offset="100%" stopColor="#c9b892" />
        </radialGradient>
      </defs>
      <g fill="url(#ivWax)">
        {ridges.map((a) => (
          <circle key={a} cx={100 + 82 * Math.cos((a * Math.PI) / 180)} cy={100 + 82 * Math.sin((a * Math.PI) / 180)} r="14" />
        ))}
        <circle cx="100" cy="100" r="84" />
      </g>
      <circle cx="100" cy="100" r="62" fill="none" stroke="#b49a6a" strokeWidth="1.5" opacity="0.7" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />
      <text x="100" y="116" textAnchor="middle" className="iv-seal-text">
        {monogram}
      </text>
    </svg>
  );
}

const links = [
  ["home", "Home"],
  ["details", "Details"],
  ["rsvp", "RSVP"],
  ["wishes", "Wishes"],
  ["location", "Location"],
] as const;

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="iv-nav">
      <a href="#home" className="script iv-nav-mono">
        {monogram}
      </a>
      <button className="iv-nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
        <span />
        <span />
        <span />
      </button>
      <ul className={open ? "is-open" : ""}>
        {links.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className="caps" onClick={() => setOpen(false)}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <Reveal>
      <div className="iv-heading">
        <h2 className="script">{title}</h2>
        {sub && <p className="serif-italic">{sub}</p>}
        <p className="iv-stars" aria-hidden>
          ✦ ✦ ✦
        </p>
      </div>
    </Reveal>
  );
}

// Full-screen video backdrop with just the names, a tagline and the date
function Hero() {
  const d = invite.dateDisplay;
  return (
    <section id="home" className="iv-hero">
      <div className="iv-hero-frame">
        <video
          className="iv-hero-video"
          src="/coastal-sunset-sail-theme.mp4"
          poster="/coastal-sunset-sail-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
        <div className="iv-hero-text">
          <p className="caps iv-hero-tag">We&apos;re getting married</p>
          <h1 className="script iv-hero-names">
            {invite.bride} &amp; {invite.groom}
          </h1>
          <span className="iv-hero-divider" aria-hidden>
            <span />
            <i />
            <span />
          </span>
          <p className="caps iv-hero-date">
            {d.day} · {d.month} · {d.year}
          </p>
        </div>
      </div>
    </section>
  );
}

// Bride and groom cards with their parents, joined by a round "&" badge
function Hosts() {
  const d = invite.dateDisplay;
  const people = [
    { role: "Beloved daughter of", parents: invite.brideParents, name: invite.bride },
    { role: "Beloved son of", parents: invite.groomParents, name: invite.groom },
  ];
  return (
    <section className="iv-section iv-hosts">
      <div className="iv-couple">
        {people.map((p, i) => (
          <Fragment key={p.name}>
            {i === 1 && (
              <div className="iv-couple-join" aria-hidden>
                <span className="iv-couple-line" />
                <span className={`iv-couple-amp ${playball.className}`}>&amp;</span>
                <span className="iv-couple-line" />
              </div>
            )}
            <Reveal delay={i * 200}>
              <div className={`iv-person ${i === 1 ? "is-groom" : ""}`}>
                <p className="iv-person-role">{p.role}</p>
                <span className="iv-person-rule" />
                <p className="caps iv-person-parents">{p.parents}</p>
                <h2 className={`iv-person-name ${playball.className}`}>{p.name}</h2>
              </div>
            </Reveal>
          </Fragment>
        ))}
      </div>
      <Reveal delay={300}>
        <p className="serif-italic iv-lede">
          {invite.invitationLine} to celebrate the marriage of their beloved children
        </p>
        <Flourish className="iv-flourish" />
        <p className="caps iv-date">
          {d.weekday} · {d.day} {d.month} {d.year}
        </p>
        <p className="serif-italic">
          {invite.timeDisplay} · {ivory.venue.hotel}, {ivory.venue.city}
        </p>
      </Reveal>
    </section>
  );
}

function Countdown() {
  const target = new Date(invite.dateISO).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - (now ?? target));
  const parts = [
    ["Days", Math.floor(diff / 864e5)],
    ["Hours", Math.floor(diff / 36e5) % 24],
    ["Minutes", Math.floor(diff / 6e4) % 60],
    ["Seconds", Math.floor(diff / 1e3) % 60],
  ] as const;

  return (
    <section className="iv-section iv-tinted iv-has-floral">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="iv-floral" src="/countdown-floral.webp" alt="" aria-hidden />
      <Heading
        title="Save the Date"
        sub={`We are getting married · ${invite.dateDisplay.day} ${invite.dateDisplay.month} ${invite.dateDisplay.year}`}
      />
      <Reveal delay={150}>
        <div className="iv-countdown">
          {parts.map(([label, v]) => (
            <div key={label} className="iv-cd-cell">
              <span className="iv-cd-num">{now === null ? "--" : String(v).padStart(2, "0")}</span>
              <span className="caps iv-cd-label">{label}</span>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={300}>
        <div className="iv-cal-btns">
          <a className="iv-btn iv-btn-solid" href={calendarUrl()} target="_blank" rel="noopener noreferrer">
            <CalendarIcon /> Google Calendar
          </a>
          <button type="button" className="iv-btn" onClick={downloadIcs}>
            <CalendarIcon /> Apple / Outlook
          </button>
        </div>
      </Reveal>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

// Google Calendar link covering the whole day
function calendarUrl() {
  const start = new Date(invite.dateISO);
  const end = new Date(ivory.endISO);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `${invite.bride} & ${invite.groom} — Wedding`,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: `${invite.venue.name}, ${invite.venue.place}`,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

// .ics file for Apple Calendar, Outlook and most phone calendars
function downloadIcs() {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kavindi & Nalina//Wedding//EN",
    "BEGIN:VEVENT",
    `UID:${fmt(invite.dateISO)}-kavindi-nalina@wedding`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(invite.dateISO)}`,
    `DTEND:${fmt(ivory.endISO)}`,
    `SUMMARY:${invite.bride} & ${invite.groom} — Wedding`,
    // Commas must be escaped in iCalendar text values
    `LOCATION:${`${invite.venue.name}, ${invite.venue.place}`.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "kavindi-nalina-wedding.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type TimelineIconName = (typeof ivory.events)[number]["icon"];

// Simple line icons for the order of the day
function TimelineIcon({ name }: { name: TimelineIconName }) {
  const paths: Record<TimelineIconName, React.ReactNode> = {
    // welcome drinks: two glasses
    arrival: (
      <>
        <path d="M5 3h5l-.6 5.2a2 2 0 0 1-3.8 0L5 3ZM7.5 10.5V18M5.5 18h4" />
        <path d="M14 3h5l-.6 5.2a2 2 0 0 1-3.8 0L14 3ZM16.5 10.5V18M14.5 18h4" />
      </>
    ),
    // poruwa: decorated platform with a canopy
    poruwa: <path d="M3 19h18M5 19v-6h14v6M4 13l8-7 8 7M12 6V3M9 16h6" />,
    // registration: pen signing a line
    register: <path d="M4 20h9M15.5 4.5l4 4L9 19l-5 1 1-5 10.5-10.5Z" />,
    // reception: cake
    cake: <path d="M4 20h16M5 20v-7h14v7M7 13V9.5h10V13M12 9.5V7M12 5.2c.8-.8.8-1.7 0-2.4-.8.7-.8 1.6 0 2.4ZM5 16.5c2 1 3-1 5 0s3-1 5 0 3-1 4 0" />,
    // lunch: fork and knife
    lunch: <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-1.7 1.3-2.5 3.6-2.5 6.5V13H16v8M16 3v10" />,
    // celebration: music notes
    music: (
      <>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6.5" cy="18" r="2.5" />
        <circle cx="17.5" cy="16" r="2.5" />
      </>
    ),
    // going away: car
    car: (
      <>
        <path d="M3 16v-3l2-5h14l2 5v3H3ZM3 13h18" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name]}
    </svg>
  );
}

function Celebration() {
  return (
    <section id="details" className="iv-section iv-tinted">
      <Heading title="The Celebration" sub="Order of the day" />
      <Reveal delay={150}>
        {/* Gold arch card; events alternate left and right of a dotted centre line */}
        <div className={`iv-schedule ${sans.className}`}>
          <p className="iv-sched-head">
            {invite.dateDisplay.weekday} · {ivory.venue.hotel}
          </p>
          <ol>
            {ivory.events.map((e, i) => (
              <li key={e.time} className={i % 2 ? "is-right" : "is-left"}>
                <div className="iv-sched-text">
                  <span className="iv-sched-time">{e.time}</span>
                  <span className="iv-sched-title">{e.title}</span>
                  {e.text && <span className="iv-sched-sub">{e.text}</span>}
                </div>
                <span className="iv-sched-icon">
                  <TimelineIcon name={e.icon} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
      <Reveal delay={300}>
        <a className="iv-btn" href={calendarUrl()} target="_blank" rel="noopener noreferrer">
          Add to calendar
        </a>
      </Reveal>
    </section>
  );
}

function Venue() {
  return (
    <section id="location" className="iv-section iv-tinted">
      <Heading title="The Venue" />
      <Reveal delay={150}>
        <div className="iv-card iv-venue">
          <span className="iv-venue-watermark" aria-hidden />
          <span className="iv-pin">
            <PinIcon />
          </span>
          <h3 className="iv-venue-hotel">{ivory.venue.hotel}</h3>
          <p className="caps iv-venue-city">{ivory.venue.city}</p>
          <span className="iv-person-rule" />
          <p className="serif-italic iv-venue-hall">{ivory.venue.hall}</p>
          <a className="iv-btn" href={invite.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Maps
          </a>
        </div>
      </Reveal>
    </section>
  );
}

// No backend: the reply is sent as a pre-filled WhatsApp message to the first contact
function Rsvp() {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState(true);
  const [guests, setGuests] = useState(1);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = attending
      ? `Hi! This is ${name}. We'd love to attend your wedding — ${guests} guest${guests > 1 ? "s" : ""}.`
      : `Hi! This is ${name}. Sadly we won't be able to attend, but we send our love.`;
    const to = intlPhone(invite.rsvp.contacts[0].phone);
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <section id="rsvp" className="iv-section">
      <Heading title="RSVP" sub={`Kindly reply by ${ivory.rsvpBy}`} />
      <Reveal delay={150}>
        <form className="iv-card iv-form" onSubmit={submit}>
          <label className="caps small" htmlFor="iv-name">
            Full name
          </label>
          <input id="iv-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

          <div className="iv-choice" role="radiogroup" aria-label="Attendance">
            <button type="button" className={attending ? "is-on" : ""} onClick={() => setAttending(true)} aria-pressed={attending}>
              Joyfully accept
            </button>
            <button type="button" className={!attending ? "is-on" : ""} onClick={() => setAttending(false)} aria-pressed={!attending}>
              Regretfully decline
            </button>
          </div>

          {attending && (
            <div className="iv-stepper">
              <span className="caps small">Guests</span>
              <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} aria-label="Fewer guests">
                −
              </button>
              <span className="iv-stepper-num">{guests}</span>
              <button type="button" onClick={() => setGuests(Math.min(10, guests + 1))} aria-label="More guests">
                +
              </button>
            </div>
          )}

          <button type="submit" className="iv-btn iv-btn-solid">
            Send reply
          </button>
        </form>
      </Reveal>
    </section>
  );
}

// Like the RSVP, wishes go out as a pre-filled WhatsApp message to the first contact
function Wishes() {
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `A wish for ${invite.bride} & ${invite.groom} 💌

${wish.trim()}

— ${name.trim()}`;
    const to = intlPhone(invite.rsvp.contacts[0].phone);
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <section id="wishes" className="iv-section">
      <Heading title="Leave a Wish" sub="Share your love and blessings with us" />
      <Reveal delay={150}>
        <form className="iv-card iv-form" onSubmit={submit}>
          <label className="caps small" htmlFor="iv-wish-name">
            Your name
          </label>
          <input
            id="iv-wish-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <label className="caps small" htmlFor="iv-wish-text">
            Your wish
          </label>
          <textarea
            id="iv-wish-text"
            required
            rows={4}
            maxLength={500}
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="Write a few words for the couple…"
          />
          <button type="submit" className="iv-btn iv-btn-solid">
            Send wishes
          </button>
        </form>
      </Reveal>
    </section>
  );
}

function Footer() {
  const d = invite.dateDisplay;
  return (
    <footer className="iv-section iv-footer iv-has-floral">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="iv-floral" src="/footer-floral.webp" alt="" aria-hidden />
      <p className="caps small">Save the date</p>
      <p className="iv-footer-date">
        {d.day} · {d.month} · {d.year}
      </p>
      <Flourish className="iv-flourish" />
      <p className="serif-italic">Sealed with love</p>
      <p className="script iv-footer-mono">{monogram}</p>
      <p className="iv-credit">
        Want a beautiful wedding website like this? Create yours with{" "}
        <a target="_blank" rel="noreferrer" href="https://wa.me/94707819074">
          invitemint
        </a>
      </p>
    </footer>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`iv-reveal ${shown ? "is-shown" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

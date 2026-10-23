"use client";

import { useEffect, useRef, useState } from "react";
import { Pinyon_Script } from "next/font/google";
import { invite, intlPhone } from "../invite";
import { ivory } from "./ivory";
import { Flourish, PhoneIcon, PinIcon } from "../components/Ornaments";
import "./ivory.css";

type Stage = "sealed" | "breaking" | "open";

// Overrides the site-wide --font-script (Great Vibes) for this layout only
const cursive = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--font-script" });

const monogram = `${invite.bride[0]}&${invite.groom[0]}`;

export default function IvorySeal() {
  const [stage, setStage] = useState<Stage>("sealed");
  const [videoFailed, setVideoFailed] = useState(false);

  // CSS seal fallback, used only if the intro video can't play
  const breakSeal = () => {
    if (stage !== "sealed") return;
    setStage("breaking");
    setTimeout(() => setStage("open"), 1600);
  };

  useEffect(() => {
    document.body.style.overflow = stage === "open" ? "" : "hidden";
  }, [stage]);

  return (
    <div className={`iv ${cursive.variable}`}>
      {stage !== "open" &&
        (videoFailed ? (
          <Gate breaking={stage === "breaking"} onBreak={breakSeal} />
        ) : (
          <IntroVideo
            playing={stage === "breaking"}
            onStart={() => setStage("breaking")}
            onEnd={() => setStage("open")}
            onError={() => setVideoFailed(true)}
          />
        ))}

      {/* Shell-border loop behind every section below the hero */}
      <video
        className="iv-bg-video"
        src="/block-bg-animated-coastal-shell-border-loop.mp4"
        poster="/block-bg-coastal-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      />

      <Nav />
      <main className={`iv-main ${stage !== "sealed" ? "is-visible" : ""}`}>
        <Hero />
        <Hosts />
        <Countdown />
        <Story />
        <Celebration />
        <Venue />
        <Rsvp />
        <Footer />
      </main>
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
        src="/envelope-open-v2.mp4"
        poster="/envelope-closed.webp"
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
  ["story", "Our Story"],
  ["details", "Details"],
  ["rsvp", "RSVP"],
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
          <h1 className="script iv-hero-names">
            {invite.bride} &amp; {invite.groom}
          </h1>
          <p className="caps iv-hero-tag">Finally, we do</p>
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

// Parents and invitation wording, moved out of the hero
function Hosts() {
  const d = invite.dateDisplay;
  return (
    <section className="iv-section iv-hosts">
      <Reveal>
        <p className="caps small">{invite.brideParents}</p>
        <p className="serif-italic iv-and">&amp;</p>
        <p className="caps small">{invite.groomParents}</p>
        <p className="serif-italic iv-lede">
          {invite.invitationLine.toLowerCase()} to the marriage of their beloved children
        </p>
      </Reveal>
      <Reveal delay={150}>
        <h2 className="iv-names">
          <span className="script">{invite.bride}</span>
          <span className="serif-italic iv-amp">and</span>
          <span className="script">{invite.groom}</span>
        </h2>
        <Flourish className="iv-flourish" />
        <p className="caps iv-date">
          {d.weekday} · {d.day} {d.month} {d.year}
        </p>
        <p className="serif-italic">
          {invite.timeDisplay} · {invite.venue.name}, {invite.venue.place}
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
      <Heading title="We are getting married" sub={`${invite.dateDisplay.day} ${invite.dateDisplay.month} ${invite.dateDisplay.year}`} />
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
    </section>
  );
}

function Story() {
  return (
    <section id="story" className="iv-section">
      <Heading title="Our Story" sub="How it all began" />
      <ol className="iv-timeline">
        {ivory.story.map((s, i) => (
          <Reveal key={s.year} delay={i * 120}>
            <li className={i % 2 ? "is-right" : "is-left"}>
              <span className="iv-tl-dot" />
              <div className="iv-tl-card">
                <span className="caps iv-tl-year">{s.year}</span>
                <span className="iv-tl-title">{s.title}</span>
                <span className="serif-italic">{s.text}</span>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
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

function Celebration() {
  return (
    <section id="details" className="iv-section iv-tinted">
      <Heading title="The Celebration" sub="Order of the day" />
      <Reveal delay={150}>
        <div className="iv-card iv-schedule">
          <p className="caps small iv-muted">
            {invite.dateDisplay.weekday} · {invite.venue.name}
          </p>
          <ol>
            {ivory.events.map((e) => (
              <li key={e.time}>
                <span className="caps iv-sched-time">{e.time}</span>
                <span className="iv-sched-dot" aria-hidden />
                <span className="iv-sched-title">{e.title}</span>
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
          <span className="iv-pin">
            <PinIcon />
          </span>
          <h3 className="iv-event-title">{invite.venue.name}</h3>
          <p className="serif-italic">{invite.venue.place}</p>
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
      <div className="iv-calls">
        {invite.rsvp.contacts.map((c) => (
          <a key={c.phone} className="iv-btn" href={`tel:+${intlPhone(c.phone)}`}>
            <PhoneIcon /> Call {c.name}
          </a>
        ))}
      </div>
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

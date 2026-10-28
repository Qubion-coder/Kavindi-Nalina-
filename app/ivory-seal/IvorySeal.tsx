"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Great_Vibes, Pinyon_Script, Playball, Poppins } from "next/font/google";
import { invite, intlPhone } from "../invite";
import { ivory } from "./ivory";
import { Flourish, PinIcon } from "../components/Ornaments";
import "./ivory.css";

type Stage = "sealed" | "breaking" | "open";

// Overrides the site-wide --font-script (Great Vibes) for this layout only
const cursive = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--font-script" });

// Rounder script used for the bride and groom cards
const playball = Playball({ weight: "400", subsets: ["latin"] });

// Calligraphic script for the couple's names (hero and parent cards)

// Clean sans-serif for the order-of-the-day timeline
const sans = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"] });

// Background song lives at public/song.mp3; NEXT_PUBLIC_MUSIC_SRC in .env.local can override it
const musicSrc = encodeURI(process.env.NEXT_PUBLIC_MUSIC_SRC || "/song.mp3");

// Great Vibes for the countdown heading
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"] });

const monogram = `${invite.bride[0]}&${invite.groom[0]}`;

export default function IvorySeal({ guest = "" }: { guest?: string }) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [videoFailed, setVideoFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const musicStarted = useRef(false);

  // Music is on by default; this flips to false only when the guest turns it off
  const musicWanted = useRef(true);

  // Opening the invitation is a tap, so browsers allow the music to start here
  const startMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    // Mobile browsers may drop a failed preload; reload before trying again
    if (a.error || a.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) a.load();
    if (!musicStarted.current) a.currentTime = ivory.musicStartAt;
    a.play()
      .then(() => {
        musicStarted.current = true;
        setPlaying(true);
      })
      .catch(() => setPlaying(false));
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

  // If the browser blocked the first play, start on the guest's next tap anywhere.
  // Uses "click" (counts as a play gesture on iPhone, unlike pointerdown) and skips
  // taps on the music button, which handles itself — otherwise one tap would start
  // the song here and the button's own click would immediately pause it again.
  useEffect(() => {
    if (stage !== "open" || playing) return;
    const retry = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest(".iv-music")) return;
      if (musicWanted.current) startMusic();
    };
    window.addEventListener("click", retry);
    return () => window.removeEventListener("click", retry);
  }, [stage, playing]);

  useEffect(() => {
    startMusic();
  }, []);

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
      {/* Background song: public/song.mp3, or a local-only file set in .env.local */}
      {/* Loops by hand so each repeat also skips the intro seconds */}
      <audio
        ref={audioRef}
        src={musicSrc}
        preload="auto"
        autoPlay
        onEnded={(e) => {
          e.currentTarget.currentTime = ivory.musicStartAt;
          e.currentTarget.play().catch(() => setPlaying(false));
        }}
      />

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
        <Welcome guest={guest} />
        <Hosts />
        <Countdown />
        <Celebration />
        <Venue />
        <Rsvp />
        <Wishes />
        <Footer />
      </main>

      {/* Always shown after the intro; it stays "off" if the song file can't load */}
      {stage === "open" && (
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
    // Animation only: the background song is the sole audio
    v.muted = true;
    v.play().catch(onEnd);
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
        muted
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
          <p className="script iv-hero-tag">We are getting married</p>
          <h1 className="script iv-hero-names">
            {invite.bride} &amp; {invite.groom}
          </h1>
          <span className="iv-hero-divider" aria-hidden>
            <span />
            <i />
            <span />
          </span>
        </div>
      </div>
    </section>
  );
}

// Bride and groom cards with their parents, joined by a round "&" badge
// Personal invitation line; the name comes from the /admin link, "you" without one
function Welcome({ guest }: { guest: string }) {
  return (
    <section className="iv-section iv-welcome">
      <Reveal>
        <p className="serif-italic iv-welcome-line">Together with our families</p>
        <p className="serif-italic iv-welcome-line">We take the pleasure in inviting</p>
      </Reveal>
      <Reveal delay={200}>
        <p className="script iv-welcome-guest">{guest || "you"}</p>
      </Reveal>
      <Reveal delay={400}>
        <p className="serif-italic iv-welcome-line">To celebrate our wedding</p>
      </Reveal>
      <Reveal delay={600}>
        <DateCard />
      </Reveal>
    </section>
  );
}

// Printed-card style date: month / weekday | 17 | time / year, then the venue
function DateCard() {
  const d = invite.dateDisplay;
  const [time, onwards] = invite.timeDisplay.split(" onwards");
  return (
    <div className="iv-datecard">
      <p className="iv-dc-month">{d.month}</p>
      <div className="iv-dc-row">
        <span className="iv-dc-side">{d.weekday}</span>
        <span className="iv-dc-day">{d.day}</span>
        <span className="iv-dc-side iv-dc-time">
          {time}
          {onwards !== undefined && <small>Onwards</small>}
        </span>
      </div>
      <p className="iv-dc-year">{d.year}</p>
      <p className="iv-dc-venue">At {ivory.venue.hall}</p>
      <p className="iv-dc-venue">
        {ivory.venue.hotel}, {ivory.venue.city}
      </p>
    </div>
  );
}

function Hosts() {
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
      <Reveal>
        <h2 className={`iv-forever ${greatVibes.className}`}>Forever Begins In</h2>
      </Reveal>
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
            <CalendarIcon /> Add to calendar
          </a>
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
    </section>
  );
}

// Hotel photo on top, then a "Location" box with the details and a maps button
function Venue() {
  return (
    <section id="location" className="iv-section iv-tinted">
      <Heading title="The Venue" />
      <Reveal delay={150}>
        <div className="iv-venue-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="iv-venue-photo" src="/venue-hotel.jpg" alt={ivory.venue.hotel} loading="lazy" />
          <div className="iv-loc">
            <p className="iv-loc-head">Location</p>
            <div className="iv-loc-body">
              <h3 className="iv-loc-hotel">{ivory.venue.hotel}</h3>
              <p className="iv-loc-line">{ivory.venue.city}</p>
              <p className="iv-loc-line">{ivory.venue.hall}</p>
              <a className="iv-loc-btn" href={invite.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
                <PinIcon /> Live Location
              </a>
            </div>
          </div>
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
      <Reveal>
        <div className="iv-guestbook">
          <div className="iv-gb-tag">
            <span />
            <p>Guest Book</p>
            <span />
          </div>
          <h2 className={`iv-gb-title ${greatVibes.className}`}>Leave a Wish</h2>
          <p className="iv-gb-intro">
            We&apos;d love to hear from you! Please leave your wishes, advice, or a simple hello for us.
          </p>
          <form className="iv-gb-form" onSubmit={submit}>
            <input
              aria-label="Your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
            />
            <textarea
              aria-label="Your wish"
              required
              rows={4}
              maxLength={500}
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="Write your wishes for the couple..."
            />
            <button type="submit">Send Wishes</button>
          </form>
        </div>
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

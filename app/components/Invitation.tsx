"use client";

import { useEffect, useRef, useState } from "react";
import { invite, intlPhone } from "../invite";
import { ChatIcon, CornerSprig, Flourish, PhoneIcon, PinIcon, WaxSeal } from "./Ornaments";

type Stage = "closed" | "opening" | "open";

export default function Invitation() {
  const [stage, setStage] = useState<Stage>("closed");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasMusic, setHasMusic] = useState(false);
  const [playing, setPlaying] = useState(false);

  const [videoFailed, setVideoFailed] = useState(false);

  const startMusic = () => {
    audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
  };

  useEffect(() => {
    startMusic();
  }, []);

  // CSS envelope fallback, used only if the intro video can't play
  const open = () => {
    if (stage !== "closed") return;
    setStage("opening");
    // Opening on a tap counts as a user gesture, so browsers allow audio here
    startMusic();
    setTimeout(() => setStage("open"), 2200);
  };

  const finishIntro = () => {
    setStage("open");
    startMusic();
  };

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = stage === "open" ? "" : "hidden";
  }, [stage]);

  return (
    <>
      {/* Background song from public/song.mp3 */}
      <audio ref={audioRef} src="/song.mp3" loop preload="auto" autoPlay onCanPlay={() => setHasMusic(true)} />

      {stage !== "open" &&
        (videoFailed ? (
          <Envelope opening={stage === "opening"} onOpen={open} />
        ) : (
          <IntroVideo
            playing={stage === "opening"}
            onStart={() => setStage("opening")}
            onEnd={finishIntro}
            onError={() => setVideoFailed(true)}
          />
        ))}

      <main className={`invite ${stage !== "closed" ? "is-visible" : ""}`}>
        <Hero />
        <Countdown />
        <Venue />
        <Schedule />
        <Rsvp />
        <footer className="footer">
          <Flourish className="flourish" />
          <p className="script footer-names">
            {invite.bride} &amp; {invite.groom}
          </p>
          <p className="caps small">With love · 17 · 12 · 2026</p>
        </footer>
      </main>

      {stage === "open" && <ScrollHint />}

      {stage === "open" && hasMusic && (
        <button className="music-btn" onClick={toggleMusic} aria-label={playing ? "Mute music" : "Play music"}>
          {playing ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
              <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
              <path d="M17 9l5 6M22 9l-5 6" />
            </svg>
          )}
        </button>
      )}
    </>
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

  // Fade out just before the last frame so the card appears underneath
  const onTime = () => {
    const v = videoRef.current;
    if (v && v.duration && v.duration - v.currentTime < 0.8) setEnding(true);
  };

  return (
    <div
      className={`intro ${ending ? "is-ending" : ""}`}
      onClick={start}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && start()}
      aria-label="Open the invitation"
    >
      <video
        ref={videoRef}
        className="intro-video"
        src="/envelope-open-v2.mp4#t=0.001"
        playsInline
        preload="auto"
        onTimeUpdate={onTime}
        onEnded={onEnd}
        onError={onError}
      />
      {!playing && (
        <div className="intro-overlay">
          <p className="env-for">{invite.envelopeLine}</p>
          <p className="env-tap">Tap to open</p>
        </div>
      )}
      {playing && (
        <button
          className="intro-skip"
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

function Envelope({ opening, onOpen }: { opening: boolean; onOpen: () => void }) {
  return (
    <div
      className={`envelope ${opening ? "is-opening" : ""}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      aria-label="Open the invitation"
    >
      <div className="env-paper" />
      <div className="env-flap env-flap-left" />
      <div className="env-flap env-flap-right" />
      <div className="env-flap env-flap-bottom" />
      <div className="env-flap env-flap-top" />
      <div className="env-center">
        <WaxSeal initials={`${invite.bride[0]}&${invite.groom[0]}`} />
        <p className="env-for">{invite.envelopeLine}</p>
        <p className="env-tap">Tap to open</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <>
      <CornerSprig className="sprig sprig-tl" />
      <CornerSprig className="sprig sprig-tr" />
      <CornerSprig className="sprig sprig-bl" />
      <CornerSprig className="sprig sprig-br" />
    </>
  );
}

function Hero() {
  const d = invite.dateDisplay;
  return (
    <section className="section hero">
      <Frame />
      <div className="hero-inner">
        <Reveal>
          <p className="caps parents">{invite.brideParents}</p>
          <p className="serif-italic together">together with</p>
          <p className="caps parents">{invite.groomParents}</p>
        </Reveal>
        <Reveal delay={150}>
          <p className="caps small spaced">{invite.invitationLine}</p>
          <p className="serif-italic celebrate">{invite.celebrationLine}</p>
        </Reveal>
        <Reveal delay={300}>
          <h1 className="names">
            <span className="script">{invite.bride}</span>
            <span className="amp">&amp;</span>
            <span className="script">{invite.groom}</span>
          </h1>
        </Reveal>
        <Reveal delay={450}>
          <Flourish className="flourish" />
          <div className="date-row">
            <span className="caps date-side">{d.month}</span>
            <span className="date-mid">
              <span className="caps small">{d.weekday}</span>
              <span className="date-day">{d.day}</span>
              <span className="caps small">{d.year}</span>
            </span>
            <span className="caps date-side">{invite.timeDisplay.replace(" onwards", "")}</span>
          </div>
          <p className="serif-italic onwards">onwards</p>
        </Reveal>
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
    <section className="section">
      <Frame />
      <Reveal>
        <h2 className="title script">Countdown</h2>
        <p className="subtitle">We can&apos;t wait to celebrate with you!</p>
      </Reveal>
      <Reveal delay={150}>
        <div className="countdown">
          {parts.map(([label, v]) => (
            <div key={label} className="cd-cell">
              <span className="cd-num">{now === null ? "--" : String(v).padStart(2, "0")}</span>
              <span className="cd-label">{label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Venue() {
  return (
    <section className="section">
      <Frame />
      <Reveal>
        <h2 className="title script">The Venue</h2>
      </Reveal>
      <Reveal delay={150}>
        <div className="venue-art" aria-hidden>
          <VenueIllustration />
        </div>
        <div className="pin-circle">
          <PinIcon />
        </div>
        <p className="venue-name formal">{invite.venue.name}</p>
        <p className="serif-italic venue-place">{invite.venue.place}</p>
      </Reveal>
      <Reveal delay={300}>
        <a className="pill-link" href={invite.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
          <span className="pill-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 11l18-8-8 18-2-8-8-2Z" />
            </svg>
          </span>
          <span className="pill-text">
            <span className="formal">Get directions</span>
            <span className="serif-italic small">Open in Google Maps</span>
          </span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
          </svg>
        </a>
      </Reveal>
    </section>
  );
}

function Schedule() {
  return (
    <section className="section">
      <Frame />
      <Reveal>
        <h2 className="title serif-italic plan">Order of the day</h2>
      </Reveal>
      <div className="timeline">
        {invite.schedule.map((s, i) => (
          <Reveal key={s.time} delay={i * 150}>
            <div className={`tl-item ${i % 2 ? "tl-right" : "tl-left"}`}>
              <span className="tl-dot" />
              <div className="tl-body">
                <span className="tl-time">{s.time}</span>
                <span className="tl-title formal">{s.title}</span>
                <span className="tl-text serif-italic">{s.text}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Rsvp() {
  return (
    <section className="section">
      <Frame />
      <Reveal>
        <Flourish className="flourish" />
        <h2 className="title serif-italic rsvp-title">RSVP</h2>
        <p className="formal rsvp-note">{invite.rsvp.note}</p>
      </Reveal>
      <Reveal delay={150}>
        <div className="rsvp-card">
          <p className="serif-italic">Kindly let us know if you are unable to attend</p>
          {invite.rsvp.contacts.map((c) => (
            <div key={c.phone} className="contact">
              <div>
                <span className="script contact-name">{c.name}</span>
                <span className="contact-phone">{c.phone}</span>
              </div>
              <div className="contact-actions">
                <a href={`tel:+${intlPhone(c.phone)}`} aria-label={`Call ${c.name}`}>
                  <PhoneIcon />
                </a>
                <a
                  href={`https://wa.me/${intlPhone(c.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${c.name}`}
                >
                  <ChatIcon />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function ScrollHint() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onScroll = () =>
      setHidden(window.innerHeight + window.scrollY > document.body.scrollHeight - 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`scroll-hint ${hidden ? "is-hidden" : ""}`} aria-hidden>
      <span>Scroll for more details</span>
      <span className="mouse">
        <span className="wheel" />
      </span>
    </div>
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
    <div ref={ref} className={`reveal ${shown ? "is-shown" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// Simple banquet-hall line drawing with chandelier and arches.
function VenueIllustration() {
  return (
    <svg viewBox="0 0 320 180" fill="none" stroke="#8a6f5a" strokeWidth="1.3">
      <defs>
        <linearGradient id="hall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf3e6" />
          <stop offset="1" stopColor="#ecdcc6" />
        </linearGradient>
      </defs>
      <path d="M20 170V70L160 20l140 50v100Z" fill="url(#hall)" />
      <path d="M10 72L160 14l150 58" />
      {[50, 110, 170, 230].map((x) => (
        <g key={x}>
          <path d={`M${x} 170v-62a20 20 0 0 1 40 0v62`} fill="#f6ead8" />
          <path d={`M${x + 20} 88v82`} opacity="0.5" />
        </g>
      ))}
      <path d="M160 34v14" />
      <path d="M140 48h40l-6 10h-28Z" fill="#f3e0b8" />
      {[146, 160, 174].map((x) => (
        <circle key={x} cx={x} cy={62} r="2.5" fill="#e7c37a" stroke="none" />
      ))}
      <path d="M20 170h280" strokeWidth="2" />
      {[30, 290].map((x) => (
        <g key={x} stroke="#7f9a8f">
          <path d={`M${x} 170c-8-20 0-36 0-50 0 14 8 30 0 50Z`} fill="#cfdccf" />
        </g>
      ))}
    </svg>
  );
}

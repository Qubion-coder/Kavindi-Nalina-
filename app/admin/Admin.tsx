"use client";

import { useState } from "react";
import { invite } from "../invite";
import { displayName, guestPath, prefixes, type Prefix } from "../guest";
import "./admin.css";

function buildMessage(display: string, link: string) {
  return `Dear ${display} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${invite.groom} & ${invite.bride}`;
}

export default function Admin() {
  const [prefix, setPrefix] = useState<Prefix>("Mr.");
  const [name, setName] = useState("");
  const [result, setResult] = useState<{ display: string; link: string } | null>(null);
  const [toast, setToast] = useState("");

  const generate = (e: React.FormEvent) => {
    e.preventDefault();
    const display = displayName(prefix, name);
    if (!display) return;
    setResult({ display, link: window.location.origin + guestPath(display) });
  };

  const copy = async (text: string, note: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API blocked (e.g. plain http on a phone): fall back to a hidden textarea
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setToast(note);
    setTimeout(() => setToast(""), 1800);
  };

  const message = result ? buildMessage(result.display, result.link) : "";

  return (
    <main className="ad">
      <div className="ad-card">
        <h1>Invitation Links</h1>
        <p className="ad-sub">
          {invite.groom} &amp; {invite.bride}
        </p>

        <form onSubmit={generate} className="ad-form">
          <label>
            Select prefix
            <select value={prefix} onChange={(e) => setPrefix(e.target.value as Prefix)}>
              {prefixes.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Guest name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sanjaya" required />
          </label>
          <button type="submit" className="ad-primary">
            Generate Link
          </button>
        </form>

        {result && (
          <div className="ad-result">
            <p className="ad-label">Greeting</p>
            <p className="ad-greeting">Dear {result.display} ❤️</p>
            <p className="ad-label">Link</p>
            <a className="ad-link" href={result.link} target="_blank" rel="noopener noreferrer">
              {result.link}
            </a>
            <p className="ad-label">Message preview</p>
            <pre className="ad-message">{message}</pre>
          </div>
        )}

        <div className="ad-actions">
          <button type="button" disabled={!result} onClick={() => result && copy(result.link, "Link copied!")}>
            Copy Link Only
          </button>
          <button type="button" disabled={!result} onClick={() => copy(message, "Message copied!")}>
            Copy Full Message
          </button>
        </div>
      </div>

      {toast && <div className="ad-toast">{toast}</div>}
    </main>
  );
}

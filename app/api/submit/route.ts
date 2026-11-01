import { NextResponse } from "next/server";

// Forwards RSVPs and wishes to the Google Apps Script web app attached to the spreadsheet.
// Runs on the server only, so the password below never reaches the browser.

type Body =
  | { type: "rsvp"; name: string; attending: boolean; guests: number }
  | { type: "wish"; name: string; wish: string };

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Apps Script web app attached to the RSVP / wishes spreadsheet
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyADQbtETzC7HpRyITOJai52k2w744nm8JuY93207t-hXyb3Wsq_WZ4WGxcZb7sA527/exec";

// Must match SECRET in the Apps Script; SHEET_SECRET in the environment overrides it
const SCRIPT_SECRET = "MxENLx0l2fz3UZ74BTxgCra_nwQNdUXg";

export async function POST(req: Request) {
  const url = process.env.GOOGLE_SCRIPT_URL || SCRIPT_URL;
  const secret = process.env.SHEET_SECRET || SCRIPT_SECRET;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const name = text(body.name, 120);
  let payload: Record<string, unknown>;
  if (body.type === "rsvp") {
    const guests = Math.min(10, Math.max(1, Math.round(Number(body.guests) || 1)));
    payload = { type: "rsvp", name, attending: body.attending === true, guests };
  } else if (body.type === "wish") {
    const wish = text(body.wish, 500);
    if (!wish) return NextResponse.json({ ok: false, error: "Empty wish" }, { status: 400 });
    payload = { type: "wish", name, wish };
  } else {
    return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  }
  if (!name) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });

  try {
    // Apps Script answers with a redirect to the result; fetch follows it
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, secret }),
      redirect: "follow",
    });
    const result = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!result?.ok) {
      return NextResponse.json({ ok: false, error: result?.error || "Sheet error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach the sheet" }, { status: 502 });
  }
}

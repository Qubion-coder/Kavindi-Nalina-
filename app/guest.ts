// Guest naming rules shared by the /admin link generator and the personalised invitation.

export const prefixes = ["Mr.", "Mrs.", "Miss", "Mr. & Mrs.", "Family", "Dear"] as const;
export type Prefix = (typeof prefixes)[number];

// "Dear" is a greeting style, not part of the name, so it adds nothing here
export function displayName(prefix: Prefix, name: string) {
  const n = name.trim().replace(/\s+/g, " ");
  if (!n) return "";
  if (prefix === "Family") return `${n} and Family`;
  if (prefix === "Dear") return n;
  return `${prefix} ${n}`;
}

// The whole display name goes in the path so the prefix survives: /Mr.%20%26%20Mrs.%20Perera
export function guestPath(display: string) {
  return "/" + encodeURIComponent(display);
}

// Reads a name back from a URL segment; returns "" for anything unusable
export function guestFromSegment(segment: string) {
  let s: string;
  try {
    s = decodeURIComponent(segment);
  } catch {
    return "";
  }
  return s.trim().replace(/\s+/g, " ").slice(0, 80);
}

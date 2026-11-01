/**
 * Kavindi & Nalina — saves RSVPs and wishes from the website into this spreadsheet.
 *
 * Setup (once):
 * 1. Open the spreadsheet → Extensions → Apps Script. Replace everything with this file.
 * 2. Change SECRET below to the same text as SHEET_SECRET in Vercel / .env.local.
 *    (Only in the Apps Script editor — never commit the real value; this repo is public.)
 * 3. Pick "setup" in the function menu and click Run once: it creates the RSVP and
 *    Wishes tabs with their headers (allow access when asked).
 * 4. Deploy → New deployment → type "Web app". Execute as: Me. Who has access: Anyone.
 * After editing this file later: Deploy → Manage deployments → ✏️ → Version: New version
 * (keeps the same /exec URL).
 */

const SECRET = "change-me-to-a-long-random-text";

const SHEETS = {
  rsvp: { name: "RSVP", headers: ["Timestamp", "Name", "Attending", "Guests"] },
  wish: { name: "Wishes", headers: ["Timestamp", "Name", "Wish"] },
};

// Run once from the editor to create both tabs up front
function setup() {
  Object.keys(SHEETS).forEach((key) => sheetFor(SHEETS[key]));
}

// Opening the /exec URL in a browser shows this — handy to confirm the deployment is live
function doGet() {
  return reply({ ok: true, message: "RSVP & wishes endpoint is running" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) return reply({ ok: false, error: "unauthorised" });

    const config = SHEETS[data.type];
    if (!config) return reply({ ok: false, error: "unknown type" });

    const row =
      data.type === "rsvp"
        ? [new Date(), clean(data.name), data.attending ? "Yes" : "No", data.attending ? Number(data.guests) || 1 : 0]
        : [new Date(), clean(data.name), clean(data.wish)];

    // Lock so two guests submitting at once don't overwrite each other's row
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheetFor(config).appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

// Returns the tab, creating it (or its header row, if the tab is empty) when needed
function sheetFor(config) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(config.name) || book.insertSheet(config.name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(config.headers);
    sheet
      .getRange(1, 1, 1, config.headers.length)
      .setFontWeight("bold")
      .setBackground("#f3ecdf");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, config.headers.length);
  }
  return sheet;
}

// Trim, cap length, and stop text starting with = + - @ being run as a formula
function clean(value) {
  const s = String(value || "").trim().slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

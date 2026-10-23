// All invitation wording lives here — edit this file to change the card.
export const invite = {
  bride: "Kavindi",
  groom: "Nalina",
  envelopeLine: "For our beloved guests",

  brideParents: "Mr Chandika & Mrs Thusitha Gunaratne",
  groomParents: "Mr Tilak & Mrs Samanmalie De Silva",
  invitationLine: "Take pleasure in inviting you",
  celebrationLine:
    "As they joyfully celebrate the marriage of their beloved children",

  // Local Sri Lanka time (UTC+5:30)
  dateISO: "2026-12-17T08:30:00+05:30",
  dateDisplay: { weekday: "Thursday", day: "17", month: "December", year: "2026" },
  timeDisplay: "8.30 AM onwards",

  venue: {
    name: "Sangam Banquet Hall",
    place: "ITC Ratnadipa, Colombo",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=ITC+Ratnadipa+Colombo",
  },

  schedule: [
    { time: "8:30 AM", title: "Arrival", text: "Welcome of guests" },
    { time: "8:45 AM", title: "Poruwa Ceremony", text: "The auspicious Poruwa ceremony" },
  ],

  rsvp: {
    note: "Regrets only",
    contacts: [
      { name: "Kavindi", phone: "0773708854" },
      { name: "Nalina", phone: "0719228899" },
    ],
  },
};

// 0773708854 -> 94773708854 for tel/WhatsApp links
export const intlPhone = (local: string) => "94" + local.replace(/^0/, "");

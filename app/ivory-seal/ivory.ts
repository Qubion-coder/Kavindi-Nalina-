// Extra wording for the Ivory Seal layout. Names, date, venue and contacts come from ../invite.ts.
export const ivory = {
  rsvpBy: "1 December 2026",

  // Background song starts (and loops back to) this many seconds in, skipping the intro
  musicStartAt: 14,

  // The hotel is the headline; the hall is the detail underneath
  venue: { hotel: "ITC Ratnadipa", hall: "Sangam Banquet Hall", city: "Colombo" },

  // Order of the day — also sets the end time of the "Add to calendar" event
  endISO: "2026-12-17T15:30:00+05:30",
  events: [
    { time: "8:30 AM", title: "Guest Arrival", text: "Welcome drinks & good vibes", icon: "arrival" },
    { time: "8:45 AM", title: "Poruwa Ceremony", text: "Tying the knot & blessings", icon: "poruwa" },
    { time: "9:30 AM", title: "Registration", text: "", icon: "register" },
    { time: "9:50 AM", title: "Reception Begins", text: "Cake & drinks", icon: "cake" },
    { time: "12:20 PM", title: "Lunch", text: "A feast to celebrate love", icon: "lunch" },
    { time: "12:45 PM", title: "Celebration", text: "Dance & photos", icon: "music" },
    { time: "3:15 PM", title: "Going Away", text: "", icon: "car" },
  ] as const,
};

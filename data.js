// ============================================================
// PROPERTY DATA
// ------------------------------------------------------------
// This is the file you'll edit as properties come and go.
// Each listing is one object in the LISTINGS array below.
//
// FIELD REFERENCE:
//   id        - unique slug, e.g. "48-case-rd-burlington-ct"
//   address   - street address
//   town      - town/city name
//   state     - "CT" or "MA"
//   price     - number, no $ or commas (current asking price)
//   originalPrice - number, optional. Set this if the price has been cut
//               since you first saw it. Omit it entirely if there's been
//               no change — don't set it equal to price.
//   lat, lng  - decimal coordinates, used for the Map tab. Easiest way to
//               get these: right-click the spot on Google Maps and click
//               the coordinates that pop up at the top — it copies them.
//   beds      - number
//   baths     - number
//   sqft      - number
//   acres     - number (decimal ok)
//   type      - free text, e.g. "Single family", "Cape"
//   status    - "active" | "pending" | "contingent" | "sold"
//   listedDate- "YYYY-MM-DD"
//   hvac      - "central" | "minisplit" | "window" | "none"
//               (central/minisplit = good, window = warning, none = bad)
//   flags     - array of short strings, e.g. ["unpermitted addition"]
//   url       - listing URL (Zillow/Realtor.com/etc.)
//   notes     - free text, shows on the card
//   watchlist - true/false — whether this is a saved favorite
//   dismissed - true/false — whether this has been passed on
// ============================================================

const LISTINGS = [
  {
    id: "example-48-case-rd-burlington-ct",
    address: "48 Case Rd",
    town: "Burlington",
    state: "CT",
    price: 469000,
    originalPrice: 489000,
    lat: 41.7615,
    lng: -72.9587,
    beds: 3,
    baths: 2,
    sqft: 1850,
    acres: 1.4,
    type: "Colonial",
    status: "active",
    listedDate: "2026-06-20",
    hvac: "central",
    flags: [],
    url: "https://www.realtor.com/",
    notes: "Reactivated after a prior deal fell through. Example entry — replace with real data.",
    watchlist: true,
    dismissed: false
  },
  {
    id: "example-763-stony-hill-rd-wilbraham-ma",
    address: "763 Stony Hill Rd",
    town: "Wilbraham",
    state: "MA",
    price: 549000,
    lat: 42.1112,
    lng: -72.4370,
    beds: 4,
    baths: 2,
    sqft: 2400,
    acres: 3.2,
    type: "Raised ranch",
    status: "active",
    listedDate: "2025-12-01",
    hvac: "minisplit",
    flags: [],
    url: "https://www.realtor.com/",
    notes: "Bundle opportunity with adjacent lot. Example entry — replace with real data.",
    watchlist: true,
    dismissed: false
  },
  {
    id: "example-flip-example-ct",
    address: "12 Sample St",
    town: "Southington",
    state: "CT",
    price: 429000,
    lat: 41.5892,
    lng: -72.8781,
    beds: 3,
    baths: 2,
    sqft: 1600,
    acres: 0.6,
    type: "LLC flip",
    status: "active",
    listedDate: "2026-05-01",
    hvac: "window",
    flags: ["unpermitted work — needs verification"],
    url: "https://www.realtor.com/",
    notes: "Example flagged listing — shows how warnings render.",
    watchlist: false,
    dismissed: false
  }
];

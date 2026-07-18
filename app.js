// ============================================================
// APP LOGIC — filtering, sorting, rendering, save/dismiss toggles
// You shouldn't need to touch this file often. Edit data.js instead.
// ============================================================

const STORAGE_KEY = "hs-overrides"; // per-browser quick toggles (watchlist/dismissed)

function loadOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

let overrides = loadOverrides();
let activeTab = "all";
let searchTerm = "";
let sortMode = "price-asc";
let leafletMap = null;
let markerLayer = null;

// Roughly centers the initial view on the central CT / western MA search area
const MAP_DEFAULT_CENTER = [41.9, -72.7];
const MAP_DEFAULT_ZOOM = 9;

function getEffectiveListing(listing) {
  const o = overrides[listing.id] || {};
  return {
    ...listing,
    watchlist: o.watchlist !== undefined ? o.watchlist : listing.watchlist,
    dismissed: o.dismissed !== undefined ? o.dismissed : listing.dismissed
  };
}

function daysOnMarket(listedDate) {
  if (!listedDate) return null;
  const listed = new Date(listedDate + "T00:00:00");
  const now = new Date();
  return Math.max(0, Math.round((now - listed) / 86400000));
}

function money(n) {
  return "$" + n.toLocaleString("en-US");
}

function priceDropBadge(listing) {
  if (!listing.originalPrice || listing.originalPrice <= listing.price) return "";
  const cut = listing.originalPrice - listing.price;
  return `<span class="badge badge--price-drop">↓ ${money(cut)} cut</span>`;
}

function hvacBadge(hvac) {
  const map = {
    central: { label: "Central Air", cls: "badge--hvac-good" },
    minisplit: { label: "Mini-Split", cls: "badge--hvac-good" },
    window: { label: "Window Units", cls: "badge--hvac-warn" },
    none: { label: "No AC", cls: "badge--hvac-bad" }
  };
  const m = map[hvac] || { label: hvac, cls: "badge--hvac-warn" };
  return `<span class="badge ${m.cls}">${m.label}</span>`;
}

function renderCard(listing) {
  const dom = daysOnMarket(listing.listedDate);
  const domBadge = dom !== null
    ? `<span class="badge ${dom > 60 ? "badge--dom-warn" : ""}">${dom}d on market</span>`
    : "";
  const stateBadge = `<span class="badge badge--state-${listing.state.toLowerCase()}">${listing.state}</span>`;
  const contingentBadge = listing.status !== "active"
    ? `<span class="badge badge--contingent">${listing.status}</span>`
    : "";
  const flagBadges = (listing.flags || [])
    .map(f => `<span class="badge badge--flag">${f}</span>`).join("");

  return `
  <article class="card card--${listing.state.toLowerCase()}" data-id="${listing.id}">
    ${listing.imageUrl ? `<div class="card__photo"><img src="${listing.imageUrl}" alt="${listing.address}" loading="lazy"></div>` : ""}
    <div class="card__top">
      <div>
        <p class="card__address">${listing.address}</p>
        <p class="card__town">${listing.town}, ${listing.state}</p>
      </div>
      <div class="card__price">${money(listing.price)}</div>
    </div>

    <div class="card__stats">
      <span>${listing.beds} bd</span>
      <span>${listing.baths} ba</span>
      <span>${listing.sqft ? listing.sqft.toLocaleString() + " sqft" : "sqft n/a"}</span>
      <span>${listing.acres} ac</span>
      <span>${listing.type}</span>
    </div>

    <div class="card__badges">
      ${stateBadge}
      ${hvacBadge(listing.hvac)}
      ${priceDropBadge(listing)}
      ${domBadge}
      ${contingentBadge}
      ${flagBadges}
    </div>

    ${listing.notes ? `<p class="card__notes">${listing.notes}</p>` : ""}

    <div class="card__actions">
      <a class="card__link" href="${listing.url}" target="_blank" rel="noopener">View listing →</a>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="card__dismiss" data-action="dismiss" data-id="${listing.id}">
          ${listing.dismissed ? "Restore" : "Dismiss"}
        </button>
        <button class="card__save ${listing.watchlist ? "is-saved" : ""}" data-action="save" data-id="${listing.id}">
          ${listing.watchlist ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    </div>
  </article>`;
}

function applyFilters(list) {
  return list.filter(l => {
    if (activeTab === "watch" && !l.watchlist) return false;
    if (activeTab === "ct" && l.state !== "CT") return false;
    if (activeTab === "ma" && l.state !== "MA") return false;
    if (activeTab === "dismissed" && !l.dismissed) return false;
    if (activeTab !== "dismissed" && l.dismissed) return false;

    if (searchTerm) {
      const hay = `${l.address} ${l.town} ${l.notes}`.toLowerCase();
      if (!hay.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });
}

function applySort(list) {
  const sorted = [...list];
  switch (sortMode) {
    case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
    case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
    case "acres-desc": sorted.sort((a, b) => b.acres - a.acres); break;
    case "dom-desc":
      sorted.sort((a, b) => (daysOnMarket(b.listedDate) || 0) - (daysOnMarket(a.listedDate) || 0));
      break;
    case "listed-desc":
      sorted.sort((a, b) => new Date(b.listedDate) - new Date(a.listedDate));
      break;
  }
  return sorted;
}

function updateStats(all) {
  document.getElementById("statActive").textContent =
    all.filter(l => l.status === "active" && !l.dismissed).length;
  document.getElementById("statWatch").textContent =
    all.filter(l => l.watchlist && !l.dismissed).length;
  document.getElementById("statFlag").textContent =
    all.filter(l => (l.flags || []).length > 0 && !l.dismissed).length;
}

function initMapIfNeeded() {
  if (leafletMap) return;
  leafletMap = L.map("mapView").setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18
  }).addTo(leafletMap);
  markerLayer = L.layerGroup().addTo(leafletMap);
}

function updateMap(listings) {
  initMapIfNeeded();
  markerLayer.clearLayers();

  const withCoords = listings.filter(l => l.lat && l.lng);
  withCoords.forEach(l => {
    const color = l.watchlist ? "#A98B3D" : "#3F5D4C";
    const marker = L.circleMarker([l.lat, l.lng], {
      radius: 8,
      color: color,
      fillColor: color,
      fillOpacity: 0.85,
      weight: 2
    }).addTo(markerLayer);

    marker.bindPopup(`
      <strong>${l.address}</strong><br>
      ${l.town}, ${l.state} — ${money(l.price)}<br>
      <a href="${l.url}" target="_blank" rel="noopener">View listing →</a>
    `);
  });

  // Fit the view to whatever pins are showing, so it's never empty/off-screen
  if (withCoords.length > 0) {
    const bounds = L.latLngBounds(withCoords.map(l => [l.lat, l.lng]));
    leafletMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  }

  // Leaflet needs a nudge to redraw correctly after being hidden
  setTimeout(() => leafletMap.invalidateSize(), 50);
}

function render() {
  const effective = LISTINGS.map(getEffectiveListing);
  updateStats(effective);

  const grid = document.getElementById("cardGrid");
  const empty = document.getElementById("emptyState");
  const mapView = document.getElementById("mapView");

  if (activeTab === "map") {
    grid.hidden = true;
    empty.hidden = true;
    mapView.hidden = false;
    // Map shows everything not dismissed, respecting the search box only
    const forMap = effective.filter(l => !l.dismissed &&
      (!searchTerm || `${l.address} ${l.town} ${l.notes}`.toLowerCase().includes(searchTerm.toLowerCase())));
    updateMap(forMap);
    return;
  }

  mapView.hidden = true;
  grid.hidden = false;

  const filtered = applySort(applyFilters(effective));

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
  } else {
    empty.hidden = true;
    grid.innerHTML = filtered.map(renderCard).join("");
  }
}

// ---------- Event wiring ----------

document.getElementById("tabbar").addEventListener("click", e => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("is-active"));
  btn.classList.add("is-active");
  activeTab = btn.dataset.tab;
  render();
});

document.getElementById("searchBox").addEventListener("input", e => {
  searchTerm = e.target.value;
  render();
});

document.getElementById("sortSelect").addEventListener("change", e => {
  sortMode = e.target.value;
  render();
});

document.getElementById("cardGrid").addEventListener("click", e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  const current = overrides[id] || {};
  const base = LISTINGS.find(l => l.id === id);
  const effective = getEffectiveListing(base);

  if (action === "save") {
    current.watchlist = !effective.watchlist;
  } else if (action === "dismiss") {
    current.dismissed = !effective.dismissed;
  }
  overrides[id] = current;
  saveOverrides(overrides);
  render();
});

render();

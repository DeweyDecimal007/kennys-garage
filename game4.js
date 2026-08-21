function renderCars() {
  if (state.cars.length === 0 && state.parts.length === 0) {
    return `
      <div class="panel">
        <div class="empty">
          <p>No cars or parts yet.</p>
          <p class="meta" style="margin-top:8px">Buy a project car from the Shop or scavenge the Junk Yard.</p>
          <button class="btn" style="margin-top:12px" onclick="switchTab('shop')">Go to Shop</button>
        </div>
      </div>
    `;
  }
  let html = `
    <div class="panel">
      <div class="panel-title">Your Cars (${state.cars.length}/${getGarage().totalBays} bays)</div>
      ${state.cars.map(car => {
        const stats = calcCarStats(car);
        return `
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">${car.name}</div>
                <div class="meta">Cond ${car.condition}% · ${car.parts.length} parts installed</div>
              </div>
              <span class="badge">${stats.hp} hp</span>
            </div>
            <div class="meta">Weight ${stats.weight} kg · Handling ${stats.handling} · Power Score ${stats.powerScore}</div>
            <div class="progress-bar"><div class="progress-fill" style="width:${car.condition}%"></div></div>
            <div class="grid-2" style="margin-top:10px">
              <button class="btn btn-sm btn-secondary" onclick="openCarDetail(${car.id})">Manage</button>
              <button class="btn btn-sm" onclick="repairCar(${car.id})">Repair</button>
            </div>
          </div>
        `;
      }).join("") || "<div class='empty'>No cars in the garage</div>"}
    </div>
    <div class="panel">
      <div class="panel-title">Parts Inventory (${state.parts.length})</div>
      ${state.parts.filter(p => !state.cars.some(c => (c.parts||[]).includes(p.id))).map(p => {
        const cat = PART_CATALOG[p.type];
        return `
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">${cat ? cat.name : p.type}</div>
                <div class="meta">${p.brand} · ${qualityLabel(p.quality)} · ${p.condition}%</div>
              </div>
            </div>
            <div class="grid-2">
              <button class="btn btn-sm btn-secondary" onclick="sellPart(${p.id})">Sell</button>
              <button class="btn btn-sm btn-danger" onclick="trashPart(${p.id})">Trash</button>
            </div>
          </div>
        `;
      }).join("") || "<div class='empty'>No spare parts</div>"}
    </div>
  `;
  return html;
}

function openCarDetail(carId) {
  const car = state.cars.find(c => c.id === carId);
  if (!car) return;
  const stats = calcCarStats(car);
  const installed = (car.parts || []).map(pid => {
    const p = state.parts.find(x => x.id === pid);
    if (!p) return "";
    const cat = PART_CATALOG[p.type];
    return `
      <div class="card">
        <div class="card-title">${cat.name}</div>
        <div class="meta">${qualityLabel(p.quality)} · Cond ${p.condition}%</div>
        <button class="btn btn-sm btn-danger" onclick="removePart(${car.id}, ${p.id})">Remove</button>
      </div>
    `;
  }).join("");
  const available = state.parts.filter(p => !(car.parts || []).includes(p.id)).map(p => {
    const cat = PART_CATALOG[p.type];
    return `
      <div class="card">
        <div class="card-title">${cat.name}</div>
        <div class="meta">${qualityLabel(p.quality)} · ${p.condition}%</div>
        <button class="btn btn-sm" onclick="installPart(${car.id}, ${p.id})">Install</button>
      </div>
    `;
  }).join("");
  openModal(car.name, `
    <div class="meta">Condition ${car.condition}% · ${stats.hp} hp · ${stats.weight} kg · Handling ${stats.handling}</div>
    <div class="panel-title" style="margin-top:14px">Installed Parts</div>
    ${installed || "<div class='empty'>None</div>"}
    <div class="panel-title" style="margin-top:14px">Available to Install</div>
    ${available || "<div class='empty'>No spare parts</div>"}
    <div class="grid-2" style="margin-top:16px">
      <button class="btn btn-secondary" onclick="repairCar(${car.id}); closeModal(); render();">Repair</button>
      <button class="btn btn-danger" onclick="sellCar(${car.id})">Sell Car</button>
    </div>
  `);
}

function renderRace() {
  if (state.cars.length === 0) {
    return `<div class="panel"><div class="empty">You need a car to race.<br><button class="btn" style="margin-top:12px" onclick="switchTab('shop')">Buy a Project Car</button></div></div>`;
  }
  return `
    <div class="panel">
      <div class="panel-title">Race Events</div>
      <p class="meta" style="margin-bottom:10px">Pick a race type and one of your cars.</p>
      ${RACE_TYPES.map(r => `
        <div class="card">
          <div class="card-title">${r.name}</div>
          <div class="meta">${r.desc}</div>
          <div class="meta">Focus: ${r.focus} · Payout x${r.payout}</div>
          <select id="carSelect_${r.id}" style="width:100%; margin:8px 0; padding:8px; border-radius:6px; background:var(--panel2); color:var(--text); border:1px solid var(--border)">
            ${state.cars.map(c => {
              const s = calcCarStats(c);
              return `<option value="${c.id}">${c.name} (${s.hp}hp, cond ${c.condition}%)</option>`;
            }).join("")}
          </select>
          <button class="btn btn-sm btn-block" onclick="const sel=document.getElementById('carSelect_${r.id}'); runRace('${r.id}', parseInt(sel.value))">Enter Race</button>
        </div>
      `).join("")}
    </div>
  `;
}

const tabs = {
  home: renderHome,
  garage: renderGarage,
  work: renderWork,
  school: renderSchool,
  shop: () => { const h = renderShop(); setTimeout(() => renderShopContent("tools"), 0); return h; },
  cars: renderCars,
  race: renderRace
};

let currentTab = "home";
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  render();
}

function render() {
  renderHeader();
  const content = document.getElementById("content");
  content.innerHTML = tabs[currentTab] ? tabs[currentTab]() : "";
  save();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
});

load();
if (typeof state.gameHour !== "number") state.gameHour = 8;
if (!state.lastRealtime) state.lastRealtime = Date.now();
if (typeof state.schoolEndRealtime !== "number") state.schoolEndRealtime = 0;
if (!state.dayStartRealtime) {
  state.dayStartRealtime = Date.now() - ((state.gameHour || 8) / 24) * MS_PER_GAME_DAY;
}
if (!state.playerName) state.playerName = "Kenny";
if (!state.medals) state.medals = {};
if (!state.highScores) state.highScores = { maxMoney: 120, bestRacePrize: 0, racesWon: 0, racesEntered: 0, daysPlayed: 1, junkPartsBought: 0 };

if (state.day === 1 && state.log.length === 0) {
  log("Welcome to Kenny's Garage! Start by working a job or checking the junk yard.", "event");
  log("Parents' garage is yours for now. Build skills, earn cash, and grow.", "event");
  log("Idle mode: 24 real minutes = 1 full game day. Time keeps running offline.", "event");
}

updateIdleTime();
render();

setInterval(() => {
  updateIdleTime();
  if (document.getElementById("clock")) renderHeader();
}, 5000);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    updateIdleTime();
    render();
  }
});
window.addEventListener("focus", () => updateIdleTime());

window.doJob = doJob;
window.enrollCourse = enrollCourse;
window.buyTool = buyTool;
window.visitJunkyard = visitJunkyard;
window.buyJunkPart = buyJunkPart;
window.buyFromStore = buyFromStore;
window.sellPart = sellPart;
window.trashPart = trashPart;
window.buyBaseCar = buyBaseCar;
window.installPart = installPart;
window.removePart = removePart;
window.repairCar = repairCar;
window.sellCar = sellCar;
window.upgradeGarage = upgradeGarage;
window.buyExtraBay = buyExtraBay;
window.runRace = runRace;
window.helpFriend = helpFriend;
window.openCarDetail = openCarDetail;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.render = render;
window.setPlayerName = setPlayerName;
window.newCharacter = newCharacter;

function helpFriend() {
  const check = canDoEvening();
  if (!check.ok) { toast(check.reason); return; }
  const pay = rand(40, 120);
  const xp = rand(8, 18);
  earn(pay); addXP(xp); addRep(1);
  if (chance(0.25)) { state.skills.mechanics = (state.skills.mechanics || 0) + 1; log("Helped a friend — Mechanics OJT +1", "good"); }
  log("Helped a buddy with their car: +$" + pay, "good");
  toast(" +$" + pay + " for helping out");
  state.lastEveningDay = state.day;
  advanceDay(1); save(); render();
}
function openModal(title, html) {
  document.getElementById("modal").innerHTML = '<div class="modal-header"><div class="modal-title">' + title + '</div><button class="close-btn" onclick="closeModal()">\u00d7</button></div>' + html;
  document.getElementById("modalOverlay").classList.add("show");
}
function closeModal() { document.getElementById("modalOverlay").classList.remove("show"); }
function renderHeader() {
  document.getElementById("money").textContent = state.money.toLocaleString();
  document.getElementById("day").textContent = state.day;
  const clockEl = document.getElementById("clock");
  if (clockEl) clockEl.textContent = formatGameTime() + " \u00b7 next in " + formatCountdownToNextDay();
  document.getElementById("xp").textContent = state.xp;
  document.getElementById("rep").textContent = state.rep;
  const bar = document.getElementById("dayBar");
  if (bar) bar.style.width = Math.min(99.9, (state.gameHour / 24) * 100).toFixed(1) + "%";
}
function renderHome() {
  const g = getGarage();
  const skillsHtml = Object.entries(state.skills).map(function(kv) { return '<div class="skill-row"><span>' + kv[0] + '</span><strong>' + kv[1] + '</strong></div>'; }).join("");
  const medalsUnlocked = Object.keys(state.medals || {}).length;
  const hs = state.highScores || {};
  let schoolNote = "";
  if (state.currentCourse) {
    const leftMin = Math.ceil(Math.max(0, state.schoolEndRealtime - Date.now()) / 60000);
    schoolNote = '<p class="meta" style="margin-top:10px;color:var(--accent2)">' + (state.schoolType === "night" ? "Night" : "Day") + " School \u00b7 ~" + leftMin + " real min remaining</p>";
  }
  const medalsHtml = MEDALS.map(function(m) {
    const have = !!(state.medals && state.medals[m.id]);
    return '<div class="card" style="opacity:' + (have ? 1 : 0.45) + ';padding:8px"><div style="font-size:1.2rem">' + m.icon + '</div><div class="card-title" style="font-size:0.8rem">' + m.name + '</div><div class="meta">' + (have ? "Unlocked" : m.desc) + '</div></div>';
  }).join("");
  return '<div class="panel"><div class="kenny-box"><img src="kenny.jpg" class="kenny-img" alt="Kenny" onerror="this.style.display=\'none\'"><div style="flex:1"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><input id="nameInput" value="' + (state.playerName || "Kenny").replace(/"/g, "&quot;") + '" style="font-weight:700;font-size:1.05rem;background:var(--panel2);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;width:140px" onchange="setPlayerName(this.value)" onblur="setPlayerName(this.value)"><button class="btn btn-sm btn-secondary" onclick="setPlayerName(document.getElementById(\'nameInput\').value)">Save</button></div><div class="meta">Aspiring mechanic & racer</div><div class="meta" style="margin-top:6px">' + g.name + '</div><div class="meta">Bays: ' + g.totalBays + ' \u00b7 Tools: ' + state.tools.length + '</div></div></div></div>' +
    '<div class="panel"><div class="panel-title">Day Timer</div><div class="meta">Current time: <strong>' + formatGameTime() + '</strong></div><div class="meta">Next day in: <strong style="color:var(--accent2)">' + formatCountdownToNextDay() + '</strong></div><div class="progress-bar" style="height:10px;margin-top:8px"><div class="progress-fill" style="width:' + Math.min(99.9, (state.gameHour / 24) * 100).toFixed(1) + '%"></div></div><div class="meta" style="margin-top:6px">24 real minutes = 1 game day</div></div>' +
    '<div class="panel"><div class="panel-title">Skills</div><div class="skills-list">' + skillsHtml + '</div></div>' +
    '<div class="panel"><div class="panel-title">Medals & Trophies (' + medalsUnlocked + '/' + MEDALS.length + ')</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' + medalsHtml + '</div></div>' +
    '<div class="panel"><div class="panel-title">High Scores</div><div class="card">' +
    '<div class="skill-row"><span>Max Money</span><strong>$' + (hs.maxMoney || 0).toLocaleString() + '</strong></div>' +
    '<div class="skill-row"><span>Best Race Prize</span><strong>$' + (hs.bestRacePrize || 0).toLocaleString() + '</strong></div>' +
    '<div class="skill-row"><span>Races Won</span><strong>' + (hs.racesWon || 0) + '</strong></div>' +
    '<div class="skill-row"><span>Races Entered</span><strong>' + (hs.racesEntered || 0) + '</strong></div>' +
    '<div class="skill-row"><span>Days Reached</span><strong>' + (hs.daysPlayed || state.day) + '</strong></div>' +
    '<div class="skill-row"><span>Junk Parts Bought</span><strong>' + (hs.junkPartsBought || 0) + '</strong></div></div></div>' +
    '<div class="panel"><div class="panel-title">Quick Actions</div><div class="grid-2"><button class="btn btn-secondary" onclick="helpFriend()">Help Friend</button><button class="btn btn-secondary" onclick="visitJunkyard()">Junk Yard</button></div>' + schoolNote + '</div>' +
    '<div class="panel"><div class="panel-title">Activity Log</div><div class="log">' + (state.log.slice(0, 10).map(function(e) { return '<div class="log-entry ' + e.type + '">Day ' + e.day + ': ' + e.msg + '</div>'; }).join("") || "<div class='empty'>No activity yet</div>") + '</div></div>' +
    '<div class="panel"><div class="panel-title">The Fleet</div><img src="cars.jpg" class="cars-banner" alt="Chevy Ford Dodge" onerror="this.style.display=\'none\'"><p class="meta">Classic American muscle. More brands unlock later.</p></div>' +
    '<div class="panel" style="border-color:var(--danger)"><div class="panel-title">Character</div><p class="meta" style="margin-bottom:10px">Start a new character. Medals and high scores are kept.</p><button class="btn btn-danger btn-block" onclick="newCharacter()">Start New Character</button></div>';
}
function setPlayerName(name) {
  name = (name || "Kenny").trim().slice(0, 20) || "Kenny";
  state.playerName = name;
  save(); toast("Name saved: " + name); render();
}
function newCharacter() {
  if (!confirm("Start a brand new character?\n\nMedals and high scores will be kept.")) return;
  const keptMedals = Object.assign({}, state.medals || {});
  const keptScores = Object.assign({}, state.highScores || {});
  const keptName = state.playerName || "Kenny";
  state = { playerName: keptName, money: 120, day: 1, gameHour: 8, dayStartRealtime: Date.now() - (8 / 24) * MS_PER_GAME_DAY, lastRealtime: Date.now(), xp: 0, rep: 0, skills: { mechanics: 1, welding: 0, painting: 0, tuning: 0, racing: 0, business: 0 }, garageLevel: 0, extraBays: 0, tools: ["hand_jack"], parts: [], cars: [], ownedCars: 0, log: [], lastJobDay: 0, lastEveningDay: 0, schoolEndRealtime: 0, currentCourse: null, schoolType: null, nextPartId: 1, nextCarId: 1, passiveJob: null, medals: keptMedals, highScores: keptScores, totalJobs: 0 };
  log("New character started. Medals & high scores carried over.", "event");
  toast("New character ready. Good luck!");
  save(); render();
}
function renderGarage() {
  const g = getGarage();
  const next = GARAGE_LEVELS[state.garageLevel + 1];
  let nextHtml;
  if (next) {
    nextHtml = '<div class="card" style="margin-top:8px"><div class="card-title">Next: ' + next.name + '</div><div class="meta">' + next.desc + '</div><div class="meta">Requires Rep ' + next.unlockRep + ' \u00b7 Cost $' + next.cost.toLocaleString() + '</div><button class="btn btn-sm btn-block" style="margin-top:8px" onclick="upgradeGarage()"' + (state.rep < next.unlockRep || (next.cost > 0 && state.money < next.cost) ? " disabled" : "") + '>Upgrade Garage</button></div>';
  } else {
    nextHtml = '<div class="card"><div class="card-title">Professional Bay Expansion</div><div class="meta">Add extra service bays for $5,000 each</div><button class="btn btn-sm btn-block" style="margin-top:8px" onclick="buyExtraBay()">Buy Extra Bay</button></div>';
  }
  const toolsHtml = state.tools.map(function(tid) { const t = TOOLS.find(function(x) { return x.id === tid; }); return '<div class="card"><div class="card-title">' + (t ? t.name : tid) + '</div><div class="meta">' + (t ? t.desc : "") + '</div></div>'; }).join("") || "<div class='empty'>No tools yet</div>";
  return '<div class="panel"><div class="panel-title">Current Shop</div><div class="card"><div class="card-title">' + g.name + '</div><div class="meta">' + g.desc + '</div><div class="meta" style="margin-top:6px">Bays available: <strong>' + g.totalBays + '</strong> \u00b7 Cars owned: ' + state.cars.length + '</div></div>' + nextHtml + '</div><div class="panel"><div class="panel-title">Tools Owned</div>' + toolsHtml + '<button class="btn btn-secondary btn-block" style="margin-top:8px" onclick="switchTab(\'shop\')">Buy more tools</button></div>';
}
function renderWork() {
  const jobCheck = canTakeJob();
  const jobsHtml = JOBS.map(function(job) {
    const locked = Object.entries(job.skillReq).some(function(kv) { return !skillCheck(kv[0], kv[1]); });
    const reqStr = Object.entries(job.skillReq).map(function(kv) { return kv[0] + ' ' + kv[1]; }).join(", ") || "None";
    const disabled = locked || !jobCheck.ok;
    let label = "Work Today";
    if (locked) label = "Locked";
    else if (state.day === state.lastJobDay) label = "Already worked today";
    else if (state.currentCourse && state.schoolType === "day") label = "Blocked by Day School";
    return '<div class="card"><div class="card-header"><div><div class="card-title">' + job.name + '</div><div class="meta">' + job.location + '</div></div><span class="badge ' + (locked ? "badge-muted" : "") + '">$' + job.pay + '/day</span></div><div class="meta">' + job.desc + '</div><div class="meta">Req: ' + reqStr + ' \u00b7 XP: ' + job.xp + '</div><button class="btn btn-sm btn-block" style="margin-top:8px" onclick="doJob(\'' + job.id + '\')"' + (disabled ? " disabled" : "") + '>' + label + '</button></div>';
  }).join("");
  return '<div class="panel"><div class="panel-title">Available Jobs (Daytime)</div><p class="meta" style="margin-bottom:10px">One job per game day. Day School blocks jobs; Night School allows them.</p>' + (!jobCheck.ok ? '<div class="card" style="border-color:var(--accent)"><div class="meta">' + jobCheck.reason + '</div></div>' : "") + jobsHtml + '</div>';
}
function renderSchool() {
  let enrolled = "";
  if (state.currentCourse) {
    const leftMin = Math.ceil(Math.max(0, state.schoolEndRealtime - Date.now()) / 60000);
    enrolled = '<div class="card" style="border-color:var(--accent)"><div class="card-title">Currently enrolled \u00b7 ' + (state.schoolType === "night" ? "Night School" : "Day School") + '</div><div class="meta">~' + leftMin + ' real minutes remaining</div></div>';
  }
  const coursesHtml = COURSES.map(function(c) {
    const locked = c.req && Object.entries(c.req).some(function(kv) { return !skillCheck(kv[0], kv[1]); });
    const req = c.req ? " \u00b7 Req: " + Object.entries(c.req).map(function(kv) { return kv[0] + ' ' + kv[1]; }).join(", ") : "";
    const label = locked ? "Requirements not met" : (state.currentCourse ? "Already in school" : "Choose Day / Night");
    return '<div class="card"><div class="card-header"><div class="card-title">' + c.name + '</div><span class="badge">$' + c.cost + '</span></div><div class="meta">' + c.desc + '</div><div class="meta">+' + c.gain + ' ' + c.skill + ' \u00b7 base ' + c.days + ' days' + req + '</div><button class="btn btn-sm btn-block" style="margin-top:8px" onclick="enrollCourse(\'' + c.id + '\')"' + (locked || state.currentCourse || state.money < c.cost ? " disabled" : "") + '>' + label + '</button></div>';
  }).join("");
  return '<div class="panel"><div class="panel-title">Vocational Courses</div><p class="meta" style="margin-bottom:10px"><strong>Day School</strong>: normal length, blocks daytime jobs, evenings free.<br><strong>Night School</strong>: twice as long, allows a daytime job, blocks evenings.</p>' + enrolled + coursesHtml + '</div>';
}
function renderShop() {
  return '<div class="panel"><div class="panel-title">Shops</div><div class="sub-tabs" id="shopTabs"><button class="sub-tab active" data-shop="tools">Tools</button><button class="sub-tab" data-shop="parts">Parts Store</button><button class="sub-tab" data-shop="tuner">Tuner Shop</button><button class="sub-tab" data-shop="race">Racing Shop</button><button class="sub-tab" data-shop="cars">Project Cars</button></div><div id="shopContent"></div></div><div class="panel"><div class="panel-title">Jerry\'s Junk Yard</div><p class="meta">Cheapest source. Random quality.</p><button class="btn btn-block" onclick="visitJunkyard()">Search the Yard</button></div>';
}
function renderShopContent(shop) {
  shop = shop || "tools";
  const el = document.getElementById("shopContent");
  if (!el) return;
  function partCard(type, mult) {
    const cat = PART_CATALOG[type];
    return '<div class="card"><div class="card-header"><div class="card-title">' + cat.name + '</div><span class="badge">~$' + Math.round(cat.basePrice * mult) + '</span></div><div class="meta">Wt ' + cat.baseWeight + ' \u00b7 HP ' + cat.baseHP + ' \u00b7 Hand ' + cat.baseHandling + '</div><button class="btn btn-sm btn-block" style="margin-top:8px" onclick="buyFromStore(\'' + type + '\', ' + mult + ')">Buy</button></div>';
  }
  if (shop === "tools") {
    el.innerHTML = TOOLS.map(function(t) {
      const owned = hasTool(t.id);
      return '<div class="card"><div class="card-header"><div class="card-title">' + t.name + '</div><span class="badge ' + (owned ? "badge-success" : "") + '">' + (owned ? "Owned" : "$" + t.cost) + '</span></div><div class="meta">' + t.desc + '</div>' + (!owned ? '<button class="btn btn-sm btn-block" style="margin-top:8px" onclick="buyTool(\'' + t.id + '\')"' + (state.money < t.cost ? " disabled" : "") + '>Buy</button>' : "") + '</div>';
    }).join("");
  } else if (shop === "parts") {
    el.innerHTML = '<p class="meta" style="margin-bottom:8px">Reliable street parts.</p>' + ["spark", "cold_air", "exhaust", "brakes", "tires_street", "steering", "fenders"].map(function(t) { return partCard(t, 1.1); }).join("");
  } else if (shop === "tuner") {
    el.innerHTML = '<p class="meta" style="margin-bottom:8px">Performance focused.</p>' + ["turbo", "supercharger", "cold_air", "header", "coilovers", "tires_race"].map(function(t) { return partCard(t, 1.35); }).join("");
  } else if (shop === "race") {
    el.innerHTML = '<p class="meta" style="margin-bottom:8px">Pro racing parts.</p>' + ["engine_big", "turbo", "supercharger", "coilovers", "tires_race", "frame_brace", "brakes"].map(function(t) { return partCard(t, 1.6); }).join("");
  } else if (shop === "cars") {
    el.innerHTML = '<p class="meta" style="margin-bottom:8px">Classic project cars.</p>' + BASE_CARS.map(function(c) {
      return '<div class="card"><div class="card-header"><div><div class="card-title">' + c.year + ' ' + c.brand + ' ' + c.model + '</div><div class="meta">Base ' + c.baseHP + ' hp \u00b7 ' + c.baseWeight + ' kg</div></div><span class="badge">$' + c.price + '</span></div><button class="btn btn-sm btn-block" style="margin-top:8px" onclick="buyBaseCar(\'' + c.id + '\')">Buy Project</button></div>';
    }).join("");
  }
  document.querySelectorAll("#shopTabs .sub-tab").forEach(function(btn) {
    btn.onclick = function() {
      document.querySelectorAll("#shopTabs .sub-tab").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderShopContent(btn.dataset.shop);
    };
  });
}

// ==================== STATE ====================
let state = {
  playerName: "Kenny",
  money: 120,
  day: 1,
  gameHour: 8,
  dayStartRealtime: Date.now() - (8 / 24) * MS_PER_GAME_DAY,
  lastRealtime: Date.now(),
  xp: 0,
  rep: 0,
  skills: { mechanics: 1, welding: 0, painting: 0, tuning: 0, racing: 0, business: 0 },
  garageLevel: 0,
  extraBays: 0,
  tools: ["hand_jack"],
  parts: [],
  cars: [],
  ownedCars: 0,
  log: [],
  lastJobDay: 0,
  lastEveningDay: 0,
  schoolEndRealtime: 0,
  currentCourse: null,
  schoolType: null,
  nextPartId: 1,
  nextCarId: 1,
  passiveJob: null,
  medals: {},
  highScores: { maxMoney: 120, bestRacePrize: 0, racesWon: 0, racesEntered: 0, daysPlayed: 1, junkPartsBought: 0 },
  totalJobs: 0
};

function save() { localStorage.setItem("kennysGarage_v1", JSON.stringify(state)); }
function load() {
  const raw = localStorage.getItem("kennysGarage_v1");
  if (!raw) return;
  try {
    const loaded = JSON.parse(raw);
    state = { ...state, ...loaded };
    state.skills = { ...{ mechanics: 1, welding: 0, painting: 0, tuning: 0, racing: 0, business: 0 }, ...state.skills };
    state.highScores = { maxMoney: 120, bestRacePrize: 0, racesWon: 0, racesEntered: 0, daysPlayed: 1, junkPartsBought: 0, ...(state.highScores || {}) };
    state.medals = state.medals || {};
    if (!state.playerName) state.playerName = "Kenny";
    if (!state.dayStartRealtime) state.dayStartRealtime = Date.now() - ((state.gameHour || 8) / 24) * MS_PER_GAME_DAY;
    if (typeof state.lastEveningDay !== "number") state.lastEveningDay = 0;
    if (!state.schoolType) state.schoolType = null;
  } catch (e) { console.warn("Load failed", e); }
}
function toast(msg, duration) {
  duration = duration || 2200;
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function() { t.classList.remove("show"); }, duration);
}
function log(msg, type) {
  state.log.unshift({ msg: msg, type: type || "", day: state.day });
  if (state.log.length > 40) state.log.pop();
  save();
}
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function chance(p) { return Math.random() < p; }
function qualityLabel(q) { return ["Junk", "Poor", "Average", "Good", "Excellent"][q - 1] || "Unknown"; }
function qualityMult(q) { return 0.5 + (q * 0.2); }
function hasTool(id) { return state.tools.includes(id); }
function skillCheck(skill, level) { return (state.skills[skill] || 0) >= level; }
function canAfford(cost) { return state.money >= cost; }
function spend(amount) {
  if (state.money < amount) return false;
  state.money -= amount;
  return true;
}
function earn(amount) { state.money += amount; return amount; }
function addXP(amount) { state.xp += amount; }
function addRep(amount) { state.rep += amount; }
function formatGameTime() {
  const h = Math.floor(state.gameHour) % 24;
  const m = Math.floor((state.gameHour % 1) * 60);
  return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0");
}
function formatCountdownToNextDay() {
  const now = Date.now();
  const elapsedInDay = now - state.dayStartRealtime;
  const remainingMs = Math.max(0, MS_PER_GAME_DAY - (elapsedInDay % MS_PER_GAME_DAY));
  const totalSec = Math.ceil(remainingMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return mins + ":" + String(secs).padStart(2,"0");
}
function processNewDay() {
  state.day += 1;
  state.highScores.daysPlayed = Math.max(state.highScores.daysPlayed || 0, state.day);
  state.cars.forEach(function(c) {
    if (c.condition > 25) c.condition = Math.max(25, c.condition - rand(0, 2));
  });
  const gPay = [0, 5, 12, 25, 40, 70][state.garageLevel] || 0;
  if (gPay > 0) { earn(gPay); log("Garage passive: +$" + gPay, "event"); }
  checkMedal("day30");
  toast("Day " + state.day + " begins");
}
function checkSchoolComplete() {
  if (state.currentCourse && state.schoolEndRealtime > 0 && Date.now() >= state.schoolEndRealtime) {
    const course = COURSES.find(function(c) { return c.id === state.currentCourse; });
    if (course) {
      state.skills[course.skill] = (state.skills[course.skill] || 0) + course.gain;
      log("Finished " + course.name + "! +" + course.gain + " " + course.skill, "good");
      toast("Course complete: +" + course.gain + " " + course.skill);
      checkMedal("mech5"); checkMedal("mech10"); checkMedal("all_skills");
    }
    state.currentCourse = null;
    state.schoolType = null;
    state.schoolEndRealtime = 0;
  }
}
function updateIdleTime() {
  const now = Date.now();
  if (!state.dayStartRealtime) state.dayStartRealtime = now - (state.gameHour / 24) * MS_PER_GAME_DAY;
  const elapsedSinceDayStart = now - state.dayStartRealtime;
  const fullDaysPassed = Math.floor(elapsedSinceDayStart / MS_PER_GAME_DAY);
  if (fullDaysPassed > 0) {
    const daysToProcess = Math.min(fullDaysPassed, 2);
    for (let i = 0; i < daysToProcess; i++) processNewDay();
    state.dayStartRealtime += daysToProcess * MS_PER_GAME_DAY;
  }
  const progressInDay = ((now - state.dayStartRealtime) % MS_PER_GAME_DAY) / MS_PER_GAME_DAY;
  state.gameHour = progressInDay * 24;
  state.lastRealtime = now;
  checkSchoolComplete();
  if (state.money > (state.highScores.maxMoney || 0)) {
    state.highScores.maxMoney = state.money;
    checkMedal("rich");
  }
  save();
  renderHeader();
}
function advanceDay(n) {
  n = n || 1;
  state.dayStartRealtime -= n * 8 * MS_PER_GAME_HOUR;
  updateIdleTime();
}
function checkMedal(id) {
  if (state.medals[id]) return;
  const m = MEDALS.find(function(x) { return x.id === id; });
  if (!m) return;
  let unlocked = false;
  if (id === "first_job" && state.totalJobs >= 1) unlocked = true;
  if (id === "first_car" && state.ownedCars >= 1) unlocked = true;
  if (id === "first_race" && (state.highScores.racesEntered || 0) >= 1) unlocked = true;
  if (id === "first_win" && (state.highScores.racesWon || 0) >= 1) unlocked = true;
  if (id === "mech5" && (state.skills.mechanics || 0) >= 5) unlocked = true;
  if (id === "mech10" && (state.skills.mechanics || 0) >= 10) unlocked = true;
  if (id === "garage_pro" && state.garageLevel >= 5) unlocked = true;
  if (id === "rich" && state.money >= 10000) unlocked = true;
  if (id === "junk_king" && (state.highScores.junkPartsBought || 0) >= 20) unlocked = true;
  if (id === "day30" && state.day >= 30) unlocked = true;
  if (id === "all_skills") unlocked = Object.values(state.skills).every(function(v) { return v >= 3; });
  if (unlocked) {
    state.medals[id] = true;
    log("Medal unlocked: " + m.name, "good");
    toast(m.icon + " " + m.name);
    save();
  }
}
function getGarage() {
  const g = GARAGE_LEVELS[state.garageLevel];
  return Object.assign({}, g, { totalBays: g.bays + state.extraBays });
}
function calcCarStats(car) {
  const base = BASE_CARS.find(function(b) { return b.id === car.baseId; }) || BASE_CARS[0];
  let weight = base.baseWeight, hp = base.baseHP, handling = base.baseHandling, reliability = 70;
  (car.parts || []).forEach(function(pid) {
    const p = state.parts.find(function(x) { return x.id === pid; });
    if (!p) return;
    const cat = PART_CATALOG[p.type];
    if (!cat) return;
    const q = qualityMult(p.quality), cond = p.condition / 100;
    weight += cat.baseWeight * 0.92;
    hp += cat.baseHP * q * cond;
    handling += cat.baseHandling * q * cond;
    if (p.condition < 50) reliability -= 5;
  });
  hp *= 1 + (state.skills.tuning || 0) * 0.015;
  handling *= 1 + (state.skills.racing || 0) * 0.01;
  const conditionFactor = car.condition / 100;
  return {
    weight: Math.round(weight),
    hp: Math.round(hp * conditionFactor),
    handling: Math.round(handling * conditionFactor),
    powerScore: Math.round((hp / Math.max(weight, 800)) * 100 * conditionFactor),
    reliability: Math.max(20, Math.min(100, reliability + (state.skills.mechanics || 0)))
  };
}
function canTakeJob() {
  updateIdleTime();
  if (state.day === state.lastJobDay) return { ok: false, reason: "Already worked this game day." };
  if (state.currentCourse && state.schoolType === "day") return { ok: false, reason: "You're in Day School — jobs are blocked until it finishes." };
  return { ok: true };
}
function canDoEvening() {
  updateIdleTime();
  if (state.day === state.lastEveningDay) return { ok: false, reason: "Already used your evening slot today (help friend or work on car)." };
  if (state.currentCourse && state.schoolType === "night") return { ok: false, reason: "You're in Night School — evenings are occupied." };
  return { ok: true };
}
function doJob(jobId) {
  const check = canTakeJob();
  if (!check.ok) { toast(check.reason); return; }
  const job = JOBS.find(function(j) { return j.id === jobId; });
  if (!job) return;
  for (const sk in job.skillReq) {
    if (!skillCheck(sk, job.skillReq[sk])) { toast("Need " + sk + " level " + job.skillReq[sk]); return; }
  }
  const success = chance(0.75 + (state.skills.mechanics || 0) * 0.03);
  if (success) {
    const pay = Math.round(job.pay * (1 + (state.skills.business || 0) * 0.04));
    earn(pay); addXP(job.xp); addRep(1);
    if (chance(0.35)) {
      const possible = Object.keys(job.skillReq);
      if (possible.length) {
        const sk = possible[rand(0, possible.length - 1)];
        state.skills[sk] = (state.skills[sk] || 0) + 1;
        log("OJT: " + sk + " improved while working at " + job.name + "!", "good");
      } else if (chance(0.4)) {
        state.skills.mechanics = (state.skills.mechanics || 0) + 1;
        log("OJT: Mechanics skill up!", "good");
      }
    }
    log("Worked " + job.name + ": +$" + pay + ", +" + job.xp + " XP", "good");
    toast("+$" + pay + " from " + job.name);
  } else {
    const pay = Math.round(job.pay * 0.4);
    earn(pay); addXP(Math.floor(job.xp / 2));
    log("Rough day at " + job.name + ". Only earned $" + pay, "bad");
    toast("Tough shift. Only $" + pay);
  }
  state.lastJobDay = state.day;
  state.totalJobs = (state.totalJobs || 0) + 1;
  checkMedal("first_job");
  advanceDay(1);
  save();
  render();
}
function enrollCourse(courseId, type) {
  if (state.currentCourse) { toast("Already enrolled in a course."); return; }
  if (type !== "day" && type !== "night") {
    const course = COURSES.find(function(c) { return c.id === courseId; });
    if (!course) return;
    openModal("Choose Schedule: " + course.name,
      '<p class="meta" style="margin-bottom:12px">' + course.desc + '</p>' +
      '<div class="card"><div class="card-title">Day School</div>' +
      '<div class="meta">Normal duration (' + course.days + ' game days / ' + (course.days * 24) + ' real min).</div>' +
      '<div class="meta">Blocks daytime jobs. Evenings free for helping friends or working on your own cars.</div>' +
      '<button class="btn btn-block" style="margin-top:8px" onclick="enrollCourse(\'' + courseId + '\', \'day\')">Enroll Day School ($' + course.cost + ')</button></div>' +
      '<div class="card"><div class="card-title">Night School</div>' +
      '<div class="meta">Takes <strong>twice as long</strong> (' + (course.days * 2) + ' game days / ' + (course.days * 48) + ' real min).</div>' +
      '<div class="meta">Allows a daytime job. Evenings are occupied by class.</div>' +
      '<button class="btn btn-block btn-secondary" style="margin-top:8px" onclick="enrollCourse(\'' + courseId + '\', \'night\')">Enroll Night School ($' + course.cost + ')</button></div>' +
      '<button class="btn btn-secondary btn-block" style="margin-top:12px" onclick="closeModal()">Cancel</button>'
    );
    return;
  }
  const course = COURSES.find(function(c) { return c.id === courseId; });
  if (!course) return;
  if (course.req) {
    for (const sk in course.req) {
      if (!skillCheck(sk, course.req[sk])) { toast("Requires " + sk + " " + course.req[sk]); return; }
    }
  }
  if (!spend(course.cost)) { toast("Not enough money"); return; }
  state.currentCourse = course.id;
  state.schoolType = type;
  const mult = type === "night" ? 2 : 1;
  state.schoolEndRealtime = Date.now() + course.days * mult * MS_PER_GAME_DAY;
  const realMin = course.days * mult * 24;
  log("Enrolled in " + course.name + " (" + type + " school, " + (course.days * mult) + " game days / " + realMin + " real min)", "event");
  toast((type === "night" ? "Night" : "Day") + " School started! ~" + realMin + " real min");
  closeModal();
  save();
  render();
}

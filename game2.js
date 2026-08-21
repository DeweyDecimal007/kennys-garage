function buyTool(toolId) {
  const tool = TOOLS.find(function(t) { return t.id === toolId; });
  if (!tool || hasTool(toolId)) return;
  if (!spend(tool.cost)) { toast("Can't afford that tool"); return; }
  state.tools.push(toolId);
  log("Bought " + tool.name, "good");
  toast(tool.name + " acquired");
  save(); render();
}
function generateJunkPart() {
  const types = Object.keys(PART_CATALOG);
  const type = types[rand(0, types.length - 1)];
  let q = rand(1, 5);
  if (q === 5 && !chance(0.15)) q = rand(2, 4);
  if (q === 4 && !chance(0.4)) q = rand(1, 3);
  const condition = rand(20, 95);
  const brand = ["Chevy", "Ford", "Dodge", "Aftermarket"][rand(0, 3)];
  const cat = PART_CATALOG[type];
  const price = Math.round(cat.basePrice * qualityMult(q) * (condition / 100) * (0.25 + Math.random() * 0.2));
  return { id: state.nextPartId++, type: type, quality: q, condition: condition, brand: brand, source: "junk", buyPrice: Math.max(15, price) };
}
function visitJunkyard() {
  const count = rand(4, 7);
  const offers = [];
  for (let i = 0; i < count; i++) offers.push(generateJunkPart());
  openModal("Jerry's Junk Yard", '<p class="meta" style="margin-bottom:12px">Random finds. Quality varies wildly. Bring cash.</p><div id="junkList"></div><button class="btn btn-secondary btn-block" style="margin-top:12px" onclick="closeModal()">Leave Yard</button>');
  const list = document.getElementById("junkList");
  offers.forEach(function(p) {
    const cat = PART_CATALOG[p.type];
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = '<div class="card-header"><div><div class="card-title">' + cat.name + '</div><div class="meta">' + p.brand + ' \u00b7 ' + qualityLabel(p.quality) + ' \u00b7 Cond ' + p.condition + '%</div></div><span class="badge">$' + p.buyPrice + '</span></div><button class="btn btn-sm btn-block" onclick="buyJunkPart(' + p.id + ',' + p.buyPrice + ',\'' + p.type + '\',' + p.quality + ',' + p.condition + ',\'' + p.brand + '\')">Buy</button>';
    list.appendChild(div);
  });
}
function buyJunkPart(id, price, type, quality, condition, brand) {
  if (!spend(price)) { toast("Not enough cash"); return; }
  state.parts.push({ id: id, type: type, quality: quality, condition: condition, brand: brand, source: "junk" });
  state.highScores.junkPartsBought = (state.highScores.junkPartsBought || 0) + 1;
  checkMedal("junk_king");
  log("Junk find: " + PART_CATALOG[type].name + " (" + qualityLabel(quality) + ")", "good");
  toast("Part added to inventory");
  closeModal(); save(); render();
}
function buyFromStore(type, storeMult) {
  storeMult = storeMult || 1.0;
  const cat = PART_CATALOG[type];
  if (!cat) return;
  const quality = rand(3, 5);
  const condition = rand(85, 100);
  const price = Math.round(cat.basePrice * qualityMult(quality) * storeMult);
  if (!spend(price)) { toast("Too expensive right now"); return; }
  state.parts.push({ id: state.nextPartId++, type: type, quality: quality, condition: condition, brand: ["Chevy", "Ford", "Dodge", "Aftermarket"][rand(0, 3)], source: "store" });
  log("Bought " + cat.name + " for $" + price, "good");
  toast(cat.name + " purchased");
  save(); render();
}
function sellPart(partId) {
  const idx = state.parts.findIndex(function(p) { return p.id === partId; });
  if (idx < 0) return;
  const p = state.parts[idx];
  if (state.cars.some(function(c) { return (c.parts || []).includes(partId); })) { toast("Part is installed on a car"); return; }
  const cat = PART_CATALOG[p.type];
  const value = Math.round(cat.basePrice * qualityMult(p.quality) * (p.condition / 100) * 0.55);
  earn(value);
  state.parts.splice(idx, 1);
  log("Sold " + cat.name + " for $" + value, "event");
  toast("Sold for $" + value);
  save(); render();
}
function trashPart(partId) {
  const idx = state.parts.findIndex(function(p) { return p.id === partId; });
  if (idx < 0) return;
  if (state.cars.some(function(c) { return (c.parts || []).includes(partId); })) { toast("Remove from car first"); return; }
  const p = state.parts[idx];
  state.parts.splice(idx, 1);
  log("Trashed " + PART_CATALOG[p.type].name, "bad");
  toast("Part trashed");
  save(); render();
}
function buyBaseCar(baseId) {
  const base = BASE_CARS.find(function(b) { return b.id === baseId; });
  if (!base) return;
  const g = getGarage();
  if (state.cars.length >= g.totalBays) { toast("Garage full (" + g.totalBays + " bays). Upgrade or sell a car."); return; }
  if (!spend(base.price)) { toast("Need more money for this project car"); return; }
  const car = { id: state.nextCarId++, baseId: base.id, name: base.year + " " + base.brand + " " + base.model, parts: [], condition: rand(55, 85), damage: 0, brand: base.brand };
  state.cars.push(car);
  state.ownedCars++;
  checkMedal("first_car");
  log("Bought project: " + car.name, "good");
  toast(car.name + " is yours!");
  save(); render();
}
function installPart(carId, partId) {
  const check = canDoEvening();
  if (!check.ok) { toast(check.reason); return; }
  const car = state.cars.find(function(c) { return c.id === carId; });
  const part = state.parts.find(function(p) { return p.id === partId; });
  if (!car || !part) return;
  if ((car.parts || []).includes(partId)) return;
  if (!hasTool("hand_jack") && !hasTool("floor_jack") && !hasTool("hydro_jack")) { toast("You need a jack to work under the car"); return; }
  const skillNeeded = (PART_CATALOG[part.type].category === "engine" || PART_CATALOG[part.type].category === "forced") ? 3 : 1;
  if (!skillCheck("mechanics", skillNeeded)) { toast("Mechanics skill " + skillNeeded + " required"); return; }
  const botchChance = Math.max(0.05, 0.35 - (state.skills.mechanics || 0) * 0.04);
  if (chance(botchChance)) {
    part.condition = Math.max(10, part.condition - rand(10, 25));
    log("Install of " + PART_CATALOG[part.type].name + " went poorly. Part damaged.", "bad");
    toast("Install botched — part took damage");
  } else {
    car.parts.push(partId);
    addXP(5);
    if (chance(0.2)) { state.skills.mechanics = (state.skills.mechanics || 0) + 1; log("OJT install: Mechanics +1", "good"); }
    log("Installed " + PART_CATALOG[part.type].name + " on " + car.name, "good");
    toast("Part installed successfully");
  }
  state.lastEveningDay = state.day;
  save(); render(); closeModal();
}
function removePart(carId, partId) {
  const car = state.cars.find(function(c) { return c.id === carId; });
  if (!car) return;
  car.parts = (car.parts || []).filter(function(id) { return id !== partId; });
  log("Removed part from " + car.name, "event");
  save(); render(); closeModal();
}
function repairCar(carId) {
  const check = canDoEvening();
  if (!check.ok) { toast(check.reason); return; }
  const car = state.cars.find(function(c) { return c.id === carId; });
  if (!car) return;
  if (car.condition >= 95) { toast("Car is already in great shape"); return; }
  const cost = Math.round((100 - car.condition) * 8);
  if (!spend(cost)) { toast("Need $" + cost + " for parts & supplies"); return; }
  const gain = rand(15, 30) + (state.skills.mechanics || 0) * 2;
  car.condition = Math.min(100, car.condition + gain);
  car.damage = Math.max(0, car.damage - 10);
  addXP(8);
  log("Repaired " + car.name + " to " + car.condition + "%", "good");
  toast("Condition now " + car.condition + "%");
  state.lastEveningDay = state.day;
  save(); render();
}
function sellCar(carId) {
  const idx = state.cars.findIndex(function(c) { return c.id === carId; });
  if (idx < 0) return;
  const car = state.cars[idx];
  const stats = calcCarStats(car);
  const base = BASE_CARS.find(function(b) { return b.id === car.baseId; });
  let value = base.price * 0.6 + stats.hp * 4 + stats.handling * 8;
  value *= (car.condition / 100);
  value = Math.round(value * (1 + (state.skills.business || 0) * 0.03));
  if (!confirm("Sell " + car.name + " for $" + value + "?")) return;
  earn(value);
  state.cars.splice(idx, 1);
  log("Sold " + car.name + " for $" + value, "good");
  toast("Sold for $" + value);
  save(); render(); closeModal();
}
function upgradeGarage() {
  const next = state.garageLevel + 1;
  if (next >= GARAGE_LEVELS.length) { toast("Already at max garage tier"); return; }
  const g = GARAGE_LEVELS[next];
  if (state.rep < g.unlockRep) { toast("Need " + g.unlockRep + " Reputation (you have " + state.rep + ")"); return; }
  if (g.cost > 0 && !spend(g.cost)) { toast("Need $" + g.cost); return; }
  state.garageLevel = next;
  checkMedal("garage_pro");
  log("Upgraded to " + g.name + "!", "good");
  toast("Now operating: " + g.name);
  save(); render();
}
function buyExtraBay() {
  if (state.garageLevel < 5) { toast("Only Professional Garages can add bays"); return; }
  if (!spend(5000)) { toast("Need $5000 per extra bay"); return; }
  state.extraBays++;
  log("Added an extra service bay", "good");
  toast("+1 Bay");
  save(); render();
}
function runRace(raceTypeId, carId) {
  const race = RACE_TYPES.find(function(r) { return r.id === raceTypeId; });
  const car = state.cars.find(function(c) { return c.id === carId; });
  if (!race || !car) return;
  if (car.condition < 30) { toast("Car is too damaged to race safely"); return; }
  const stats = calcCarStats(car);
  const oppPower = stats.powerScore * (0.85 + Math.random() * 0.35);
  const oppHandling = stats.handling * (0.8 + Math.random() * 0.4);
  let playerScore, oppScore;
  if (race.focus === "power") {
    playerScore = stats.powerScore * 1.3 + stats.handling * 0.4 + (state.skills.racing || 0) * 8;
    oppScore = oppPower * 1.3 + oppHandling * 0.4;
  } else if (race.focus === "handling") {
    playerScore = stats.handling * 1.4 + stats.powerScore * 0.5 + (state.skills.racing || 0) * 10;
    oppScore = oppHandling * 1.4 + oppPower * 0.5;
  } else if (race.focus === "reliability") {
    playerScore = (stats.reliability + stats.powerScore * 0.3 + stats.handling * 0.3) + (state.skills.racing || 0) * 6;
    oppScore = 70 + Math.random() * 40;
  } else {
    playerScore = stats.powerScore * 0.8 + stats.handling * 0.9 + (state.skills.racing || 0) * 9;
    oppScore = oppPower * 0.8 + oppHandling * 0.9;
  }
  playerScore *= 0.9 + Math.random() * 0.2;
  oppScore *= 0.9 + Math.random() * 0.2;
  const won = playerScore >= oppScore;
  const margin = Math.abs(playerScore - oppScore);
  let prize = Math.round(180 * race.payout * (1 + (state.skills.business || 0) * 0.02));
  prize = won ? Math.round(prize * (1.1 + margin / 200)) : Math.round(prize * 0.25);
  let dmg = 0;
  if (chance(race.damageChance) || (!won && chance(0.4))) {
    dmg = rand(5, 25);
    car.condition = Math.max(15, car.condition - dmg);
    car.damage += dmg;
    if (car.parts.length && chance(0.4)) {
      const pid = car.parts[rand(0, car.parts.length - 1)];
      const part = state.parts.find(function(p) { return p.id === pid; });
      if (part) part.condition = Math.max(5, part.condition - rand(8, 20));
    }
  }
  earn(prize);
  addXP(won ? 25 : 10);
  addRep(won ? 3 : 1);
  state.highScores.racesEntered = (state.highScores.racesEntered || 0) + 1;
  if (won) {
    state.highScores.racesWon = (state.highScores.racesWon || 0) + 1;
    if (prize > (state.highScores.bestRacePrize || 0)) state.highScores.bestRacePrize = prize;
    if (race.id === "enduro") checkMedal("enduro_win");
  }
  checkMedal("first_race");
  checkMedal("first_win");
  if (won && chance(0.3)) { state.skills.racing = (state.skills.racing || 0) + 1; log("Racing skill increased!", "good"); }
  const title = won ? "YOU WON!" : "You placed 2nd...";
  openModal("Race Result", '<div class="race-result ' + (won ? "win" : "lose") + '"><h2>' + title + '</h2><p>' + race.name + '</p><p><strong>' + car.name + '</strong></p><div class="meta">Your score: ' + Math.round(playerScore) + ' \u00b7 Opponent: ' + Math.round(oppScore) + '</div><p style="font-size:1.3rem;margin:12px 0;color:var(--accent2)">+$' + prize + '</p>' + (dmg > 0 ? '<p class="meta" style="color:var(--danger)">Car took ' + dmg + '% damage (now ' + car.condition + '%)</p>' : '<p class="meta">No significant damage</p>') + '<button class="btn btn-block" style="margin-top:16px" onclick="closeModal(); render();">Continue</button></div>');
  log((won ? "Won" : "Lost") + " " + race.name + " with " + car.name + ". +$" + prize, won ? "good" : "event");
  advanceDay(1);
  save();
}

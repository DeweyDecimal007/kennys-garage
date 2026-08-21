// ==================== GAME DATA ====================
const GARAGE_LEVELS = [
  { id: 0, name: "Parents' Garage", bays: 1, cost: 0, desc: "Your starting point. One bay, basic tools only.", unlockRep: 0 },
  { id: 1, name: "Vocational School Garage", bays: 2, cost: 0, desc: "Access after enrolling. Better lighting & lifts.", unlockRep: 5 },
  { id: 2, name: "Friend's Garage", bays: 2, cost: 500, desc: "Buddy lets you use his space for a fee.", unlockRep: 15 },
  { id: 3, name: "Home 1-Car Garage", bays: 1, cost: 3500, desc: "Your own place. Privacy and control.", unlockRep: 40 },
  { id: 4, name: "Home 2-Car Garage", bays: 2, cost: 8000, desc: "Room to grow. Work on two projects.", unlockRep: 80 },
  { id: 5, name: "Professional Garage", bays: 3, cost: 25000, desc: "Real shop. Pay to add extra bays ($5k each).", unlockRep: 150 }
];

const JOBS = [
  { id: "minwage", name: "Minimum Wage Gopher", pay: 65, xp: 8, skillReq: {}, time: 1, desc: "Fetch parts, clean floors, hold lights. Everyone starts here.", location: "Any" },
  { id: "gas", name: "Gas Station Attendant", pay: 85, xp: 10, skillReq: {}, time: 1, desc: "Pump gas, clean windows, run the register. Flexible daytime hours.", location: "Local Gas Station" },
  { id: "jerry", name: "Jerry's Junk Yard", pay: 95, xp: 15, skillReq: { mechanics: 2 }, time: 1, desc: "Sort scrap, pull usable parts, run the crusher.", location: "Jerry's Junk Yard" },
  { id: "pete", name: "Pete's Parts Counter", pay: 110, xp: 12, skillReq: { mechanics: 3, business: 1 }, time: 1, desc: "Counter sales, inventory, customer advice.", location: "Pete's Parts" },
  { id: "trevor", name: "Trevor's Tires Tech", pay: 130, xp: 18, skillReq: { mechanics: 4 }, time: 1, desc: "Mount, balance, rotate. Fast pace.", location: "Trevor's Tires" },
  { id: "als", name: "Al's Auto Repair Tech", pay: 160, xp: 22, skillReq: { mechanics: 5, welding: 1 }, time: 1, desc: "Oil changes, brakes, diagnostics under Al's eye.", location: "Al's Auto Repair" },
  { id: "kyle", name: "Kyle's Custom Body", pay: 180, xp: 25, skillReq: { painting: 3, welding: 2 }, time: 1, desc: "Bodywork, filler, prep for paint.", location: "Kyle's Custom Body" },
  { id: "trent", name: "Trent's Tool Emporium", pay: 140, xp: 14, skillReq: { business: 3 }, time: 1, desc: "Demo tools, help customers, light assembly.", location: "Trent's Tool Emporium" },
  { id: "race_crew", name: "Race Team Crew", pay: 220, xp: 30, skillReq: { mechanics: 7, racing: 3 }, time: 1, desc: "Pit support, setup changes, late nights.", location: "Local Track" }
];

const COURSES = [
  { id: "basic_mech", name: "Basic Mechanics 101", cost: 200, days: 2, skill: "mechanics", gain: 2, desc: "Engines, fluids, basic diagnostics." },
  { id: "adv_mech", name: "Advanced Diagnostics", cost: 450, days: 3, skill: "mechanics", gain: 3, req: { mechanics: 4 }, desc: "Scan tools, computer systems, deep troubleshooting." },
  { id: "weld1", name: "MIG Welding Basics", cost: 350, days: 2, skill: "welding", gain: 2, desc: "Safety, beads, patch panels." },
  { id: "weld2", name: "Structural Welding", cost: 600, days: 3, skill: "welding", gain: 3, req: { welding: 3 }, desc: "Frame work, high-strength steel." },
  { id: "paint1", name: "Body & Paint Prep", cost: 300, days: 2, skill: "painting", gain: 2, desc: "Sanding, priming, color matching." },
  { id: "paint2", name: "Custom Paint & Graphics", cost: 550, days: 3, skill: "painting", gain: 3, req: { painting: 3 }, desc: "Candy, flames, airbrush." },
  { id: "tune1", name: "Performance Tuning Intro", cost: 400, days: 2, skill: "tuning", gain: 2, desc: "Intake, exhaust, simple ECU." },
  { id: "tune2", name: "Forced Induction & Dyno", cost: 750, days: 4, skill: "tuning", gain: 3, req: { tuning: 3, mechanics: 5 }, desc: "Turbos, supers, boost control." },
  { id: "race1", name: "Driver Development", cost: 500, days: 3, skill: "racing", gain: 2, desc: "Line choice, braking points, car control." },
  { id: "biz1", name: "Shop Management", cost: 250, days: 2, skill: "business", gain: 2, desc: "Pricing, customers, inventory control." }
];

const TOOLS = [
  { id: "hand_jack", name: "Hand Jack", cost: 40, desc: "Basic scissor jack. Slow but works." },
  { id: "floor_jack", name: "Floor Jack", cost: 180, desc: "Faster lifts, safer under the car." },
  { id: "hydro_jack", name: "Hydraulic Shop Jack", cost: 450, desc: "Pro level. Handles heavy vehicles." },
  { id: "mig_welder", name: "MIG Welder", cost: 650, desc: "Essential for serious body & frame work." },
  { id: "paint_gun", name: "HVLP Paint Gun", cost: 320, desc: "Clean finish. Needs compressor (included)." },
  { id: "impact", name: "Impact Wrench Set", cost: 220, desc: "Speeds up every job." },
  { id: "scan_tool", name: "OBD Scan Tool", cost: 280, desc: "Read codes, live data. Modern cars need it." },
  { id: "torque", name: "Torque Wrench Kit", cost: 150, desc: "Precision assembly. Avoid stripped bolts." }
];

const PART_CATALOG = {
  engine_small: { name: "Small Block V8", baseWeight: 210, baseHP: 250, baseHandling: 0, basePrice: 1800, category: "engine" },
  engine_big: { name: "Big Block V8", baseWeight: 280, baseHP: 380, baseHandling: -2, basePrice: 3200, category: "engine" },
  turbo: { name: "Turbo Kit", baseWeight: 35, baseHP: 90, baseHandling: 0, basePrice: 1400, category: "forced" },
  supercharger: { name: "Supercharger", baseWeight: 45, baseHP: 110, baseHandling: -1, basePrice: 1800, category: "forced" },
  cold_air: { name: "Cold Air Intake", baseWeight: 5, baseHP: 12, baseHandling: 0, basePrice: 220, category: "intake" },
  exhaust: { name: "Performance Exhaust", baseWeight: 15, baseHP: 18, baseHandling: 0, basePrice: 450, category: "exhaust" },
  suspension: { name: "Sport Suspension", baseWeight: 20, baseHP: 0, baseHandling: 12, basePrice: 680, category: "chassis" },
  coilovers: { name: "Adjustable Coilovers", baseWeight: 25, baseHP: 0, baseHandling: 20, basePrice: 1200, category: "chassis" },
  brakes: { name: "Big Brake Kit", baseWeight: 18, baseHP: 0, baseHandling: 8, basePrice: 750, category: "brakes" },
  tires_street: { name: "Street Performance Tires", baseWeight: 40, baseHP: 0, baseHandling: 10, basePrice: 480, category: "tires" },
  tires_race: { name: "Racing Slicks / R-Comp", baseWeight: 35, baseHP: 0, baseHandling: 22, basePrice: 900, category: "tires" },
  steering: { name: "Quick Ratio Steering", baseWeight: 8, baseHP: 0, baseHandling: 6, basePrice: 320, category: "steering" },
  fenders: { name: "Lightweight Fenders", baseWeight: -12, baseHP: 0, baseHandling: 2, basePrice: 380, category: "body" },
  doors: { name: "Carbon Doors (pair)", baseWeight: -25, baseHP: 0, baseHandling: 1, basePrice: 1100, category: "body" },
  frame_brace: { name: "Chassis Brace / Cage", baseWeight: 40, baseHP: 0, baseHandling: 15, basePrice: 900, category: "chassis" },
  spark: { name: "Performance Spark Plugs", baseWeight: 0.5, baseHP: 5, baseHandling: 0, basePrice: 45, category: "ignition" },
  header: { name: "Long Tube Headers", baseWeight: 12, baseHP: 25, baseHandling: 0, basePrice: 650, category: "exhaust" }
};

const BASE_CARS = [
  { id: "camaro", brand: "Chevy", model: "Camaro SS", year: 1970, baseWeight: 1550, baseHP: 300, baseHandling: 45, price: 4500, color: "#cc2222" },
  { id: "mustang", brand: "Ford", model: "Mustang Boss", year: 1969, baseWeight: 1520, baseHP: 290, baseHandling: 48, price: 4800, color: "#2244aa" },
  { id: "challenger", brand: "Dodge", model: "Challenger R/T", year: 1971, baseWeight: 1600, baseHP: 320, baseHandling: 42, price: 5200, color: "#dd6600" }
];

const RACE_TYPES = [
  { id: "drag", name: "Drag Racing (1/4 mile)", focus: "power", payout: 1.4, damageChance: 0.15, desc: "Straight line. Horsepower and launch win." },
  { id: "dirt", name: "Dirt Track", focus: "handling", payout: 1.3, damageChance: 0.25, desc: "Loose surface. Traction and control matter." },
  { id: "short", name: "Short Track Oval", focus: "balanced", payout: 1.5, damageChance: 0.2, desc: "Tight turns, drafting, consistent speed." },
  { id: "road", name: "Road Course", focus: "handling", payout: 1.6, damageChance: 0.18, desc: "Elevation, braking zones, technical sections." },
  { id: "enduro", name: "Endurance (2hr)", focus: "reliability", payout: 2.0, damageChance: 0.35, desc: "Durability, fuel strategy, careful driving." }
];

const MS_PER_GAME_HOUR = 60 * 1000;
const MS_PER_GAME_DAY  = 24 * MS_PER_GAME_HOUR;

const MEDALS = [
  { id: "first_job", name: "First Paycheck", desc: "Complete any job", icon: "\ud83d\udcb5" },
  { id: "first_car", name: "Project Car", desc: "Buy your first project car", icon: "\ud83d\ude97" },
  { id: "first_race", name: "Rookie Racer", desc: "Enter your first race", icon: "\ud83c\udfc1" },
  { id: "first_win", name: "Winner's Circle", desc: "Win a race", icon: "\ud83c\udfc6" },
  { id: "mech5", name: "Skilled Hands", desc: "Reach Mechanics 5", icon: "\ud83d\udd27" },
  { id: "mech10", name: "Master Tech", desc: "Reach Mechanics 10", icon: "\ud83e\uddf0" },
  { id: "garage_pro", name: "Shop Owner", desc: "Reach Professional Garage", icon: "\ud83c\udfed" },
  { id: "enduro_win", name: "Endurance Champion", desc: "Win an Endurance race", icon: "\u23f1\ufe0f" },
  { id: "rich", name: "High Roller", desc: "Have $10,000 at once", icon: "\ud83d\udcb0" },
  { id: "junk_king", name: "Junkyard King", desc: "Buy 20 parts from the junkyard", icon: "\ud83c\udfda\ufe0f" },
  { id: "day30", name: "One Month In", desc: "Reach game day 30", icon: "\ud83d\udcc5" },
  { id: "all_skills", name: "Well Rounded", desc: "Have every skill at 3+", icon: "\u2b50" }
];

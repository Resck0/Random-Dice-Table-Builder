// Configuración de rutas
const IMG_PATH = "Pictures/Dices/";

const idMap = {
    "Nuclear": "nu", "Landmine": "lm", "Sand_Swamp": "ss", "Joker": "jk", "Holy_Sword": "hs", "Hell": "he", "Shield": "sh", "Blizzard": "bl", "Growth": "gr", "Summoner": "su", "Solar": "so", "Assassin": "as", "Atomic": "at", "Gun": "gu", "Typhoon": "ty", "Supplement": "sp", "Metastasis": "mt", "Time": "ti", "Combo": "co", "Lunar": "lu", "Flow": "fl", "Star": "st", "Ix10": "ix", "Silence": "sl", "Royal": "ro", "YinYang": "yy", "Scope": "sc", "Bubble": "bb", "Guardian": "gd", "Overheat": "oh", "Earthquake": "eq", "Timewinder": "tw", "Recharge": "rc", "Compression": "cp", "Lighting_Cloud": "lc", "Storm": "sm", "Ignition": "ig", "Gravity": "gv", "Rage": "rg", "Reverse": "rv", "Tsunami": "ts", "Phantom_Thief": "pt", "Predator": "pd", "Dimension": "di", "Soul": "soul", "Satellite_Strike": "sk", "Devil_Sword": "ds", "Variable": "va", "Giga_Switch": "gs", "Echo": "ec", "Monolith": "mo", "Forging": "fg", "Volcano": "vo", "Sealing": "sn", "Bastion": "ba", "Distortion": "dt", "Medusa": "me",
    "Death": "de", "Teleport": "tp", "Laser": "la", "Mimic": "mi", "Infect": "in", "Modified_Electric": "me_e", "Absorb": "ab", "Mighty_Wind": "mw", "Switch": "sw", "Gear": "ge", "Wave": "wa", "Flame": "fm", "Healing": "hl", "Clone": "cl", "Cracked_Growth": "cg", "Rock": "rk", "Bounty": "bo", "Speed_Gun": "sg", "Berserker": "bk", "Snowball": "sb", "Whim": "wm", "Pinball": "pb", "Solitude": "sd", "Exhaust": "ex", "Barrier": "br",
    "Mine": "mn", "Light": "li", "Thorn": "th", "Crack": "cr", "Critical": "ci", "Energy": "en", "Sacrifice": "sa", "Arrow": "ar", "Random_Growth": "rg_r", "Slingshot": "slin", "Sword": "swo", "Smite": "smi",
    "Fire": "fi", "Electric": "el", "Wind": "wi", "Poison": "po", "Ice": "ic", "Iron": "ir", "Broken": "bro", "Gamble": "ga", "Lock": "lo"
};

const revMap = Object.fromEntries(Object.entries(idMap).map(([k, v]) => [v, k]));

const diceData = {
    "Legendary": ["Nuclear", "Landmine", "Sand_Swamp", "Joker", "Holy_Sword", "Hell", "Shield", "Blizzard", "Growth", "Summoner", "Solar", "Assassin", "Atomic", "Gun", "Typhoon", "Supplement", "Metastasis", "Time", "Combo", "Lunar", "Flow", "Star", "Ix10", "Silence", "Royal", "YinYang", "Scope", "Bubble", "Guardian", "Overheat", "Earthquake", "Timewinder", "Recharge", "Compression", "Lighting_Cloud", "Storm", "Ignition", "Gravity", "Rage", "Reverse", "Tsunami", "Phantom_Thief", "Predator", "Dimension", "Soul", "Satellite_Strike", "Devil_Sword", "Variable", "Giga_Switch", "Echo", "Monolith", "Forging", "Volcano", "Sealing", "Bastion", "Distortion", "Medusa"],
    "Unique": ["Death", "Teleport", "Laser", "Mimic", "Infect", "Modified_Electric", "Absorb", "Mighty_Wind", "Switch", "Gear", "Wave", "Flame", "Healing", "Clone", "Cracked_Growth", "Rock", "Bounty", "Speed_Gun", "Berserker", "Snowball", "Whim", "Pinball", "Solitude", "Exhaust", "Barrier"],
    "Rare": ["Mine", "Light", "Thorn", "Crack", "Critical", "Energy", "Sacrifice", "Arrow", "Random_Growth", "Slingshot", "Sword", "Smite"],
    "Common": ["Fire", "Electric", "Wind", "Poison", "Ice", "Iron", "Broken", "Gamble", "Lock"]
};

const diceRoles = {
    shooters: ["fire", "electric", "wind", "poison", "ice", "broken", "gamble", "thorn", "crack", "energy", "arrow", "slingshot", "sword", "smite", "death", "teleport", "laser", "infect", "modified_electric", "absorb", "mighty_wind", "gear", "wave", "flame", "clone", "rock", "speed_gun", "berserker", "snowball", "whim", "pinball", "solitude", "holy_sword", "solar", "atomic", "gun", "typhoon", "combo", "star", "yinyang", "guardian", "overheat", "earthquake", "recharge", "compression", "rage", "soul", "forging", "volcano", "medusa"],
    damage: ["fire", "electric", "wind", "poison", "ice", "broken", "gamble", "thorn", "crack", "energy", "arrow", "slingshot", "sword", "smite", "death", "teleport", "laser", "infect", "modified_electric", "absorb", "mighty_wind", "gear", "wave", "flame", "clone", "rock", "speed_gun", "berserker", "snowball", "whim", "pinball", "solitude", "holy_sword", "solar", "atomic", "gun", "typhoon", "combo", "star", "yinyang", "guardian", "overheat", "earthquake", "recharge", "compression", "rage", "soul", "forging", "volcano", "medusa", "light"]
};

let selectedSlot = 0, activeDieImg = "", activeDieName = "";
let currentPOV = 'DPS';
let boardState = Array(15).fill(null);

// ── CATEGORÍA POR NOMBRE ──────────────────────────────────
const diceCategory = {};
for (const [cat, list] of Object.entries(diceData)) {
    list.forEach(name => diceCategory[name] = cat.toLowerCase());
}

function getDieCategory(name) {
    return diceCategory[name] || 'legendary';
}

// ── BUFFS ─────────────────────────────────────────────────
function updateBuffs() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(s => {
        s.style.boxShadow   = "none";
        s.style.borderColor = "#444";
        s.style.borderStyle = "dashed";
        s.style.borderWidth = "1px";

        const img = s.querySelector('img');
        if (!img) return;

        const type    = img.dataset.name.toLowerCase();
        const realIdx = parseInt(s.dataset.realIdx);
        const r = Math.floor(realIdx / 5), c = realIdx % 5;
        const neighbors = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];

        let b = { lunar:0, scope:0, hell:0, crit:0, light:0, bastion:0, total:0 };

        neighbors.forEach(p => {
            const nr = r + p.dr, nc = c + p.dc;
            if (nr >= 0 && nr < 3 && nc >= 0 && nc < 5) {
                const neighborDie = boardState[nr * 5 + nc];
                if (neighborDie) {
                    const nt = neighborDie.toLowerCase(); b.total++;
                    if (nt.includes('lunar'))    b.lunar++;
                    if (nt.includes('scope'))    b.scope++;
                    if (nt.includes('hell'))     b.hell++;
                    if (nt.includes('critical')) b.crit++;
                    if (nt.includes('light'))    b.light++;
                    if (nt.includes('bastion'))  b.bastion++;
                }
            }
        });

        const isS = diceRoles.shooters.includes(type), isD = diceRoles.damage.includes(type);
        let buffs = [];

        if ((type.includes('bastion') && b.total > 0) || b.bastion > 0) buffs.push({id:3, color:'#c4a484'});
        if (!type.includes('lunar') && isS && b.lunar > 0)              buffs.push({id:1, color:'#00fff2'});
        if (!type.includes('scope') && isS && b.scope > 0)              buffs.push({id:2, color:'#ff0000'});
        if (!type.includes('lunar') && !type.includes('scope') && isD && b.hell > 0)  buffs.push({id:4, color:'#999999'});
        if (!type.includes('lunar') && !type.includes('scope') && !type.includes('critical') && isD && b.crit > 0) buffs.push({id:5, color:'#ffae00'});
        if (!type.includes('lunar') && !type.includes('scope') && isD && b.light > 0) buffs.push({id:6, color:'#ffff00'});

        if (buffs.length > 0) {
            buffs.sort((a, b) => a.id - b.id);
            s.style.borderStyle = "solid";
            s.style.borderWidth = "2px";
            s.style.borderColor = buffs[0].color;

            const shadowStyles = buffs.map((bufo, index) => {
                if (index === 0) return `0 0 10px ${bufo.color}`;
                let offset = index * 4;
                let blur   = 8 - (index * 1.5);
                if (blur < 2) blur = 2;
                return `inset 0 0 ${blur}px ${offset}px ${bufo.color}`;
            });

            s.style.boxShadow = shadowStyles.join(", ");
        }
    });
}
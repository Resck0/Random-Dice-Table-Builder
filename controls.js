let currentLang = 'en';
let lastModDate = '';

// ── CATEGORÍA POR NOMBRE (independiente de logic.js) ─────
function getDieCategory(name) {
    if (!name) return 'legendary';
    const legendary = ["Nuclear","Landmine","Sand_Swamp","Joker","Holy_Sword","Hell","Shield","Blizzard","Growth","Summoner","Solar","Assassin","Atomic","Gun","Typhoon","Supplement","Metastasis","Time","Combo","Lunar","Flow","Star","Ix10","Silence","Royal","YinYang","Scope","Bubble","Guardian","Overheat","Earthquake","Timewinder","Recharge","Compression","Lighting_Cloud","Storm","Ignition","Gravity","Rage","Reverse","Tsunami","Phantom_Thief","Predator","Dimension","Soul","Satellite_Strike","Devil_Sword","Variable","Giga_Switch","Echo","Monolith","Forging","Volcano","Sealing","Bastion","Distortion","Medusa"];
    const unique    = ["Death","Teleport","Laser","Mimic","Infect","Modified_Electric","Absorb","Mighty_Wind","Switch","Gear","Wave","Flame","Healing","Clone","Cracked_Growth","Rock","Bounty","Speed_Gun","Berserker","Snowball","Whim","Pinball","Solitude","Exhaust","Barrier"];
    const rare      = ["Mine","Light","Thorn","Crack","Critical","Energy","Sacrifice","Arrow","Random_Growth","Slingshot","Sword","Smite"];
    if (legendary.includes(name)) return 'legendary';
    if (unique.includes(name))    return 'unique';
    if (rare.includes(name))      return 'rare';
    return 'common';
}

// ── LANGUAGE ─────────────────────────────────────────────
function setLanguage(lang) {
    try {
        if (typeof translations === 'undefined') return;
        currentLang = lang;
        const t = translations[lang];
        if (!t) return;

        document.getElementById('page-title').innerText         = t.title;
        document.getElementById('hand-label').innerText         = t.yourHand;
        document.getElementById('flip-text').innerText          = t.flipBoard;
        document.getElementById('btn-share').innerHTML          = t.copyLink;
        document.getElementById('btn-clear').innerText          = t.clearBoard;
        document.getElementById('diceSearch').placeholder       = t.searchPlaceholder;

        const label = document.getElementById('povLabel');
        label.innerText = currentPOV === 'DPS' ? t.dpsPov : t.suppPov;

        document.getElementById('footer-troubleshoot-title').innerText = t.troubleshootTitle;
        document.getElementById('footer-troubleshoot-text').innerHTML  = t.troubleshootText;
        document.getElementById('footer-contact-title').innerText      = t.contactTitle;
        document.getElementById('footer-contact-text').innerText       = t.contactText;
        document.getElementById('footer-contact-links').innerHTML      = t.contactLinks;
        document.getElementById('footer-thanks-title').innerText       = t.thanksTitle;
        document.getElementById('footer-thanks-text').innerHTML        = t.thanksText;

        if (lastModDate) {
            document.getElementById('update-date').innerText = t.lastUpdated + ' ' + lastModDate;
        }

        document.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.flag-btn[data-lang="${lang}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    } catch(e) {
        console.error('setLanguage error:', e);
    }
}

// ── HAND ─────────────────────────────────────────────────
function createHand() {
    const container = document.getElementById('playerHand');
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const div = document.createElement('div');
        div.className = `deck-slot ${i === 0 ? 'selected' : ''}`;
        div.onclick = () => pickSlot(i);
        div.innerHTML = `<img id="slot${i}" src="" data-name="" style="display:none">`;
        container.appendChild(div);
    }
}

// ── LIBRARY ──────────────────────────────────────────────
function buildLibrary() {
    const lib = document.getElementById('libContainer');
    lib.innerHTML = '';
    for (const [cat, list] of Object.entries(diceData)) {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<div class="category-title cat-${cat.toLowerCase()}">${cat}</div>`;
        const grid = document.createElement('div');
        grid.className = 'grid';
        list.forEach(name => {
            const item = document.createElement('div');
            item.className = 'lib-item';
            item.innerHTML = `<img src="${IMG_PATH}70px-${name}_Dice.png" title="${name}">`;
            item.onclick = () => {
                const slot = document.getElementById(`slot${selectedSlot}`);
                slot.src           = `${IMG_PATH}70px-${name}_Dice.png`;
                slot.dataset.name  = name;
                slot.className     = `die-${getDieCategory(name)}`;
                slot.style.display = "block";
                activeDieImg  = slot.src;
                activeDieName = name;
            };
            grid.appendChild(item);
        });
        section.appendChild(grid);
        lib.appendChild(section);
    }
}

// ── BOARD ─────────────────────────────────────────────────
function renderBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    let displayIndices = currentPOV === 'DPS'
        ? [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]
        : [10,11,12,13,14,5,6,7,8,9,0,1,2,3,4];

    displayIndices.forEach(realIdx => {
        const s = document.createElement('div');
        s.className       = 'slot';
        s.dataset.realIdx = realIdx;
        const die = boardState[realIdx];
        if (die) {
            const cat = getDieCategory(die);
            s.innerHTML = `<img src="${IMG_PATH}70px-${die}_Dice.png" data-name="${die}" class="die-${cat}">`;
        }
        s.onclick = () => {
            if (!activeDieName) return;
            boardState[realIdx] = (boardState[realIdx] === activeDieName) ? null : activeDieName;
            renderBoard();
        };
        boardDiv.appendChild(s);
    });
    updateBuffs();
}

// ── POV TOGGLE ───────────────────────────────────────────
function togglePOV() {
    currentPOV = currentPOV === 'DPS' ? 'SUPP' : 'DPS';
    const label = document.getElementById('povLabel');
    const t = (typeof translations !== 'undefined') ? translations[currentLang] : null;
    label.innerText = currentPOV === 'DPS'
        ? (t ? t.dpsPov : 'DPS POV')
        : (t ? t.suppPov : 'SUPP POV');
    label.className = `pov-indicator ${currentPOV === 'DPS' ? 'pov-dps' : 'pov-supp'}`;
    document.getElementById('flipCard').classList.toggle('rotated');
    renderBoard();
}

// ── SLOT SELECTION ───────────────────────────────────────
function pickSlot(i) {
    selectedSlot  = i;
    const img     = document.getElementById(`slot${i}`);
    activeDieImg  = img.src || "";
    activeDieName = img.dataset.name || "";
    document.querySelectorAll('.deck-slot').forEach((s, idx) =>
        s.classList.toggle('selected', idx === i)
    );
}

// ── SEARCH ───────────────────────────────────────────────
function filterDice() {
    const query = document.getElementById('diceSearch').value.toLowerCase();
    document.querySelectorAll('.lib-item img').forEach(img => {
        img.parentElement.style.display = img.title.toLowerCase().includes(query) ? "block" : "none";
    });
    document.querySelectorAll('.category-section').forEach(sec => {
        const hasVisible = Array.from(sec.querySelectorAll('.lib-item')).some(i => i.style.display !== "none");
        sec.style.display = hasVisible ? "block" : "none";
    });
}

// ── SHARE LINK ───────────────────────────────────────────
function copyShareLink() {
    const hand = [];
    for (let i = 0; i < 5; i++)
        hand.push(idMap[document.getElementById(`slot${i}`).dataset.name] || "x");
    const bData = boardState.map(name => idMap[name] || "x");
    const url   = new URL(window.location.href);
    url.searchParams.set('b', hand.join('.') + '|' + bData.join('.'));
    const msg = (typeof translations !== 'undefined') ? translations[currentLang].linkCopied : 'Link Copied!';
    navigator.clipboard.writeText(url.href).then(() => alert(msg));
}

// ── LOAD FROM URL ────────────────────────────────────────
function loadFromUrl() {
    const bData = new URLSearchParams(window.location.search).get('b');
    if (!bData) return false;
    const [hPart, bPart] = bData.split('|');
    hPart.split('.').forEach((id, i) => {
        const name = revMap[id];
        if (name) {
            const img        = document.getElementById(`slot${i}`);
            img.src          = `${IMG_PATH}70px-${name}_Dice.png`;
            img.dataset.name = name;
            img.className    = `die-${getDieCategory(name)}`;
            img.style.display = "block";
        }
    });
    bPart.split('.').forEach((id, i) => { boardState[i] = revMap[id] || null; });
    renderBoard();
    return true;
}

// ── DEFAULT HAND ─────────────────────────────────────────
function setDefaultHand() {
    ["Distortion","Lunar","Holy_Sword","Scope","Snowball"].forEach((name, i) => {
        const img        = document.getElementById(`slot${i}`);
        img.src          = `${IMG_PATH}70px-${name}_Dice.png`;
        img.dataset.name = name;
        img.className    = `die-${getDieCategory(name)}`;
        img.style.display = "block";
    });
    pickSlot(0);
}

// ── RESET ────────────────────────────────────────────────
function resetBoard() { boardState = Array(15).fill(null); renderBoard(); }

// ── INIT ─────────────────────────────────────────────────
window.onload = () => {
    createHand();
    buildLibrary();
    if (!loadFromUrl()) { setDefaultHand(); renderBoard(); }

    const lastMod = new Date(document.lastModified);
    const options = { month:'long', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false };
    lastModDate = lastMod.toLocaleString('en-US', options);

    setLanguage('en');
};
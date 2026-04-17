function createHand() {
    const container = document.getElementById('playerHand');
    container.innerHTML = '';
    for(let i = 0; i < 5; i++) {
        const div = document.createElement('div');
        div.className = `deck-slot ${i === 0 ? 'selected' : ''}`;
        div.onclick = () => pickSlot(i);
        div.innerHTML = `<img id="slot${i}" src="" data-name="" style="display:none">`;
        container.appendChild(div);
    }
}

function buildLibrary() {
    const lib = document.getElementById('libContainer');
    lib.innerHTML = '';
    for (const [cat, list] of Object.entries(diceData)) {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<div class="category-title cat-${cat.toLowerCase()}">${cat}</div>`;
        const grid = document.createElement('div'); grid.className = 'grid';
        list.forEach(name => {
            const item = document.createElement('div');
            item.className = 'lib-item';
            // Ruta actualizada
            item.innerHTML = `<img src="${IMG_PATH}70px-${name}_Dice.png" title="${name}">`;
            item.onclick = () => {
                const slot = document.getElementById(`slot${selectedSlot}`);
                slot.src = `${IMG_PATH}70px-${name}_Dice.png`;
                slot.dataset.name = name;
                slot.style.display = "block";
                activeDieImg = slot.src;
                activeDieName = name;
            };
            grid.appendChild(item);
        });
        section.appendChild(grid); lib.appendChild(section);
    }
}

function renderBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    let displayIndices = currentPOV === 'DPS' ? [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14] : [10,11,12,13,14,5,6,7,8,9,0,1,2,3,4];

    displayIndices.forEach(realIdx => {
        const s = document.createElement('div');
        s.className = 'slot';
        s.dataset.realIdx = realIdx;
        const die = boardState[realIdx];
        if (die) s.innerHTML = `<img src="${IMG_PATH}70px-${die}_Dice.png" data-name="${die}">`;
        s.onclick = () => {
            if (!activeDieName) return;
            boardState[realIdx] = (boardState[realIdx] === activeDieName) ? null : activeDieName;
            renderBoard();
        };
        boardDiv.appendChild(s);
    });
    updateBuffs();
}

function togglePOV() {
    const label = document.getElementById('povLabel');
    currentPOV = currentPOV === 'DPS' ? 'SUPP' : 'DPS';
    label.innerText = `${currentPOV} POV`;
    label.className = `pov-indicator ${currentPOV === 'DPS' ? 'pov-dps' : 'pov-supp'}`;
    document.getElementById('flipCard').classList.toggle('rotated');
    renderBoard();
}

function pickSlot(i) {
    selectedSlot = i;
    const img = document.getElementById(`slot${i}`);
    activeDieImg = img.src || "";
    activeDieName = img.dataset.name || "";
    document.querySelectorAll('.deck-slot').forEach((s, idx) => s.classList.toggle('selected', idx === i));
}

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

function copyShareLink() {
    const hand = [];
    for(let i=0; i<5; i++) hand.push(idMap[document.getElementById(`slot${i}`).dataset.name] || "x");
    const bData = boardState.map(name => idMap[name] || "x");
    const url = new URL(window.location.href);
    url.searchParams.set('b', hand.join('.') + '|' + bData.join('.'));
    navigator.clipboard.writeText(url.href).then(() => alert("Link Copied!"));
}

function loadFromUrl() {
    const bData = new URLSearchParams(window.location.search).get('b');
    if (!bData) return false;
    const [hPart, bPart] = bData.split('|');
    hPart.split('.').forEach((id, i) => {
        const name = revMap[id];
        if (name) {
            const img = document.getElementById(`slot${i}`);
            img.src = `${IMG_PATH}70px-${name}_Dice.png`; img.dataset.name = name; img.style.display = "block";
        }
    });
    bPart.split('.').forEach((id, i) => { boardState[i] = revMap[id] || null; });
    renderBoard();
    return true;
}

function setDefaultHand() {
    ["Distortion", "Lunar", "Holy_Sword", "Scope", "Snowball"].forEach((name, i) => {
        const img = document.getElementById(`slot${i}`);
        img.src = `${IMG_PATH}70px-${name}_Dice.png`; img.dataset.name = name; img.style.display = "block";
    });
    pickSlot(0);
}

function resetBoard() { boardState = Array(15).fill(null); renderBoard(); }

window.onload = () => {
    createHand(); buildLibrary(); 
    if (!loadFromUrl()) { setDefaultHand(); renderBoard(); }
    const lastMod = new Date(document.lastModified);
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    document.getElementById('update-date').innerText = "Last Updated: " + lastMod.toLocaleString('en-US', options);
};